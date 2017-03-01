var Patient = require('../models/patient'),
  indicators = require('./indicators'),
  actions = require('./actions');

var mergeActions = function(actions, patients, patientId) {
  var actionObject = {};
  var userDefinedActions = {};
  actions.forEach(function(v) {
    if (v.patientId) {
      if (v.userDefined) {
        if (!userDefinedActions[v.patientId]) userDefinedActions[v.patientId] = [];
        userDefinedActions[v.patientId].push(v);
      }
      if (!actionObject[v.patientId]) actionObject[v.patientId] = {};
      actionObject[v.patientId][v.actionTextId] = v.toObject();
    }
  });

  var uniqueActions = {};
  var finalRtn = {};

  patients.forEach(function(patient) {
    uniqueActions[patient.patientId] = {};
    //de dupe and sum the pointsPerAction
    patient.actions.forEach(function(v) {
      v = v.toObject ? v.toObject() : v;
      var actionIdFromText = v.actionText.toLowerCase().replace(/[^a-z0-9]/g, "");
      v.pointsPerAction = +v.pointsPerAction;
      v.indicatorList = [v.indicatorId];
      v.actionTextId = actionIdFromText;
      if (!uniqueActions[patient.patientId][actionIdFromText]) {
        uniqueActions[patient.patientId][actionIdFromText] = v;
      } else {
        uniqueActions[patient.patientId][actionIdFromText].indicatorList.push(v.indicatorId);
        uniqueActions[patient.patientId][actionIdFromText].pointsPerAction += v.pointsPerAction;
        // how about numberPatients and priority
      }
    });

    //convert back to array and sort
    var rtn = Object.keys(uniqueActions[patient.patientId]).map(function(v) {
      return uniqueActions[patient.patientId][v];
    });

    //do the merging
    rtn = rtn.map(function(v) {
      if (actionObject[patient.patientId] && actionObject[patient.patientId][v.actionTextId]) {
        Object.keys(actionObject[patient.patientId][v.actionTextId]).forEach(function(vv) {
          if(vv[0]==="_" || vv === "indicatorList") return; //ignore hidden properties like _id and __v;
          v[vv] = actionObject[patient.patientId][v.actionTextId][vv];
        });
      }
      return v;
    });

    //do the sorting
    rtn.sort(function(a, b) {
      if (a.agree === false) {
        if (b.agree === false) return 0;
        else return 1;
      } else if (b.agree === false) {
        return -1;
      }
      return b.pointsPerAction - a.pointsPerAction;
    });



    userDefinedActions[patient.patientId] = userDefinedActions[patient.patientId] || [];
    if (patientId || (userDefinedActions[patient.patientId].length + rtn.length > 0)) {
      finalRtn[patient.patientId] = { actions: rtn, userDefinedActions: userDefinedActions[patient.patientId] };
    }
  });
  return finalRtn;
};

