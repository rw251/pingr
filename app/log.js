var notify = require('./notify'),
  data = require('./data');

var log = {
  reason: {},

  navigate: function(toUrl, data) {
    log.event("navigate", toUrl, data);
  },

  event: function(type, url, data) {
    var dataToSend = { event: { type: type, url: url, data: data } };
    $.ajax({
      type: "POST",
      url: "/api/event",
      data: JSON.stringify(dataToSend),
      success: function(d) { console.log(d); },
      dataType: "json",
      contentType: "application/json"
    });
  },

  getObj: function(options) {
    var obj = JSON.parse(localStorage.bb);

    if (options && options.length > 0) {
      options.forEach(function(opt) {
        if (!obj[opt.name]) {
          obj[opt.name] = opt.value;
          log.setObj(obj);
        }
      });
    }

    return obj;
  },

  setObj: function(obj) {
    localStorage.bb = JSON.stringify(obj);
  },

  /*loadActions: function(callback) {
    var r = Math.random();
    log.text = [];
    callback();*/
    /*$.getJSON("action-plan.json?v=" + r, function(file) {
      log.plan = file.diseases;
      log.text = file.plans;
      callback();
    });*/
  /*},*/

  editAction: function(id, actionId, agree, done, reason) {
    var logText, obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    if (!id) alert("ACTION TEAM/IND ID");
    if (!actionId) alert("ACTION ID");

    if (!obj.actions[id]) {
      obj.actions[id] = {};
    }

    var dataToSend = [
      { key: "patient", "value": id },
      { key: "action", "value": actionId }
    ];
    var accction = "agree";

    if (agree) {
      logText = "You agreed with this suggested action on " + (new Date()).toDateString();
    } else if (agree === false) {
      var reasonText = log.reason.reason === "" && log.reason.reasonText === "" ? " - no reason given" : " . You disagreed because you said: '" + log.reason.reason + "; " + log.reason.reasonText + ".'";
      logText = "You disagreed with this action on " + (new Date()).toDateString() + reasonText;

      accction = "disagree";
      if (reason && reason.reason) dataToSend.push({ key: "reason", value: reason.reason });
      if (reason && reason.reasonText) dataToSend.push({ key: "reasonText", value: reason.reasonText });
    }

    if (agree || agree === false) {
      log.event(accction, window.location.hash, dataToSend);
    }

    if (done) {
      logText = "You agreed with this suggested action on " + (new Date()).toDateString();
    }

    if (!obj.actions[id][actionId]) {
      obj.actions[id][actionId] = {
        "agree": agree ? agree : false,
        "done": done ? done : false,
        "history": [logText]
      };
    } else {
      if (agree === true || agree === false) obj.actions[id][actionId].agree = agree;
      if (done === true || done === false) obj.actions[id][actionId].done = done;
      if (logText) {
        if (obj.actions[id][actionId].history) obj.actions[id][actionId].history.unshift(logText);
        else obj.actions[id][actionId].done.history = [logText];
      }
    }

    if (reason && obj.actions[id][actionId].agree === false) {
      obj.actions[id][actionId].reason = reason;
    } else {
      delete obj.actions[id][actionId].reason;
    }

    log.setObj(obj);
    notify.showSaved();
  },

  ignoreAction: function(id, actionId) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    var dataToSend = [
      { key: "patient", "value": id },
      { key: "action", "value": actionId }
    ];
    log.event(obj.actions[id][actionId].agree ? "undo-agree" : "undo-disagree", window.location.hash, dataToSend);
    obj.actions[id][actionId].agree = null;
    delete obj.actions[id][actionId].reason;
    log.setObj(obj);
  },

  getActions: function() {
    return log.getObj([{
      name: "actions",
      value: {}
    }]).actions;
  },

  getIndividualActions: function(patientId, done) {
    $.ajax({
      type: "GET",
      url: "/api/action/individual/" + patientId,
      success: function(d) {
        return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  //rwhere
  recordIndividualPlan: function(text, patientId, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/addIndividual/" + patientId,
      data: JSON.stringify({ actionText: text }),
      success: function(action) {
        data.addOrUpdatePatientAction(patientId, action);
        return done(null, action);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

//rwhere
  deleteUserDefinedPatientAction: function(patientId, actionTextId, done){
    $.ajax({
      type: "DELETE",
      url: "/api/action/userdefinedpatient/" + patientId + "/" + actionTextId,
      success: function(d) {
        data.removePatientAction(patientId, actionTextId);
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

//rwhere
  updateIndivdualAction: function(patientId, updatedAction, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/individual/" + patientId,
      data: JSON.stringify({ action: updatedAction }),
      success: function(action) {
        if(action.agree===true) {
          data.addOrUpdatePatientAction(patientId, action);
        } else if(action.agree===false){
          data.addOrUpdatePatientAction(patientId, action);
        } else {
          data.removePatientAction(patientId, action.actionTextId);
        }
        if (done) return done(null, action);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  updateTeamAction: function(indicatorId, data, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/team/" + indicatorId,
      data: JSON.stringify({ action: data }),
      success: function(d) {
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  updateUserDefinedPatientAction: function(patientId, actionTextId, data, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/userdefinedpatient/" + patientId + "/" + actionTextId,
      data: JSON.stringify({ action: data }),
      success: function(d) {
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  deleteUserDefinedTeamAction: function(actionTextId, done){
    $.ajax({
      type: "DELETE",
      url: "/api/action/userdefinedteam/" + actionTextId,
      success: function(d) {
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  updateUserDefinedTeamAction: function(actionTextId, data, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/userdefinedteam/" + actionTextId,
      data: JSON.stringify({ action: data }),
      success: function(d) {
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  listActions: function(id, pathwayId) {
    var obj = log.getObj([{
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
    log.reason = {
      "reason": reason,
      "reasonText": reasonText
    };
    var obj = log.getObj([{
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
    log.setObj(obj);
  },

  getEvents: function() {
    return log.getObj([{
      name: "events",
      value: []
    }]).events;
  },

  recordEvent: function(pathwayId, id, name) {
    var obj = log.getObj([{
      name: "events",
      value: []
    }]);
    obj.events.push({
      "pathwayId": pathwayId,
      "id": id,
      "name": name,
      "date": new Date()
    });
    log.setObj(obj);
  },

  recordTeamPlan: function(text, indicatorId, done) {
    var url = "/api/action/addTeam/" + (indicatorId || "");
    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify({ actionText: text }),
      success: function(d) {
        return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  findPlan: function(obj, planId) {
    for (var k in obj.actions) {
      if (obj.actions[k][planId] && obj.actions[k][planId].text) return k;
    }
    return -1;
  },

  editPlan: function(planId, text, done) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    var id = log.findPlan(obj, planId);
    if (text) obj.actions[id][planId].text = text;
    if (done === true || done === false) obj.actions[id][planId].done = done;
    log.setObj(obj);
  },

  deletePlan: function(planId) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    var id = log.findPlan(obj, planId);
    delete obj.actions[id][planId];
    log.setObj(obj);
  },

  listPlans: function(id, pathwayId) {
    var obj = log.getObj([{
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
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);

    if (obj.actions[id] && obj.actions[id][actionId]) return obj.actions[id][actionId].reason;
    return null;
  },

  getAgreeReason: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = log.getObj([{
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
    var obj = log.getObj();
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    var logText = "You " + (agree ? "" : "dis") + "agreed with this on " + (new Date()).toDateString();

    if (items.length === 1) {
      items[0].agree = agree;
      items[0].history.push(logText);
      items[0].reason = reason;
    } else if (items.length === 0) {
      obj.agrees[patientId].push({
        "pathwayId": pathwayId,
        "pathwayStage": pathwayStage,
        "standard": standard,
        "item": item,
        "agree": agree,
        "reason": reason,
        "history": [logText]
      });
    } else {
      console.log("ERRORRR!!!!!!!");
    }

    log.setObj(obj);
    notify.showSaved();
  },

  getAgrees: function() {
    return log.getObj([{
      name: "agrees",
      value: {}
    }]).agrees;
  },

  getPatientAgreeObject: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = log.getObj([{
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
    var obj = log.getObj([{
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

module.exports = log;
