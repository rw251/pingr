const Indicator = require('../models/indicator');
const actions = require('./actions');

const mean = (arr) => {
  if (arr.length === 0) return 1000;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
};

const mergeActions = (actionList, indicators, indicatorId) => {
  const actionObject = {};
  const userDefinedActions = [];
  actionList.forEach((v) => {
    if (v.userDefined && (!indicatorId || v.indicatorList.indexOf(indicatorId))) {
      userDefinedActions.push(v);
    }
    actionObject[v.actionTextId] = v.toObject();
  });

  const uniqueActions = {};

  indicators.forEach((indicator) => {
    // de dupe and sum the pointsPerAction
    indicator.actions.forEach((action) => {
      const v = action.toObject ? action.toObject() : action;
      const actionIdFromText = v.actionText.toLowerCase().replace(/[^a-z0-9]/g, '');
      v.pointsPerAction = +v.pointsPerAction;
      v.indicatorList = [v.indicatorId];
      v.actionTextId = actionIdFromText;
      if (!uniqueActions[actionIdFromText]) {
        uniqueActions[actionIdFromText] = v;
        uniqueActions[actionIdFromText].priority = [v.priority || 1000];
      } else {
        uniqueActions[actionIdFromText].indicatorList.push(v.indicatorId);
        uniqueActions[actionIdFromText].pointsPerAction += v.pointsPerAction;
        uniqueActions[actionIdFromText].priority.push(v.priority);
        // how about numberPatients
      }
    });
  });

  // convert back to array and sort
  let rtn = Object.keys(uniqueActions).map((v) => {
    uniqueActions[v].priority = mean(uniqueActions[v].priority);
    return uniqueActions[v];
  });

  // do the merging
  rtn = rtn.map((v) => {
    if (actionObject[v.actionTextId]) {
      Object.keys(actionObject[v.actionTextId]).forEach((vv) => {
        if (vv[0] === '_' || vv === 'indicatorList') return; // ignore hidden properties like _id and __v;
        v[vv] = actionObject[v.actionTextId][vv];
      });
    }
    return v;
  });

  // do the sorting
  rtn.sort((a, b) => {
    if (a.agree === false) {
      if (b.agree === false) {
        if (b.pointsPerAction === a.pointsPerAction) return a.priority - b.priority;
        return b.pointsPerAction - a.pointsPerAction;
      }
      return 1;
    } else if (b.agree === false) {
      return -1;
    } else if (a.agree) {
      if (!b.agree) return 1;
    } else if (b.agree) {
      return -1;
    }
    if (b.pointsPerAction === a.pointsPerAction) return a.priority - b.priority;
    return b.pointsPerAction - a.pointsPerAction;
  });

  return { actions: rtn, userDefinedActions };
};