module.exports = {

  //Return a list of patients - not sure this is needed
  list: function(done) {
    Patient.find({}, { patientId: 1 }, function(err, patients) {
      if (!patients) {
        console.log('Oops with patients');
        return done(null, false);
      } else {
        done(null, patients);
      }
    });
  },

  //Get a single patient's details - for use on the patient screen
  get: function(patientId, done) {
    Patient.findOne({ patientId: patientId }, function(err, patient) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding patient"));
      }
      if (!patient) {
        console.log('Invalid request for patientId: ' + patientId);
        return done(null, false);
      } else {
        actions.patientsWithPlan([+patientId], function(err, actions) {
          var actionObject = {};
          if (actions && actions.length > 0) {
            actions[0].actions.forEach(function(v) {
              if (v.indicatorList) {
                v.indicatorList.forEach(function(vv) {
                  if (!actionObject[vv]) {
                    actionObject[vv] = [v];
                  } else {
                    actionObject[vv].push(v);
                  }
                });
              }
            });
          }
          patient = patient.toObject();
          if (patient.standards) {
            patient.standards = patient.standards.map(function(v) {
              if (actionObject[v.indicatorId]) {
                v.actionPlan = true;
                v.actionPlans = actionObject[v.indicatorId];
              }
              return v;
            });
          }
          done(null, patient );
        });
      }
    });
  },

  getSpecificActions: function(actions, done) {
    if (!actions || actions.length === 0) return done(null, {});
    var aggQuery = [
      { $match: { patientId: { $in: actions.map(function(v) { return v.patientId; }) } } }, //filter to just patients of interest
      { $project: { _id: 0, patientId: 1, actions: 1 } }, //get rid of all fields except patient id and action list
      { $unwind: "$actions" }, //so we have one object per patient/action combination
      { $match: { $or: actions.map(function(v) { return { patientId: v.patientId, "actions.actionTextId": v.actionTextId }; }) } }, //only match where patient id and action id are both matches
      { $group: { _id: "$patientId", actions: { $push: "$actions" } } }, //regroup the actions into a list
      { $project: { _id: 0, patientId: "$_id", actions: 1 } } //rename to original format
    ];
    Patient.aggregate(aggQuery, function(err, patients) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding patient"));
      }
      if (!patients) {
        console.log('Invalid request for patientId: ' + patientId);
        return done(null, false);
      } else {
        var rtn = mergeActions(actions, patients);
        return done(null, rtn);
      }
    });
  },

  //Get a single patient's actions - for use on the patient screen
  getActions: function(practiceId, patientId, done) {
    var searchObject = {};
    if (patientId) searchObject.patientId = patientId;
    actions.getIndividual(searchObject, function(err, actions) {
      if (err) return done(err);
      searchObject["characteristics.practiceId"] = practiceId;
      Patient.find(searchObject, { _id: 0, actions: 1, patientId: 1 }, function(err, patients) {
        if (err) {
          console.log(err);
          return done(new Error("Error finding patient"));
        }
        if (!patients) {
          console.log('Invalid request for patientId: ' + patientId);
          return done(null, false);
        } else {
          var rtn = mergeActions(actions, patients, patientId);
          return done(null, rtn);
        }
      });
    });
  },

  //Get nhs lookup
  nhsLookup: function(gp, done) {
    Patient.find({ "characteristics.practiceId": gp }, { _id: 0, "characteristics.nhs": 1, patientId: 1 }, function(err, patients) {
      if (!patients) {
        console.log('oops with nhs lookup');
        return done(null, false);
      } else {
        var rtn = {};
        patients.forEach(function(v) {
          v = v.toObject();
          rtn["" + v.patientId] = v.characteristics.nhs;
        });
        return done(null, rtn);
      }
    });
  },

  //Get list of patients for a practice and indicator - for use on indicator screen
  getListForIndicator: function(practiceId, indicatorId, done) {
    //need to get
    // [{patientId, age, value, [impOpps]}]
    console.time(["getListForIndicator", "indicators", "get"].join("--"));
    indicators.get(practiceId, indicatorId, function(err, indicator) {
      console.timeEnd(["getListForIndicator", "indicators", "get"].join("--"));
      console.time(["getListForIndicator", "indicators", "process"].join("--"));
      var patientList = indicator.opportunities.reduce(function(prev, curr) {
        var union = prev.concat(curr.patients);
        return union.filter(function(item, pos) {
          return union.indexOf(item) == pos;
        });
      }, []);

      var indicatorValue = indicator.measurementId;
      if (indicatorValue === "SBP") indicatorValue = "BP";

      console.timeEnd(["getListForIndicator", "indicators", "process"].join("--"));
      console.time(["getListForIndicator", "actions", "get"].join("--"));
      actions.patientsWithPlan(patientList, function(err, patientsWithActions) {
        console.timeEnd(["getListForIndicator", "actions", "get"].join("--"));
        console.time(["getListForIndicator", "actions", "process"].join("--"));
        var patientsWithActionsObject = {};
        patientsWithActions.forEach(function(v) {
          patientsWithActionsObject[v._id] = v.actions;
        });
        if (err) return done(err);
        console.timeEnd(["getListForIndicator", "actions", "process"].join("--"));
        console.time(["getListForIndicator", "patients", "get"].join("--"));
        Patient.find({ patientId: { $in: patientList } }, { _id: 0, patientId: 1, characteristics: 1, actions: 1, measurements: { $elemMatch: { id: indicatorValue } }, "measurements.data": { $slice: -1 } },
          function(err, patients) {
            console.timeEnd(["getListForIndicator", "patients", "get"].join("--"));
            console.time(["getListForIndicator", "patients", "process"].join("--"));
            var p = patients.map(function(patient) {
              patient = patient.toObject();
              var meas = "?";
              if (patient.measurements && patient.measurements.length > 0 && patient.measurements[0].data && patient.measurements[0].data.length > 0 && patient.measurements[0].data[0].length > 2) {
                if (indicator.measurementId === "SBP") {
                  meas = indicator.displayDate ? patient.measurements[0].data[0][0] : patient.measurements[0].data[0][2];
                  // for dbp use:
                  //meas = indicator.displayDate ? patient.measurements[0].data[0][0] : patient.measurements[0].data[0][3];
                } else {
                  meas = indicator.displayDate ? patient.measurements[0].data[0][0] : patient.measurements[0].data[0][2];
                }
              }
              var opps = indicator.opportunities.filter(function(v) {
                return v.patients.indexOf("" + patient.patientId) > -1;
              }).map(function(v) {
                return v.id;
              });
              var rtn = {
                patientId: patient.patientId,
                nhs: patient.characteristics.nhs,
                age: patient.characteristics.age,
                value: meas,
                opportunities: opps
              };
              if (patientsWithActionsObject[patient.patientId]) {
                rtn.actionStatus = patientsWithActionsObject[patient.patientId];
              }
              return rtn;
            });
            console.timeEnd(["getListForIndicator", "patients", "process"].join("--"));
            return done(null, p);
          });
      });
    });
  }
};
