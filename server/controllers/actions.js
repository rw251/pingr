var Action = require('../models/action');

module.exports = {

  //Get list of actions for a single practice
  list: function(practiceId, done) {
    Action.find({ practiceId: practiceId }, function(err, actions) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding action list for practice: " + practiceId));
      }
      if (!actions) {
        console.log('Error finding action list for practice:  ' + practiceId);
        return done(null, false);
      } else {
        done(null, actions);
      }
    });
  },

  updateTeam: function(practiceId, indicatorId, updatedAction, done) {
    Action.findOne({ practiceId: practiceId, indicatorId: indicatorId, actionTextId: updatedAction.actionTextId }, function(err, action) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding team action for practice: " + practiceId + " and indicator " + indicatorId + " and actionTextId " + updatedAction.actionTextId));
      }
      if (!action) {
        action = new Action({
          practiceId: practiceId,
          indicatorId: indicatorId
        });
      }

      Object.keys(updatedAction).forEach(function(v){
        action[v] = updatedAction[v];
      });
      action.save(function(err, act) {
        if (err) {
          console.log("error updating team action");
          return done(err);
        } else {
          return done(null, act);
        }
      });
    });
  },

  updateIndividual: function(practiceId, patientId, updatedAction, done) {
    Action.findOne({ practiceId: practiceId, patientId: patientId, actionTextId: updatedAction.actionTextId }, function(err, action) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding individual action for practice: " + practiceId + " and patient " + patientId + " and actionTextId " + updatedAction.actionTextId));
      }
      if (!action) {
        action = new Action({
          practiceId: practiceId,
          patientId: patientId
        });
      }
      Object.keys(updatedAction).forEach(function(v){
        action[v] = updatedAction[v];
      });
      action.save(function(err, act) {
        if (err) {
          console.log("error updating individual action");
          return done(err);
        } else {
          return done(null, act);
        }
      });
    });
  },

  getTeam: function(practiceId, indicatorId, done) {
    Action.find({ practiceId: practiceId, indicatorId: indicatorId }, function(err, actions) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding team action list for practice: " + practiceId + " and indicator " + indicatorId));
      }
      if (!actions) {
        console.log('Error finding team action list for practice:  ' + practiceId + " and indicator " + indicatorId);
        return done(null, false);
      } else {
        done(null, actions);
      }
    });
  },

  getIndividual: function(practiceId, patientId, done) {
    Action.find({ practiceId: practiceId, patientId: patientId }, function(err, actions) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding individual action list for practice: " + practiceId+ " and patient " + patientId));
      }
      if (!actions) {
        console.log('Error finding individual action list for practice:  ' + practiceId+ " and patient " + patientId);
        return done(null, false);
      } else {
        done(null, actions);
      }
    });
  },

  addTeamAction: function(practiceId, indicatorId, username, actionText, done) {
    var action = new Action({
      practiceId: practiceId,
      indicatorId: indicatorId,
      actionTextId: actionText.toLowerCase().replace(/[^a-z0-9]/g, ""),
      actionText: actionText,
      history: [username + " added this action on " + new Date()],
      userDefined: true,
      done: false
    });

    // save the event
    action.save(function(err, act) {
      if (err) {
        return done(err);
      } else {
        return done(null, act);
      }
    });
  },

  addIndividualAction: function(practiceId, patientId, username, actionText, done) {
    var action = new Action({
      practiceId: practiceId,
      patientId: patientId,
      actionTextId: actionText.toLowerCase().replace(/[^a-z0-9]/g, ""),
      actionText: actionText,
      history: [username + " added this action on " + new Date()],
      userDefined: true,
      done: false
    });

    // save the event
    action.save(function(err, act) {
      if (err) {
        return done(err);
      } else {
        return done(null, act);
      }
    });
  },

};
