var notify = require('./notify.js');

var act = {
  reason: {},

  getObj: function(options) {
    var obj = JSON.parse(localStorage.bb);

    if (options && options.length > 0) {
      options.forEach(function(opt) {
        if (!obj[opt.name]) {
          obj[opt.name] = opt.value;
          main.setObj(obj);
        }
      });
    }

    return obj;
  },

  setObj: function(obj) {
    localStorage.bb = JSON.stringify(obj);
  },

  load: function(callback) {
    var r = Math.random();
    $.getJSON("action-plan.json?v=" + r, function(file) {
      act.plan = file.diseases;
      act.text = file.plans;
      callback();
    });
  },

  editAction: function(id, actionId, agree, done, reason) {
    var log, obj = act.getObj([{
      name: "actions",
      value: {}
    }]);
    if (!id) alert("ACTION TEAM/IND ID");
    if (!actionId) alert("ACTION ID");

    if (!obj.actions[id]) {
      obj.actions[id] = {};
    }


    if (agree) {
      log = "You agreed with this suggested action on " + (new Date()).toDateString();
    } else if (agree === false) {
      var reasonText = act.reason.reason === "" && act.reason.reasonText === "" ? " - no reason given" : " . You disagreed because you said: '" + act.reason.reason + "; " + act.reason.reasonText + ".'";
      log = "You disagreed with this action on " + (new Date()).toDateString() + reasonText;
    }

    if (done) {
      log = "You agreed with this suggested action on " + (new Date()).toDateString();
    }

    if (!obj.actions[id][actionId]) {
      obj.actions[id][actionId] = {
        "agree": agree ? agree : false,
        "done": done ? done : false,
        "history": [log]
      };
    } else {
      if (agree === true || agree === false) obj.actions[id][actionId].agree = agree;
      if (done === true || done === false) obj.actions[id][actionId].done = done;
      if (log) {
        if (obj.actions[id][actionId].history) obj.actions[id][actionId].history.unshift(log);
        else obj.actions[id][actionId].done.history = [log];
      }
    }

    if (reason && obj.actions[id][actionId].agree === false) {
      obj.actions[id][actionId].reason = reason;
    } else {
      delete obj.actions[id][actionId].reason;
    }

    act.setObj(obj);
    notify.showSaved();
  },

  ignoreAction: function(id, actionId) {
    var obj = act.getObj([{
      name: "actions",
      value: {}
    }]);
    obj.actions[id][actionId].agree = null;
    delete obj.actions[id][actionId].reason;
    act.setObj(obj);
  },

  getActions: function() {
    return act.getObj([{
      name: "actions",
      value: {}
    }]).actions;
  },

  listActions: function(id, pathwayId) {
    var obj = act.getObj([{
      name: "actions",
      value: {}
    }]);
    arr = [];
    if (!id) return obj.actions;
    if (!obj.actions[id]) return arr;
    for (var prop in obj.actions[id]) {
      obj.actions[id][prop].id = prop;
      if (!obj.actions[id][prop].text)
        arr.push(obj.actions[id][prop]);
    }
    return arr;
  },

  //id is either "team" or the patientId
  recordFeedback: function(pathwayId, id, suggestion, reason, reasonText) {
    act.reason = {
      "reason": reason,
      "reasonText": reasonText
    };
    var obj = act.getObj([{
      name: "feedback",
      value: []
    }]);

    var item = {
      "pathwayId": pathwayId,
      "id": id,
      "val": suggestion
    };
    if (reasonText !== "") item.reasonText = reasonText;
    if (reason !== "") item.reason = reason;
    obj.feedback.push(item);
    act.setObj(obj);
  },

  getEvents: function() {
    return act.getObj([{
      name: "events",
      value: []
    }]).events;
  },

  recordEvent: function(pathwayId, id, name) {
    var obj = act.getObj([{
      name: "events",
      value: []
    }]);
    obj.events.push({
      "pathwayId": pathwayId,
      "id": id,
      "name": name,
      "date": new Date()
    });
    act.setObj(obj);
  },

  recordPlan: function(id, text, pathwayId) {
    if (!id) alert("PLAN");
    var obj = act.getObj([{
      name: "actions",
      value: {}
    }]);

    if (!obj.actions[id]) obj.actions[id] = {};
    var planId = Date.now() + "";
    obj.actions[id][planId] = {
      "text": text,
      "agree": null,
      "done": false,
      "pathwayId": pathwayId,
      "history": ["You added this on " + (new Date()).toDateString()]
    };

    act.setObj(obj);
    return planId;
  },

  findPlan: function(obj, planId) {
    for (var k in obj.actions) {
      if (obj.actions[k][planId] && obj.actions[k][planId].text) return k;
    }
    return -1;
  },

  editPlan: function(planId, text, done) {
    var obj = act.getObj([{
      name: "actions",
      value: {}
    }]);
    var id = act.findPlan(obj, planId);
    if (text) obj.actions[id][planId].text = text;
    if (done === true || done === false) obj.actions[id][planId].done = done;
    act.setObj(obj);
  },

  deletePlan: function(planId) {
    var obj = act.getObj([{
      name: "actions",
      value: {}
    }]);
    var id = act.findPlan(obj, planId);
    delete obj.actions[id][planId];
    act.setObj(obj);
  },

  listPlans: function(id, pathwayId) {
    var obj = act.getObj([{
        name: "actions",
        value: {}
      }]),
      arr = [];
    if (!id) return obj.actions;
    for (var prop in obj.actions[id]) {
      obj.actions[id][prop].id = prop;
      if ((!pathwayId || pathwayId === obj.actions[id][prop].pathwayId) && obj.actions[id][prop].text) arr.push(obj.actions[id][prop]);
    }
    return arr;
  },

  getReason: function(id, actionId) {
    var obj = act.getObj([{
      name: "actions",
      value: {}
    }]);

    if (obj.actions[id] && obj.actions[id][actionId]) return obj.actions[id][actionId].reason;
    return null;
  },

  getAgreeReason: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = act.getObj([{
      name: "agrees",
      value: {}
    }]);
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    return items.length === 1 ? items[0].reason || {} : {};
  },

  editPatientAgree: function(pathwayId, pathwayStage, standard, patientId, item, agree, reason) {
    var obj = act.getObj();
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    var log = "You " + (agree ? "" : "dis") + "agreed with this on " + (new Date()).toDateString();

    if (items.length === 1) {
      items[0].agree = agree;
      items[0].history.push(log);
      items[0].reason = reason;
    } else if (items.length === 0) {
      obj.agrees[patientId].push({
        "pathwayId": pathwayId,
        "pathwayStage": pathwayStage,
        "standard": standard,
        "item": item,
        "agree": agree,
        "reason": reason,
        "history": [log]
      });
    } else {
      console.log("ERRORRR!!!!!!!");
    }

    act.setObj(obj);
    notify.showSaved();
  },

  getAgrees: function(){
    return act.getObj([{
      name: "agrees",
      value: {}
    }]).agrees;
  },

  getPatientAgreeObject: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = act.getObj([{
      name: "agrees",
      value: {}
    }]);
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });
    if (items.length === 1) return items[0];
    return {};
  },

  getPatientAgree: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = act.getObj([{
      name: "agrees",
      value: {}
    }]);

    if (!obj.agrees[patientId]) return null;
    var item2 = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    if (item.length === 1) {
      return item[0].agree;
    }
    return null;
  }

};

module.exports = act;
