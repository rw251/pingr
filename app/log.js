var notify = require('./notify'),
  data = require('./data');

var log = {
  reason: {},

  navigate: function (toUrl, data) {
    log.event("navigate", toUrl, data);
  },

  event: function (type, url, data) {
    var dataToSend = { event: { type: type, url: url, data: data } };
    $.ajax({
      type: "POST",
      url: "/api/event",
      data: JSON.stringify(dataToSend),
      success: function (d) { console.log(d); },
      dataType: "json",
      contentType: "application/json"
    });
  },

  excludePatient: function (practiceId, patientId, indicatorId, reason, freetext) {
    var obj = {
      practiceId: practiceId,
      patientId: patientId, 
      indicatorId: indicatorId, 
      reason: reason, 
      freetext: freetext, 
      who: $('#user_fullname').text(), 
      when: Date.now()
    }
    if (!data.excludedPatients[patientId]) {
      data.excludedPatients[patientId] = [obj];
    } else {
      data.excludedPatients[patientId].push(obj);
    }
    if (!data.excludedPatientsByIndicator[indicatorId]) {
      data.excludedPatientsByIndicator[indicatorId] = [patientId];
    } else {
      data.excludedPatientsByIndicator[indicatorId].push(patientId);
    }
    
    $.ajax({
      type: "POST",
      url: "/api/exclude/patient/" + patientId + "/for/indicator/" + indicatorId + "/practice/" + practiceId,
      data: JSON.stringify({ reason: reason, freetext: freetext }),
      success: function () {

      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  includePatient: function (practiceId, patientId, indicatorId) {
    if (data.excludedPatients[patientId]) {
      data.excludedPatients[patientId] = data.excludedPatients[patientId].filter(function (v) {
        return v.indicatorId !== indicatorId;
      });
    }
    if(data.excludedPatientsByIndicator[indicatorId]) {
      data.excludedPatientsByIndicator[indicatorId] = data.excludedPatientsByIndicator[indicatorId].filter(function (v) {
        return v !== patientId;
      });
    }
    $.ajax({
      type: "POST",
      url: "/api/include/patient/" + patientId + "/for/indicator/" + indicatorId + "/practice/" + practiceId,
      success: function () {

      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  //rwhere
  recordIndividualPlan: function (text, practiceId, patientId, indicatorList, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/addIndividual/" + practiceId + "/" + patientId,
      data: JSON.stringify({ actionText: text, indicatorList: indicatorList }),
      success: function (action) {
        notify.showSaved();
        data.addOrUpdatePatientAction(patientId, action);
        return done(null, action);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  //rwhere
  deleteUserDefinedPatientAction: function (patientId, actionTextId, done) {
    $.ajax({
      type: "DELETE",
      url: "/api/action/userdefinedpatient/" + patientId + "/" + actionTextId,
      success: function (d) {
        notify.showSaved();
        data.removePatientAction(patientId, actionTextId);
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  //rwhere
  updateIndividualAction: function (practiceId, patientId, updatedAction, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/individual/" + practiceId + "/" + patientId,
      data: JSON.stringify({ action: updatedAction }),
      success: function (action) {
        notify.showSaved();
        if (action.agree === true) {
          data.addOrUpdatePatientAction(patientId, action);
        } else if (action.agree === false) {
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

  updateTeamAction: function (practiceId, indicatorId, data, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/team/" + practiceId + "/" + indicatorId,
      data: JSON.stringify({ action: data }),
      success: function (d) {
        notify.showSaved();
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  updateUserDefinedPatientAction: function (patientId, actionTextId, data, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/userdefinedpatient/" + patientId + "/" + actionTextId,
      data: JSON.stringify({ action: data }),
      success: function (d) {
        notify.showSaved();
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  deleteUserDefinedTeamAction: function (actionTextId, done) {
    $.ajax({
      type: "DELETE",
      url: "/api/action/userdefinedteam/" + actionTextId,
      success: function (d) {
        notify.showSaved();
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  updateUserDefinedTeamAction: function (actionTextId, data, done) {
    $.ajax({
      type: "POST",
      url: "/api/action/update/userdefinedteam/" + actionTextId,
      data: JSON.stringify({ action: data }),
      success: function (d) {
        notify.showSaved();
        if (done) return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  recordTeamPlan: function (practiceId, text, indicatorId, done) {
    var url = "/api/action/addTeam/" + practiceId + "/" + (indicatorId || "");
    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify({ actionText: text }),
      success: function (d) {
        notify.showSaved();
        return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  }

};

module.exports = log;
