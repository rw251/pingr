var Patient = require('../models/patient'),
  indicators = require('./indicators'),
  actions = require('./actions');

var mean = function(arr) {
  if(arr.length===0) return 1000;
  var sum = arr.reduce((a, b) => a + b, 0);
  return sum/arr.length;
}

var mergeActions = function (actions, patients, patientId) {
  var actionObject = {};
  var userDefinedActions = {};
  actions.forEach(function (v) {
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

  patients.forEach(function (patient) {
    uniqueActions[patient.patientId] = {};
    //de dupe and sum the pointsPerAction
    patient.actions.forEach(function (v) {
      v = v.toObject ? v.toObject() : v;
      var actionIdFromText = v.actionText.toLowerCase().replace(/[^a-z0-9]/g, "");
      v.pointsPerAction = +v.pointsPerAction;
      v.indicatorList = [v.indicatorId];
      v.actionTextId = actionIdFromText;
      if (!uniqueActions[patient.patientId][actionIdFromText]) {
        uniqueActions[patient.patientId][actionIdFromText] = v;
        uniqueActions[patient.patientId][actionIdFromText].priority = [v.priority || 1000];
      } else {
        uniqueActions[patient.patientId][actionIdFromText].indicatorList.push(v.indicatorId);
        uniqueActions[patient.patientId][actionIdFromText].pointsPerAction += v.pointsPerAction;
        uniqueActions[patient.patientId][actionIdFromText].priority.push(v.priority);
        // how about numberPatients
      }
    });

    //convert back to array and sort
    var rtn = Object.keys(uniqueActions[patient.patientId]).map(function (v) {
      uniqueActions[patient.patientId][v].priority = mean(uniqueActions[patient.patientId][v].priority);
      return uniqueActions[patient.patientId][v];
    });

    //do the merging
    rtn = rtn.map(function (v) {
      if (actionObject[patient.patientId] && actionObject[patient.patientId][v.actionTextId]) {
        Object.keys(actionObject[patient.patientId][v.actionTextId]).forEach(function (vv) {
          if (vv[0] === "_" || vv === "indicatorList") return; //ignore hidden properties like _id and __v;
          v[vv] = actionObject[patient.patientId][v.actionTextId][vv];
        });
      }
      return v;
    });

    //do the sorting
    rtn.sort(function (a, b) {
      if (a.agree === false) {
        if (b.agree === false) {
          if(b.pointsPerAction === a.pointsPerAction) return a.priority - b.priority;
          return b.pointsPerAction - a.pointsPerAction;
        } 
        else return 1;
      } else if (b.agree === false) {
        return -1;
      } else if (a.agree) {
        if (!b.agree) return 1;
      } else if (b.agree) {
        return -1;
      }      
      if(b.pointsPerAction === a.pointsPerAction) return a.priority - b.priority;
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
  list: function (done) {
    Patient.find({}, { patientId: 1 }, function (err, patients) {
      if (!patients) {
        console.log('Oops with patients');
        return done(null, false);
      } else {
        done(null, patients);
      }
    });
  },

  //Get a single patient's details - for use on the patient screen
  get: function (patientId, done) {
    Patient.findOne({ patientId: patientId }, function (err, patient) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding patient"));
      }
      if (!patient) {
        console.log('Invalid request for patientId: ' + patientId);
        return done(null, false);
      } else {
        actions.patientsWithPlan([+patientId], function (err, actions) {
          var actionObject = {};
          if (actions && actions.length > 0) {
            actions[0].actions.forEach(function (v) {
              if (v.indicatorList) {
                v.indicatorList.forEach(function (vv) {
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
            patient.standards = patient.standards.map(function (v) {
              if (actionObject[v.indicatorId]) {
                v.actionPlan = true;
                v.actionPlans = actionObject[v.indicatorId];
              }
              return v;
            });
          }
          done(null, patient);
        });
      }
    });
  },

  getSpecificActions: function (actions, done) {
    if (!actions || actions.length === 0) return done(null, {});
    var aggQuery = [
      { $match: { patientId: { $in: actions.map(function (v) { return v.patientId; }) } } }, //filter to just patients of interest
      { $project: { _id: 0, patientId: 1, actions: 1 } }, //get rid of all fields except patient id and action list
      { $unwind: "$actions" }, //so we have one object per patient/action combination
      { $match: { $or: actions.map(function (v) { return { patientId: v.patientId, "actions.actionTextId": v.actionTextId }; }) } }, //only match where patient id and action id are both matches
      { $group: { _id: "$patientId", actions: { $push: "$actions" } } }, //regroup the actions into a list
      { $project: { _id: 0, patientId: "$_id", actions: 1 } } //rename to original format
    ];
    Patient.aggregate(aggQuery, function (err, patients) {
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
  getActions: function (practiceId, patientId, done) {
    var searchObject = {};
    if (patientId) searchObject.patientId = patientId;
    actions.getIndividual(searchObject, function (err, actions) {
      if (err) return done(err);
      searchObject["characteristics.practiceId"] = practiceId;
      Patient.find(searchObject, { _id: 0, actions: 1, patientId: 1 }, function (err, patients) {
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
  nhsLookup: function (gp, done) {
    Patient.find({ "characteristics.practiceId": gp }, { _id: 0, "characteristics.nhs": 1, patientId: 1 }, function (err, patients) {
      if (!patients) {
        console.log('oops with nhs lookup');
        return done(null, false);
      } else {
        var rtn = {};
        patients.forEach(function (v) {
          v = v.toObject();
          rtn["" + v.patientId] = v.characteristics.nhs;
        });
        return done(null, rtn);
      }
    });
  },

  getAllPatientsPaginatedConsiderLastReviewDate: function (user, skip, limit, done) {
    //TODO really need to double check this logic with ben
    var now = new Date();
    var nextApril1st = new Date();
    if(nextApril1st.getMonth()>2) {
      nextApril1st.setFullYear(nextApril1st.getFullYear()+1);
    }
    nextApril1st.setMonth(3);
    nextApril1st.setDate(1);
    console.log(now);
    console.log(nextApril1st);

    const dateRangeQueryOptions = {
      MISSED_REVIEW: { "standards.nextReviewDate" : {$lt: now.getTime() } },
      NO_REVIEW: { "standards.nextReviewDate" : { $exists:false } },
      AFTER_APRIL: { "standards.nextReviewDate" : {$gt: nextApril1st.getTime() } },
      REVIEW_YET_TO_HAPPEN: { $and: [ { "standards.nextReviewDate": {$gte: now.getTime()}}, {"standards.nextReviewDate": {$lte: nextApril1st.getTime() }} ] },
    }
    if(user.patientTypesToExclude) {
      user.patientTypesToExclude.forEach((type) => {
        delete dateRangeQueryOptions[type];
      });
    } 

    const dateRangeOrQuery = Object.keys(dateRangeQueryOptions).map(key => dateRangeQueryOptions[key]);

    var aggregateQuery = [
      { $match: { "characteristics.practiceId": user.practiceId } },
      { $project: { _id: 0, patientId: 1, standards: 1, characteristics: 1 } },
      { $unwind: "$standards" },
      { $match: { $and : [ 
        { "standards.indicatorId" : { $nin: user.emailIndicatorIdsToExclude } }, 
        {"standards.targetMet":false} , 
        { $or : dateRangeOrQuery } 
      ]}},
      { $group: { _id: "$patientId", nhsNumber: { $max: "$characteristics.nhs" }, age: { $max: "$characteristics.age" }, sex: { $max: "$characteristics.sex" },  indicators: { $addToSet: "$standards.indicatorId" } } },
      { $project: { _id: 1, nhsNumber: 1, age: 1, sex: 1, indicators: 1, numberOfIndicators: { $size: "$indicators" } } },
      { $sort: { numberOfIndicators: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    Patient.aggregate(aggregateQuery, function (err, results) {
      if (err) return done(err);
      var patientIds = results.map(function (v) {
        return v._id;
      });
      var resultsObject = {};
      results.forEach(function (v, i) {
        resultsObject[v._id] = v;
        resultsObject[v._id].pos = i;
      });
      actions.patientsWithPlansPerIndicator(patientIds, function (err, patientsWithActions) {
        patientsWithActions.forEach(function (v) {
          resultsObject[v._id].indicatorsWithAction = v.indicatorList;
          resultsObject[v._id].numberOfIndicatorsWithAction = v.indicatorList.length;
        });
        Object.keys(resultsObject).map(function (v) {
          results[v.pos] = resultsObject[v];
        });
        return done(null, results);
      });
    });
  },

  getAllPatientsPaginated: function (practiceId, skip, limit, done) {
    var aggregateQuery = [
      { $match: { "characteristics.practiceId": practiceId, "actions": { $exists: true } } },
      { $project: { _id: 0, patientId: 1, actions: 1, characteristics: 1 } },
      { $unwind: "$actions" },
      { $group: { _id: "$patientId", nhsNumber: { $max: "$characteristics.nhs" }, age: { $max: "$characteristics.age" }, sex: { $max: "$characteristics.sex" }, tot: { $sum: "$actions.pointsPerAction" }, indicators: { $addToSet: "$actions.indicatorId" } } },
      { $project: { _id: 1, nhsNumber: 1, age: 1, sex: 1, tot: 1, indicators: 1, numberOfIndicators: { $size: "$indicators" } } },
      { $sort: { numberOfIndicators: -1, tot: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    Patient.aggregate(aggregateQuery, function (err, results) {
      if (err) return done(err);
      var patientIds = results.map(function (v) {
        return v._id;
      });
      var resultsObject = {};
      results.forEach(function (v, i) {
        resultsObject[v._id] = v;
        resultsObject[v._id].pos = i;
      });
      actions.patientsWithPlansPerIndicator(patientIds, function (err, patientsWithActions) {
        patientsWithActions.forEach(function (v) {
          resultsObject[v._id].indicatorsWithAction = v.indicatorList;
          resultsObject[v._id].numberOfIndicatorsWithAction = v.indicatorList.length;
        });
        Object.keys(resultsObject).map(function (v) {
          results[v.pos] = resultsObject[v];
        });
        return done(null, results);
      });
    });
  },

  //Get list of patients for a practice and indicator - for use on indicator screen
  getListForIndicator: function (practiceId, indicatorId, done) {
    //need to get
    // [{patientId, age, value, [impOpps]}]
    //console.time(["getListForIndicator", "indicators", "get"].join("--"));
    indicators.get(practiceId, indicatorId, function (err, indicator) {
      //console.timeEnd(["getListForIndicator", "indicators", "get"].join("--"));
      //console.time(["getListForIndicator", "indicators", "process"].join("--"));
      var patientList = indicator.opportunities.reduce(function (prev, curr) {
        var union = prev.concat(curr.patients);
        return union.filter(function (item, pos) {
          return union.indexOf(item) == pos;
        });
      }, []);

      var indicatorValue = indicator.measurementId;
      if (indicatorValue === "SBP") indicatorValue = "BP";

      //console.timeEnd(["getListForIndicator", "indicators", "process"].join("--"));
      //console.time(["getListForIndicator", "actions", "get"].join("--"));
      actions.patientsWithPlan(patientList, function (err, patientsWithActions) {
        //console.timeEnd(["getListForIndicator", "actions", "get"].join("--"));
        //console.time(["getListForIndicator", "actions", "process"].join("--"));
        var patientsWithActionsObject = {};
        patientsWithActions.forEach(function (v) {
          patientsWithActionsObject[v._id] = v.actions;
        });
        if (err) return done(err);
        //console.timeEnd(["getListForIndicator", "actions", "process"].join("--"));
        //console.time(["getListForIndicator", "patients", "get"].join("--"));
        var query = [
          { $match: { patientId: { $in: patientList } } },
          { $project: { _id: 0, standards: { $filter: { input: "$standards", as: "standard",	cond: { $eq: [ "$$standard.indicatorId", indicatorId ] } } }, patientId: 1, characteristics: 1, actions: 1, measurements: { $filter: { input: "$measurements", as: "measurement",	cond: { $eq: [ "$$measurement.id", indicatorValue ] } } } }	},
          { $project: { reviewDateObj: {$arrayElemAt: [ "$standards", 0 ]}, patientId: 1, characteristics: 1, actions: 1, measurements : {$arrayElemAt: [ "$measurements", 0 ]}}},	
        ];
        if(indicator.displayValueFrom === 'practice') {
          query.push({ $project: { patientId: 1, characteristics: 1, actions: 1, reviewDate:"$reviewDateObj.nextReviewDate", measurements: { $slice: [{ $filter: { input: "$measurements.data", as: "data", cond: { $not: { $setIsSubset: [["salfordt"], "$$data"] } } } }, -1] } } });
        } else if(indicator.displayValueFrom === 'hospital') {
          query.push({ $project: { patientId: 1, characteristics: 1, actions: 1, reviewDate:"$reviewDateObj.nextReviewDate", measurements: { $slice: [{ $filter: { input: "$measurements.data", as: "data", cond: { $setIsSubset: [["salfordt"], "$$data"] } } }, -1] } } });
        } else {
          query.push({ $project: { patientId: 1, characteristics: 1, actions: 1, reviewDate:"$reviewDateObj.nextReviewDate", measurements: { $slice: [ "$measurements.data", -1] } } });
        }
        Patient.aggregate(query,
          function (err, patients) {
            if(err) console.log(err);
            //console.timeEnd(["getListForIndicator", "patients", "get"].join("--"));
            //console.time(["getListForIndicator", "patients", "process"].join("--"));
            var p = patients.map(function (patient) {
              //patient = patient.toObject();
              var measValue, measDate, reviewDate;
              if (indicator.displayDate) measDate = '?';
              if (indicator.displayValue) measValue = '?';
              if (indicator.displayReviewDate) reviewDate = '?';
              if (patient.measurements && patient.measurements.length > 0) {
                if (patient.measurements[0].length > 2) {
                  if (indicator.measurementId === "SBP") {
                    if (indicator.displayDate) {
                      measDate = patient.measurements[0][0];
                    }
                    if (indicator.displayValue) {
                      measValue = patient.measurements[0][2];
                    }
                    // for dbp use:
                    //meas = indicator.displayDate ? localData[0][0] : localData[0][3];
                  } else {
                    if (indicator.displayDate) {
                      measDate = patient.measurements[0][0];
                    }
                    if (indicator.displayValue) {
                      measValue = patient.measurements[0][2];
                    }
                  }
                }
              }
              if(patient.reviewDate) {
                reviewDate = patient.reviewDate;
              }
              var opps = indicator.opportunities.filter(function (v) {
                return v.patients.indexOf("" + patient.patientId) > -1;
              }).map(function (v) {
                return v.id;
              });
              var rtn = {
                patientId: patient.patientId,
                nhs: patient.characteristics.nhs,
                age: patient.characteristics.age,
                opportunities: opps
              };
              if (measValue) rtn.value = measValue;
              if (measDate) rtn.date = measDate;
              if (reviewDate) rtn.reviewDate = reviewDate;
              if (patientsWithActionsObject[patient.patientId]) {
                rtn.actionStatus = patientsWithActionsObject[patient.patientId];
              }
              return rtn;
            });
            //console.timeEnd(["getListForIndicator", "patients", "process"].join("--"));
            return done(null, p, indicator.type);
          });
      });
    });
  },

  possibleExcludeType: [
    //Date string: (i.e. from 1st April <strong>${(new Date()).getFullYear() + ((new Date()).getMonth()>2 ? 0 : -1)}</strong> to 31st March <strong>${(new Date()).getFullYear() + ((new Date()).getMonth()>2 ? 1 : 0)}</strong>)
    {id:"MISSED_REVIEW", description:"Patients who <strong>have missed</strong> their annual chronic disease review", checkedByDefault:true},
    {id:"AFTER_APRIL", description:"Patients who <strong>have had</strong> their annual review but are still missing targets"},
    {id:"REVIEW_YET_TO_HAPPEN", description:"Patients who <strong>have not yet had</strong> their annual review"},
    {id:"NO_REVIEW", description:"Patients who <strong>have never before</strong> had an annual review"},
  ]
};
