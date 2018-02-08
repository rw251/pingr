const Action = require('../models/action');

const localUpdateAction = (action, updatedAction, callback) => {
  Object.keys(updatedAction).forEach((v) => {
    if (v[0] === '_') return; // ignore hidden properties like _id and __v;
    action[v] = updatedAction[v];
  });
  action.save((err, act) => {
    if (err) {
      console.log('error updating team action');
      return callback(err);
    }
    return callback(null, act);
  });
};

module.exports = {

  // Get list of actions for a single practice
  list(practiceId, done) {
    Action.find({ practiceId }, (err, actions) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding action list for practice: ${practiceId}`));
      }
      if (!actions) {
        console.log(`Error finding action list for practice:  ${practiceId}`);
        return done(null, false);
      }
      return done(null, actions);
    });
  },

  listAgreedWith(practiceId, done) {
    Action.find({ practiceId, $or: [{ agree: true }, { userDefined: true }] }, (err, actions) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding action list for practice: ${practiceId}`));
      }
      if (!actions) {
        console.log(`Error finding action list for practice:  ${practiceId}`);
        return done(null, false);
      }
      return done(null, actions);
    });
  },

  updatePatientUserDefined(patientId, actionTextId, updatedAction, done) {
    Action.findOne({ actionTextId, patientId, userDefined: true }, (err, action) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding patient user defined actions for  ${actionTextId}`));
      }
      if (!action) {
        return done(null, false);
      }

      return localUpdateAction(action, updatedAction, (updateActionError, act) => {
        if (updateActionError) {
          console.log(updateActionError);
          return done(updateActionError);
        }
        return done(null, act);
      });
    });
  },

  updateTeamUserDefined(actionTextId, updatedAction, done) {
    Action.findOne({ actionTextId, userDefined: true }, (err, action) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding team user defined actions for  ${actionTextId}`));
      }
      if (!action) {
        return done(null, false);
      }

      return localUpdateAction(action, updatedAction, (updateActionError, act) => {
        if (updateActionError) {
          console.log(updateActionError);
          return done(updateActionError);
        }
        return done(null, act);
      });
    });
  },

  deleteUserDefinedTeamAction(actionTextId, done) {
    Action.remove({ actionTextId, userDefined: true }, (err) => {
      if (err) return done(err);
      return done(null);
    });
  },

  deleteUserDefinedPatientAction(patientId, actionTextId, done) {
    Action.remove({ actionTextId, patientId, userDefined: true }, (err) => {
      if (err) return done(err);
      return done(null);
    });
  },

  updateTeam(practiceId, indicatorId, updatedAction, done) {
    Action.find({ practiceId, actionTextId: updatedAction.actionTextId }, (err, actions = []) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding team actions for practice: ${practiceId} and actionTextId ${updatedAction.actionTextId}`));
      }
      if (actions.length === 0) {
        actions.push(new Action({ practiceId }));
      }

      const doneActions = [];
      let errorIfError = null;

      return actions.forEach((v) => {
        delete updatedAction.indicatorList;
        localUpdateAction(v, updatedAction, (locErr, act) => {
          if (locErr) {
            console.log(locErr);
            errorIfError = locErr;
            doneActions.push(act);
          } else {
            doneActions.push(act);
          }
          if (doneActions.length === actions.length) {
            if (errorIfError) return done(errorIfError);
            return done(null, doneActions);
          }
          return false;
        });
      });
    });
  },

  updateIndividual(practiceId, patientId, updatedAction, done) {
    Action.findOne(
      { practiceId, patientId, actionTextId: updatedAction.actionTextId },
      (err, action = new Action({
        practiceId,
        patientId,
      })) => {
        if (err) {
          console.log(err);
          return done(new Error(`Error finding individual action for practice: ${practiceId} and patient ${patientId} and actionTextId ${updatedAction.actionTextId}`));
        }
        Object.keys(updatedAction).forEach((v) => {
          if (v[0] === '_') return; // ignore hidden properties like _id and __v;
          action[v] = updatedAction[v];
        });
        return action.save((saveErr, act) => {
          if (saveErr) {
            console.log('error updating individual action');
            return done(saveErr);
          }
          return done(null, act);
        });
      }
    );
  },

  getTeam(searchObject, done) {
    Action.find(searchObject, (err, actions) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding team action list for practice: ${searchObject.practiceId} and indicator ${searchObject.indicatorId}`));
      }
      if (!actions) {
        console.log(`Error finding team action list for practice:  ${searchObject.practiceId} and indicator ${searchObject.indicatorId}`);
        return done(null, false);
      }
      return done(null, actions);
    });
  },

  getIndividual(searchObject, done) {
    Action.find(searchObject, (err, actions) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding individual action list for practice: ${searchObject.practiceId} and patient ${searchObject.patientId}`));
      }
      if (!actions) {
        console.log(`Error finding individual action list for practice:  ${searchObject.practiceId} and patient ${searchObject.patientId}`);
        return done(null, false);
      }
      return done(null, actions);
    });
  },

  addTeamAction(practiceId, indicatorId, username, actionText, done) {
    const actionObject = {
      practiceId,
      actionTextId: actionText.toLowerCase().replace(/[^a-z0-9]/g, ''),
      actionText,
      history: [{ who: username, what: 'added', when: new Date() }],
      userDefined: true,
      done: false,
    };
    if (indicatorId) actionObject.indicatorList = [indicatorId];
    const action = new Action(actionObject);

    // save the event
    action.save((err, act) => {
      if (err) {
        return done(err);
      }
      return done(null, act);
    });
  },

  addIndividualAction(practiceId, patientId, indicatorList, username, actionText, done) {
    const action = new Action({
      practiceId,
      patientId,
      indicatorList,
      actionTextId: actionText.toLowerCase().replace(/[^a-z0-9]/g, ''),
      actionText,
      history: [{ who: username, what: 'added', when: new Date() }],
      userDefined: true,
      done: false,
    });

    // save the event
    action.save((err, act) => {
      if (err) {
        return done(err);
      }
      return done(null, act);
    });
  },

  patientsWithPlansPerIndicator(patientList, done) {
    Action.aggregate([
      {
        $match: {
          patientId: { $in: patientList },
          $or: [{ agree: true }, { userDefined: true }],
        },
      },
      { $project: { patientId: 1, indicatorList: 1 } },
      { $unwind: '$indicatorList' },
      { $group: { _id: '$patientId', indicatorList: { $addToSet: '$indicatorList' } } },
    ], (err, actions) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding actions for patients: ${patientList}`));
      }
      if (!actions) {
        console.log(`Error finding actions for patients: ${patientList}`);
        return done(null, false);
      }
      return done(null, actions);
    });
  },

  patientsWithPlan(patientList, done) {
    Action.aggregate([
      {
        $match: {
          patientId: { $in: patientList },
          $or: [{ agree: true }, { userDefined: true }],
        },
      },
      {
        $group: {
          _id: '$patientId',
          actions: { $push: { actionTextId: '$actionTextId', agree: '$agree', history: '$history', indicatorList: '$indicatorList' } },
        },
      },
    ], (err, actions) => {
      if (err) {
        console.log(err);
        return done(new Error('Error finding patientsWithPlan'));
      }
      if (!actions) {
        console.log('Error finding patientsWithPlan');
        return done(null, false);
      }
      return done(null, actions);
    });
  },

};