module.exports = {

  // just get the indicator names and details
  getList: (done) => {
    Indicator.aggregate([
      { $group: { _id: '$id', name: { $max: '$name' }, description: { $max: '$description' } } },
      { $sort: { name: 1 } },
    ], (err, indicators) => {
      if (err) {
        console.log(err);
        return done(new Error('Error finding indicator list'));
      }
      return done(null, indicators);
    });
  },
  // Get list of indicators for a single practice - for use on the overview screen
  list(practiceId, done) {
    Indicator.find({ practiceId }, (err, indicators) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding indicator list for practice: ${practiceId}`));
      }
      if (!indicators) {
        console.log(`Error finding indicator list for practice:  ${practiceId}`);
        return done(null, false);
      }
      let opps = [];
      indicators.forEach((v) => {
        opps = opps.concat(v.opportunities);
      });
      const patientList = opps.reduce((prev, curr) => {
        const union = prev.concat(curr.patients);
        return union.filter((item, pos) => union.indexOf(item) === pos);
      }, []);

      return actions.patientsWithPlan(patientList, (pwpErr, patientsWithActions) => {
        const indicatorCountOfReviewedPatients = {};
        patientsWithActions.forEach((v) => {
          const localReviewedPatients = {};
          v.actions.forEach((vv) => {
            if (vv.indicatorList) {
              vv.indicatorList.forEach((vvv) => {
                if (!localReviewedPatients[vvv]) {
                  localReviewedPatients[vvv] = 1;
                }
              });
            }
          });
          Object.keys(localReviewedPatients).forEach((vv) => {
            if (!indicatorCountOfReviewedPatients[vv]) {
              indicatorCountOfReviewedPatients[vv] = 1;
            } else {
              indicatorCountOfReviewedPatients[vv] += 1;
            }
          });
        });
        const indicatorsToReturn = indicators.map((indicator) => {
          const v = indicator.toObject();
          if (indicatorCountOfReviewedPatients[v.id]) {
            v.reviewed = indicatorCountOfReviewedPatients[v.id];
          } else {
            v.reviewed = 0;
          }
          return v;
        });

        done(null, indicatorsToReturn);
      });
    });
  },

  // Get single indicator for a given practice
  get(practiceId, indicatorId, done) {
    Indicator.findOne({ practiceId, id: indicatorId }, (err, indicator) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding indicator: ${indicatorId} for practice: ${practiceId}`));
      }
      if (!indicator) {
        console.log(`Error finding indicator: ${indicatorId} for practice: ${practiceId}`);
        return done(null, false);
      }
      return done(null, indicator);
    });
  },

  getSpecificActions(practiceId, actionList, done) {
    if (!actionList || actionList.length === 0) return done(null, {});
    const aggQuery = [
      // filter to just practice of interest
      { $match: { practiceId } },
      // get rid of all fields except patient id and action list
      { $project: { _id: 0, actions: 1 } },
      { $unwind: '$actions' }, // so we have one object per patient/action combination
      { $match: { 'actions.actionTextId': { $in: actionList.map(v => v.actionTextId) } } },
      { $group: { _id: '0', actions: { $push: '$actions' } } }, // regroup the actions into a list
      { $project: { _id: 0, patientId: '$_id', actions: 1 } }, // rename to original format
    ];
    return Indicator.aggregate(aggQuery, (err, indicators) => {
      if (err) {
        console.log(err);
        return done(new Error('Error finding patient'));
      }
      if (!indicators) {
        console.log(`Invalid request for practiceId: ${practiceId}`);
        return done(null, false);
      }
      const rtn = mergeActions(actionList, indicators);
      return done(null, rtn);
    });
  },

  // Get team actions for a single indicator or all indicators
  getActions(practiceId, indicatorId, done) {
    // console.log(practiceId, indicatorId);
    const searchObject = { practiceId };
    actions.getTeam({ practiceId, patientId: { $exists: false } }, (err, actionList) => {
      if (err) return done(err);
      if (indicatorId) {
        searchObject.id = indicatorId;
      }
      return Indicator.find(
        searchObject,
        { _id: 0, actions: 1, mappedIndicators: 1, type: 1 },
        (findErr, indicators) => {
          if (findErr) {
            console.log(findErr);
            return done(new Error('Error finding indicator'));
          }

          if (indicatorId && indicators.length > 0 && indicators[0].type === 'outcome') {
          // we need to find the actions for the associated process indicators

            searchObject.id = { $in: indicators[0].mappedIndicators };
            return Indicator.find(
              searchObject,
              { _id: 0, actions: 1, mappedIndicators: 1, type: 1 },
              (findErr2, indicatorList) => {
                if (findErr2) {
                  console.log(findErr2);
                  return done(new Error('Error finding indicator'));
                }
                if (!indicatorList) {
                  console.log(`Invalid request for indicatorId: ${indicatorId}`);
                  return done(null, false);
                }
                const rtn = mergeActions(actionList, indicatorList, indicatorId);
                return done(null, rtn);
              }
            );
          }
          if (!indicators) {
            console.log(`Invalid request for indicatorId: ${indicatorId}`);
            return done(null, false);
          }
          const rtn = mergeActions(actionList, indicators, indicatorId);
          return done(null, rtn);
        }
      );
    });
  },

  // Get benchmark data for an indicator
  getBenchmark(practiceId, practices, indicatorId, done) {
    const pLookup = {};
    practices.forEach((v) => {
      pLookup[v._id] = [v.name, v.neighbourhood];
    });
    Indicator.find({ id: indicatorId }, (err, indicators) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding indicators for: ${indicatorId}`));
      }
      if (!indicators) {
        console.log(`Error finding indicators for:  ${indicatorId}`);
        return done(null, false);
      }
      const benchmark = indicators.filter(v => v.values && v.values.length > 0 && v.practiceId !== 'ALL').map((v) => {
        const props = {
          x: (+v.values[1][v.values[1].length - 1] * 100) / +v.values[2][v.values[2].length - 1],
          p: v.practiceId === practiceId ? 'You' : practiceId,
          pFull: (pLookup[v.practiceId] ? pLookup[v.practiceId][0] : v.practiceId),
          local: pLookup[v.practiceId] ?
            pLookup[v.practiceId][1] === pLookup[practiceId][1] :
            false,
        };
        if (v.practiceId === practiceId) props.pFull = 'You';
        return props;
      });
      return done(null, benchmark);
    });
  },

  // Get trend data for a practice and an indicator
  getTrend(practiceId, indicatorId, done) {
    Indicator.findOne({ practiceId, id: indicatorId }, { values: 1 }, (err, indicator) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding trend for practice: ${practiceId} and indicator: ${indicatorId}`));
      }
      if (!indicator) {
        console.log(`Error finding trend for practice: ${practiceId} and indicator: ${indicatorId}`);
        return done(null, false);
      }
      return done(null, indicator.values);
    });
  },

};
