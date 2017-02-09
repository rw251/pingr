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
