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
  updateIndividualAction: function(patientId, updatedAction, done) {
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
  }

};

module.exports = log;
