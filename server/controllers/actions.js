var Action = require('../models/action');

var _updateAction = function(action, updatedAction, callback) {
  Object.keys(updatedAction).forEach(function(v) {
    if(v==="_id") return;
    action[v] = updatedAction[v];
  });
  action.save(function(err, act) {
    if (err) {
      console.log("error updating team action");
      return callback(err);
    } else {
      return callback(null, act);
    }
  });
};

module.exports = {

  //Get list of actions for a single practice
  list: function(practiceId, done) {
    Action.find({ practiceId: practiceId }, function(err, actions) {
      //TEMP fix
      actions = actions.map(function(v){
        if(v.history) {
          v.history = v.history.filter(function(v){
            return v.who;
          });
          if(v.history.length===0) v.history=null;
        }
        return v;
      });
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

  listAgreedWith: function(practiceId, done){
    Action.find({ practiceId: practiceId, $or: [{agree: true},{userDefined:true}] }, function(err, actions) {
      //TEMP fix
      actions = actions.map(function(v){
        if(v.history) {
          v.history = v.history.filter(function(v){
            return v.who;
          });
          if(v.history.length===0) v.history=null;
        }
        return v;
      });
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

  updatePatientUserDefined: function(patientId, actionTextId, updatedAction, done) {
    Action.findOne({ actionTextId: actionTextId, patientId:patientId, userDefined: true }, function(err, action) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding patient user defined actions for  " + actionTextId));
      }
      if (!action) {
        return done(null, false);
      }

      _updateAction(action, updatedAction, function(err, act) {
        if (err) {
          console.log(err);
          return done(err);
        }
        return done(null, act);
      });

    });
  },

  updateTeamUserDefined: function(actionTextId, updatedAction, done) {
    Action.findOne({ actionTextId: actionTextId, userDefined: true }, function(err, action) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding team user defined actions for  " + actionTextId));
      }
      if (!action) {
        return done(null, false);
      }

      _updateAction(action, updatedAction, function(err, act) {
        if (err) {
          console.log(err);
          return done(err);
        }
        return done(null, act);
      });

    });
  },

  deleteUserDefinedTeamAction: function(actionTextId, done){
    Action.remove({actionTextId: actionTextId, userDefined: true}, function(err){
      if(err) return done(err);
      return done(null);
    });
  },

  deleteUserDefinedPatientAction: function(patientId, actionTextId, done){
    Action.remove({actionTextId: actionTextId, patientId:patientId, userDefined: true}, function(err){
      if(err) return done(err);
      return done(null);
    });
  },

  updateTeam: function(practiceId, indicatorId, updatedAction, done) {
    Action.find({ practiceId: practiceId, actionTextId: updatedAction.actionTextId }, function(err, actions) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding team actions for practice: " + practiceId + " and actionTextId " + updatedAction.actionTextId));
      }
      if (!actions || actions.length === 0) {
        actions = [
            new Action({
            practiceId: practiceId
          })
          ];
      }

      var doneActions = [];
      var errorIfError = null;

      actions.forEach(function(v) {
        delete updatedAction.indicatorList;
        _updateAction(v, updatedAction, function(err, act) {
          if (err) {
            console.log(err);
            errorIfError = err;
            doneActions.push(act);
          } else {
            doneActions.push(act);
          }
          if (doneActions.length === actions.length) {
            if (errorIfError) return done(errorIfError);
            else return done(null, doneActions);
          }
        });
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
      Object.keys(updatedAction).forEach(function(v) {
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

  getTeam: function(searchObject, done) {
    Action.find(searchObject, function(err, actions) {
      //TEMP fix
      actions = actions.map(function(v){
        if(v.history) {
          v.history = v.history.filter(function(v){
            return v.who;
          });
          if(v.history.length===0) v.history=null;
        }
        return v;
      });
      if (err) {
        console.log(err);
        return done(new Error("Error finding team action list for practice: " + searchObject.practiceId + " and indicator " + searchObject.indicatorId));
      }
      if (!actions) {
        console.log('Error finding team action list for practice:  ' + searchObject.practiceId + " and indicator " + searchObject.indicatorId);
        return done(null, false);
      } else {
        done(null, actions);
      }
    });
  },

  getIndividual: function(searchObject, done) {
    Action.find(searchObject, function(err, actions) {
      //TEMP fix
      actions = actions.map(function(v){
        if(v.history) {
          v.history = v.history.filter(function(v){
            return v.who;
          });
          if(v.history.length===0) v.history=null;
        }
        return v;
      });
      if (err) {
        console.log(err);
        return done(new Error("Error finding individual action list for practice: " + practiceId + " and patient " + patientId));
      }
      if (!actions) {
        console.log('Error finding individual action list for practice:  ' + practiceId + " and patient " + patientId);
        return done(null, false);
      } else {
        done(null, actions);
      }
    });
  },

  addTeamAction: function(practiceId, indicatorId, username, actionText, done) {
    var actionObject = {
      practiceId: practiceId,
      actionTextId: actionText.toLowerCase().replace(/[^a-z0-9]/g, ""),
      actionText: actionText,
      history: [{who: username, what: "added", when: new Date()}],
      userDefined: true,
      done: false
    };
    if (indicatorId) actionObject.indicatorList = [indicatorId];
    var action = new Action(actionObject);

    // save the event
    action.save(function(err, act) {
      if (err) {
        return done(err);
      } else {
        return done(null, act);
      }
    });
  },

  addIndividualAction: function(practiceId, patientId, indicatorList, username, actionText, done) {
    var action = new Action({
      practiceId: practiceId,
      patientId: patientId,
      indicatorList: indicatorList,
      actionTextId: actionText.toLowerCase().replace(/[^a-z0-9]/g, ""),
      actionText: actionText,
      history: [{who: username, what: "added", when: new Date()}],
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

  patientsWithPlan: function(patientList, done){
    Action.aggregate([
      {$match: {patientId: {$in: patientList }, $or:[{agree:true},{userDefined:true}]}},
      {$group: {_id:"$patientId",actions:{$push:{actionTextId:"$actionTextId",agree:"$agree", history:"$history", indicatorList:"$indicatorList"}}}}
    ], function(err, actions) {
      //TEMP fix
      actions = actions.map(function(v){
        if(v.history) {
          v.history = v.history.filter(function(v){
            return v.who;
          });
          if(v.history.length===0) v.history=null;
        }
        return v;
      });
      if (err) {
        console.log(err);
        return done(new Error("Error finding individual action list for practice: " + practiceId + " and patient " + patientId));
      }
      if (!actions) {
        console.log('Error finding individual action list for practice:  ' + practiceId + " and patient " + patientId);
        return done(null, false);
      } else {
        done(null, actions);
      }
    });
  }

};
