var Highcharts = require('highcharts/highstock'),
  //  log = require('./log'),
  lookup = require('./lookup');

var _getPatientData = function (patient, callback) {
  //if callback provided do async - else do sync
  var isAsync = typeof (callback) === "function";

  if (dt.patients && dt.patients[patient]) {
    if (isAsync) return callback(dt.patients[patient]);
    else return dt.patients[patient];
  }

  $.ajax({
    url: "/api/PatientDetails/" + patient,
    async: isAsync,
    success: function (file) {
      if (!dt.patients) dt.patients = {};
      dt.patients[patient] = file;

      if (isAsync) callback(dt.patients[patient]);
    },
    error: function () {
      if (dt.patients.patient && isAsync) {
        dt.patients[patient] = dt.patients.patient;
        return callback(dt.patients.patient);
      } else if (!dt.patients.patient) {
        return callback(null);
      }
    }
  });

  if (!isAsync) return dt.patients[patient];
};

var isFetchingNhsLookup = false;

var dt = {

  clinicalArea: {
    "copd" : "COPD",
    "htn" : "Hypertension",
    "cvd.stroke" : "Stroke",
    "cvd.af" : "Atrial Fibrilation",
    "ckd" : "CKD",
    "ckdAndDm" : "Diabetes",
    "ckdAndProt" : "CKD",    
  },

  pathwayNames: {},
  diseases: [],
  options: [],
  excludedPatients: {},
  excludedPatientsByIndicator: {},

  getNHS: (practiceId, patientId) => {
    if(dt.patLookup && dt.patLookup[practiceId] && dt.patLookup[practiceId][patientId]) 
      return dt.patLookup[practiceId][patientId];
    return patientId;
  },

  populateNhsLookup: function (practiceId, done) {
    if (isFetchingNhsLookup) return;
    if (dt.patLookup && dt.patLookup[practiceId]) return done();
    isFetchingNhsLookup = true;
    $.getJSON("/api/nhs/" + practiceId, function (lookup) {
      if(!dt.patLookup) dt.patLookup = {};
      dt.patLookup[practiceId] = lookup;
      isFetchingNhsLookup = false;
      return done();
    });
  },

  getAllAgreedWithActions: function (practiceId, done) {
    $.ajax({
      type: "GET",
      url: "/api/action/all/" + practiceId,
      success: function (d) {
        return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  get: function (practiceId, force, callback, json) {
    $.getJSON("/api/Text", function (textfile) {
      dt.text = textfile;
      dt.getAllIndicatorData(practiceId, force, function () {
        dt.getExcludedPatients(practiceId, function (err) {
          if (typeof callback === 'function') {
            callback();
          }
        });
      });
    }).fail(function (err) {
      //alert("data/text.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
    });
  },

  processIndicatorRemoveExcludedPatients: function (indicator) {
    var indicatorClone = JSON.parse(JSON.stringify(indicator));
    var excludedPatients = dt.excludedPatientsByIndicator[indicatorClone.id];

    if (excludedPatients) {
      var includedPatients = {};
      indicatorClone.opportunities.forEach((opp) => {
        opp.patients.forEach((patid) => {
          includedPatients[patid] = true;
        });
      });
      excludedPatients = excludedPatients.filter((p) => {
        return includedPatients[p];
      });
      if (excludedPatients.length > 0) {
        var numDen = indicatorClone.performance.fraction.split('/');
        indicatorClone.performance.fraction = numDen[0] + '/' + (+numDen[1] - excludedPatients.length);
        indicatorClone.performance.percentage = Math.round(100 * +numDen[0] * 100 / (+numDen[1] - excludedPatients.length)) / 100;
        indicatorClone.patientsWithOpportunity -= excludedPatients.length;
      }
    }

    return indicatorClone;
  },

  processIndicatorsRemoveExcludedPatients: function (indicators) {
    return indicators.map(function (indicator) {
      return dt.processIndicatorRemoveExcludedPatients(indicator);
    });
  },

  processIndicators: function (indicators) {
    indicators = indicators.map(function (indicator) {
      var last = indicator.values[0].length - 1;
      var pathwayId = indicator.id.split(".")[0];
      var pathwayStage = indicator.id.split(".")[1];
      var standard = indicator.id.split(".")[2];
      if(dt.clinicalArea[pathwayId]) {
        indicator.clinicalArea = dt.clinicalArea[pathwayId];
      } else if (dt.clinicalArea[pathwayId + '.' + pathwayStage]) {
        indicator.clinicalArea = dt.clinicalArea[pathwayId + '.' + pathwayStage];
      } else {
        indicator.clinicalArea = 'Unknown';
      }
      //if (!dt.pathwayNames[pathwayId]) dt.pathwayNames[pathwayId] = "";
      var percentage = Math.round(100 * indicator.values[1][last] * 100 / indicator.values[2][last]) / 100;
      indicator.performance = {
        fraction: indicator.values[1][last] + "/" + indicator.values[2][last],
        percentage: percentage
      };
      if (indicator.type === "outcome") {
        indicator.performance.incidence = (percentage * 10).toFixed(1);
        indicator.performance.incidenceMultiple = (Math.round(100 * indicator.values[4][last] * 100 / indicator.values[2][last]) / 10).toFixed(1);
      }
      indicator.patientsWithOpportunity = indicator.values[2][last] - indicator.values[1][last];
      //indicator.benchmark = "90%"; //TODO magic number
      indicator.target = indicator.values[3][last] * 100 + "%";
      var lastPercentage = Math.round(100 * indicator.values[1][last - 1] * 100 / indicator.values[2][last - 1]) / 100;
      indicator.up = percentage > lastPercentage;
      indicator.change = percentage > lastPercentage ? "up" : (percentage < lastPercentage ? "down" : "none");
      var today = new Date();
      var lastyear = today.setYear(today.getFullYear() - 1);
      var trend = indicator.values[1].map(function (val, idx) {
        return (new Date(indicator.values[0][idx]) > lastyear) ? Math.round(100 * val * 100 / indicator.values[2][idx]) / 100 : "old";
      }).filter(function (v) {
        return v !== "old";
      });
      //trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].filter(function (v) {
        return new Date(v) > lastyear;
      });
      //dates.reverse();
      indicator.dates = dates;
      if (dt.text.pathways[pathwayId] && dt.text.pathways[pathwayId][pathwayStage] && dt.text.pathways[pathwayId][pathwayStage].standards[standard]) {
        indicator.description = dt.text.pathways[pathwayId][pathwayStage].standards[standard].description;
        indicator.name = dt.text.pathways[pathwayId][pathwayStage].standards[standard].name;
        indicator.tagline = dt.text.pathways[pathwayId][pathwayStage].standards[standard].tagline;
        indicator.positiveMessage = dt.text.pathways[pathwayId][pathwayStage].standards[standard].positiveMessage;
      } else {
        indicator.description = "No description specified";
        indicator.tagline = "";
        indicator.name = "Unknown";
      }
      indicator.aboveTarget = indicator.performance.percentage > +indicator.values[3][last] * 100;

      if (!dt.patientArray) dt.patientArray = [];
      dt.patientArray = indicator.opportunities.reduce(function (prev, curr) {
        var union = prev.concat(curr.patients);
        return union.filter(function (item, pos) {
          return union.indexOf(item) == pos;
        });
      }, dt.patientArray);

      indicator.opportunities = indicator.opportunities.map(function (v) {
        v.name = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[v.id].name;
        v.description = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[v.id].description;
        return v;
      });

      return indicator; //= { performance: indicator.performance, tagline: indicator.tagline, positiveMessage: indicator.positiveMessage, target: indicator.target, "opportunities": indicator.opportunities || [], "patients": {} };
    });

    return indicators;
  },

  //prepare an annoymised ranking demonstrating my postition in amongst other practices
  getPracticePerformanceData: function (practiceId, pathwayId, pathwayStage, standard, callback) {

    var practiceObj;

    var indicatorId = [pathwayId, pathwayStage, standard].join(".");

    $.ajax({
      url: "/api/BenchmarkDataFor/" + practiceId + "/" + indicatorId,
      success: function (benchmarkData) {
        return callback(benchmarkData);
      },
      error: function () {
        //throw some ungracious issue eventually...
      }
    });
  },

  getDisplayTextFromIndicatorId: function (indicatorId) {
    var parts = indicatorId.split(".");
    if (dt.text.pathways[parts[0]] && dt.text.pathways[parts[0]][parts[1]] && dt.text.pathways[parts[0]][parts[1]].standards[parts[2]]) {
      return dt.text.pathways[parts[0]][parts[1]].standards[parts[2]].tabText;
    } else {
      return "???";
    }
  },

  getAllIndicatorData: function (practiceId, force, callback) {
    //var addId = '/'+practiceId;
    var routeURL;
    if (practiceId) {
      routeURL = "/api/ListOfIndicatorsForPractice/" + practiceId;

    } else {
      routeURL = "/api/ListOfIndicatorsForPractice";
    }

    //we never want to cache this anymore.
    if (dt.indicators && !force) {
      var indicatorsToReturn = dt.processIndicatorsRemoveExcludedPatients(dt.indicators);
      return callback(indicatorsToReturn);
    } else {

      $.ajax({
        url: routeURL,
        success: function (file) {
          //don't retain the object, refresh of object
          dt.indicators = dt.processIndicators(file);

          var indicatorsToReturn = dt.processIndicatorsRemoveExcludedPatients(dt.indicators);
          return callback(indicatorsToReturn);
        },
        error: function () {

        }
      });
    }

  },

  // *b* practice id not used?
  getAllIndicatorDataSync: function (practiceId) {
    if (dt.indicators) {
      return dt.indicators;
    } else {
      //use practiceId to populate? TODO implement?
      return null;
    }
  },

  getIndicatorData: function (practiceId, indicatorId, callback) {
    if (dt.indicators && dt.indicators[indicatorId]) {
      return callback(dt.indicators[indicatorId]);
    }
    var isAsync = typeof (callback) === "function";

    $.ajax({
      url: "/api/PatientListForPractice/" + practiceId + "/Indicator/" + indicatorId,
      async: isAsync,
      success: function (file) {
        if (!dt.indicators) dt.indicators = {};
        dt.indicators[indicatorId] = file;

        if (isAsync) callback(dt.indicators[indicatorId]);
      },
      error: function () {

      }
    });

    if (!isAsync) return dt.indicators[indicatorId];
  },

  // *b* practice id not used??
  getTrendData: function (practiceId, pathwayId, pathwayStage, standard) {
    if (dt.indicators) {
      return dt.indicators.filter(function (v) {
        return v.id === [pathwayId, pathwayStage, standard].join(".");
      })[0];
    }
    return null;
  },

  getIndicatorDataSync: function (practiceId, indicatorId) {
    //practiceId not used in getAllIndicatorDataSync
    dt.getAllIndicatorDataSync(practiceId);
    var indicator = dt.indicators.filter(function (v) {
      return v.id === indicatorId;
    });
    if (indicator.length > 0) {
      return dt.processIndicatorRemoveExcludedPatients(indicator[0]);
    }
  },

  processPatientList: function (pathwayId, pathwayStage, standard, subsection, file) {
    var i, k, prop, pList, header, localPatients = file.patients;

    if (subsection !== "all") {
      var subsectionIds = Object.keys(dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities).filter(function (key) {
        return dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[key].name === subsection;
      });
      if (subsectionIds.length > 0) {
        localPatients = localPatients.filter(function (v) {
          return v.opportunities.indexOf(subsectionIds[0]) > -1;
        });
        header = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[subsectionIds[0]].description;
      }
    } else {
      header = dt.text.pathways[pathwayId][pathwayStage].standards[standard].tableTitle;
    }

    var vId = dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueId;
    var dOv = dt.text.pathways[pathwayId][pathwayStage].standards[standard].dateORvalue;

    var indicatorId = [pathwayId, pathwayStage, standard].join(".");
    var indicator = dt.indicators.filter((v)=>{return v.id===indicatorId;})[0];
    var opps = indicator.opportunities.map(function (v) {
      return v.id;
    });

    var numExcluded = 0;

    localPatients = localPatients.map(function (patient) {
      patient.nhsNumber = patient.nhs || patient.patientId;
      patient.items = [patient.age];
      if (patient.value) patient.items.push(patient.value);
      if (patient.date) patient.items.push(patient.date);
      if (patient.reviewDate) patient.items.push(patient.reviewDate);
      patient.items.push(patient.opportunities.map(function (v) {
        return '<span style="width:13px;height:13px;float:left;background-color:' + Highcharts.getOptions().colors[opps.indexOf(v)] + '"></span>';
      }).join("")); //The fields in the patient list table
      patient.excluded = false;
      if (dt.isExcluded(patient.patientId, indicatorId)) {
        numExcluded += 1;
        patient.excluded = true;
        patient.items.push('<span class="text-muted" data-container="body", data-html="true", data-toggle="tooltip", data-placement="bottom", title="' + dt.getExcludedTooltip(patient.patientId, indicatorId) + '"><i class="fa fa-fw fa-times"></i> EXCLUDED</span>');
      } else if (patient.actionStatus) {
        var releventActions = patient.actionStatus.filter(function (v) {
          return !v.indicatorList || v.indicatorList.indexOf(indicatorId) > -1;
        });
        if (releventActions.length > 0) {
          //This patient has had some interaction - agree / disagree / user added
          var info = {};
          var mostRecent;
          releventActions.forEach(function (v) {
            var name = $('#user_fullname').text().trim() === v.history[0].who ? "You have" : v.history[0].who + " has";
            if (!info[name]) info[name] = { agree: 0, added: 0 };

            if (!mostRecent) mostRecent = v.history[0].when;
            else mostRecent = Math.max(mostRecent, v.history[0].when);

            if (v.history[0].what === "agreed with") info[name].agree++;
            if (v.history[0].what === "added") info[name].added++;
          });
          var tooltip = Object.keys(info).map(function (v) {
            return v + " " +
              (info[v].agree > 0 ? " agreed with " + info[v].agree + " action" + (info[v].agree > 1 ? "s" : "") : "") +
              (info[v].agree > 0 && info[v].added > 0 ? " and " : "") +
              (info[v].added > 0 ? " added " + info[v].added + " action" + (info[v].added > 1 ? "s." : ".") : ".");
          }).join("<br>");
          patient.items.push('<i class="fa fa-fw fa-check text-success" data-container="body", data-html="true", data-toggle="tooltip", data-placement="bottom", title="' + tooltip + '"></i>');
        } else {
          patient.items.push("");
        }
      } else {
        patient.items.push("");
      }
      //add a hidden column excluded / not excluded for sorting
      if (patient.excluded) {
        patient.items.push(1);
      } else {
        patient.items.push(0);
      }
      return patient;

    });

    var rtn = {
      "patients": localPatients,
      "numExcluded": numExcluded,
      "type": file.type,
      "n": localPatients.length,
      "header": header,
      "header-items": [{
        "title": "NHS no.",
        "type": "numeric",
        "orderSequence": ["asc", "desc"],
        "isSorted": false,
        "direction": "sort-asc",
        "tooltip": "NHS number of each patient"
      }, {
        "title": "Age",
        "type": "numeric-?",
        "orderSequence": ["desc", "asc"],
        "isSorted": false,
        "direction": "sort-asc",
        "tooltip": "The age of the patient"
      }]
    };

    //middle column is either value or date
    if (!dOv) dOv = "date";
    if (dOv) {
      if (dOv !== 'date') {
        rtn["header-items"].push({
          "title": dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueName,
          "type": "numeric-?",
          "orderSequence": ["desc", "asc"],
          "tooltip": "Last " + vId + " reading",
          "isSorted": false,
          "direction": "sort-asc"
        });
      }
      if (dOv !== 'value') {
        rtn["header-items"].push({
          "title": dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueName + " date",
          "type": "date-uk",
          "orderSequence": ["desc", "asc"],
          "tooltip": "Last date " + vId + " was measured",
          "isSorted": false,
          "direction": "sort-asc"
        });
      }
    }

    if(indicator.displayReviewDate) {
      rtn["header-items"].push({
          "title": "Next review date",
          "type": "date-uk",
          "orderSequence": ["desc", "asc"],
          "tooltip": "Next review date",
          "isSorted": false,
          "direction": "sort-asc"
        });
    }

    //add qual standard column
    rtn["header-items"].push({
      "title": "Improvement opportunities",
      "type": "opps",
      "orderSequence": ["desc", "asc"],
      "isSorted": true,
      "tooltip": "Improvement opportunities from the bar chart above"
    });

    //add does patient have a plan column
    rtn["header-items"].push({
      "title": "Action plan?",
      "type": "plan",
      "orderSequence": ["desc", "asc"],
      "isSorted": false,
      "tooltip": "Whether this patient has had any actions added or agreed"
    });

    rtn["header-items"].push({
      "title": "Excluded",
      "type": "numeric?",
      "orderSequence": ["asc"],
      "isSorted": false,
      "hidden": true
    });

    return rtn;
  },

  getAllPatientList: function (practiceId, skip, limit, callback) {
    $.ajax({
      url: "api/WorstPatients/" + practiceId + "/" + skip + "/" + limit,
      success: function (file) {
        return callback(null, file);
      },
      error: function (err) {
        return callback(err);
      }
    });
  },

  getPatientList: function (practiceId, pathwayId, pathwayStage, standard, subsection, callback) {
    var indicatorId = [pathwayId, pathwayStage, standard].join(".");
    if (!subsection) subsection = "all";
    if (!dt.patientList) dt.patientList = {};
    if (!dt.patientList[practiceId]) dt.patientList[practiceId] = {};
    if (!dt.patientList[practiceId][indicatorId]) dt.patientList[practiceId][indicatorId] = {};

    if (dt.patientList[practiceId][indicatorId].file) {
      dt.patientList[practiceId][indicatorId][subsection] = dt.processPatientList(pathwayId, pathwayStage, standard, subsection, dt.patientList[practiceId][indicatorId].file);
      return callback(dt.patientList[practiceId][indicatorId][subsection]);
    } else {

      $.ajax({
        url: "/api/PatientListForPractice/" + practiceId + "/Indicator/" + indicatorId,
        success: function (file) {
          dt.patientList[practiceId][indicatorId].file = file;
          dt.patientList[practiceId][indicatorId][subsection] = dt.processPatientList(pathwayId, pathwayStage, standard, subsection, file);
          callback(dt.patientList[practiceId][indicatorId][subsection]);
        },
        error: function () {

        }
      });

    }
  },

  addOrUpdatePatientAction: function (patientId, action) {
    if (dt.patients && dt.patients[patientId] && dt.patients[patientId].standards) {
      var actions = {}; //keep track of which indicators need their action total updating
      dt.patients[patientId].standards = dt.patients[patientId].standards.map(function (v) {
        if(!actions[v.indicatorId]) {
          actions[v.indicatorId] = {before: 0, after: 0};
        }
        if (!v.actionPlans) v.actionPlans = [];
        actions[v.indicatorId].before += v.actionPlans.length;
        actions[v.indicatorId].after += v.actionPlans.length;
        if (v.actionPlans.filter(function (vv) { 
          return vv.actionTextId === action.actionTextId;
        }).length === 0) { //This is a new action
          if (action.indicatorList.indexOf(v.indicatorId) > -1 && (action.agree || action.userDefined)) {
            actions[v.indicatorId].after += 1;
            v.actionPlans.push({ actionTextId: action.actionTextId, agree: action.agree, history: action.history, indicatorList: action.indicatorList });
          }
        } else { // it's an existing action
          v.actionPlans = v.actionPlans.map(function (vv) {
            if (vv.actionTextId === action.actionTextId) {
              vv.agree = action.agree;
              vv.history = action.history;
              vv.indicatorList = action.indicatorList;
              if(action.agree || action.userDefined) {
                actions[v.indicatorId].after += 1;
              } else {
                actions[v.indicatorId].after -= 1;
              }
            }
            return vv;
          }).filter(function (vv) {
            return vv.agree || vv.userDefined;
          });
        }
        if (v.actionPlans.length > 0) v.actionPlan = true;
        else v.actionPlan = false;
        return v;
      });
      Object.keys(actions).forEach((indicatorId) => {
        const currentIndicator = dt.indicators.filter((v) => {
          return v.id === indicatorId;
        })[0];
        if(actions[indicatorId].after===0 && actions[indicatorId].before>0) currentIndicator.reviewed -= 1;
        else if(actions[indicatorId].before===0 && actions[indicatorId].after>0) currentIndicator.reviewed += 1;
      });
    }
    if (dt.patientList) {
      Object.keys(dt.patientList).forEach(function (practiceId) {
        Object.keys(dt.patientList[practiceId]).forEach(function (indicatorId) {
          Object.keys(dt.patientList[practiceId][indicatorId]).forEach(function (standard) {
            dt.patientList[practiceId][indicatorId][standard].patients.forEach(function (patient) {
              if (patient.patientId === +patientId) {
                if (!patient.actionStatus) patient.actionStatus = [];
                if (patient.actionStatus.filter(function (v) {
                  return v.actionTextId === action.actionTextId;
                }).length === 0) {
                  if (action.agree || action.userDefined) {
                    patient.actionStatus.push({ actionTextId: action.actionTextId, agree: action.agree, history: action.history, indicatorList: action.indicatorList });
                  }
                } else {
                  patient.actionStatus = patient.actionStatus.map(function (v) {
                    if (v.actionTextId === action.actionTextId) {
                      v.agree = action.agree;
                      v.history = action.history;
                      v.indicatorList = action.indicatorList;
                    }
                    return v;
                  }).filter(function (v) {
                    return v.agree || v.userDefined;
                  });
                }
                var releventActions = patient.actionStatus.filter(function (v) {
                  return !v.indicatorList || v.indicatorList.indexOf(indicatorId) > -1;
                });
                if (releventActions.length > 0) {
                  //This patient has had some interaction - agree / disagree / user added
                  var info = {};
                  var mostRecent;
                  releventActions.forEach(function (v) {
                    var name = $('#user_fullname').text().trim() === v.history[0].who ? "You have" : v.history[0].who + " has";
                    if (!info[name]) info[name] = { agree: 0, added: 0 };

                    if (!mostRecent) mostRecent = v.history[0].when;
                    else mostRecent = Math.max(mostRecent, v.history[0].when);

                    if (v.history[0].what === "agreed with") info[name].agree++;
                    if (v.history[0].what === "added") info[name].added++;
                  });
                  var tooltip = Object.keys(info).map(function (v) {
                    return v + " " +
                      (info[v].agree > 0 ? " agreed with " + info[v].agree + " action" + (info[v].agree > 1 ? "s" : "") : "") +
                      (info[v].agree > 0 && info[v].added > 0 ? " and " : "") +
                      (info[v].added > 0 ? " added " + info[v].added + " action" + (info[v].added > 1 ? "s." : ".") : ".");
                  }).join("<br>");
                  patient.items[patient.items.length - 1] = '<i class="fa fa-fw fa-check text-success" data-container="body", data-html="true", data-toggle="tooltip", data-placement="bottom", title="' + tooltip + '"></i>';
                } else {
                  patient.items[patient.items.length - 1] = "";
                }
              }
            });
          });
        });
      });
    }
  },

  removePatientAction: function (patientId, actionTextId) {
    if (dt.patients && dt.patients[patientId] && dt.patients[patientId].standards) {
      var actions = {}; //keep track of which indicators need their action total updating
      dt.patients[patientId].standards = dt.patients[patientId].standards.map(function (v) {
        if(!actions[v.indicatorId]) {
          actions[v.indicatorId] = {before: 0, after: 0};
        }
        if (v.actionPlans) {
          actions[v.indicatorId].before += v.actionPlans.length;
          v.actionPlans = v.actionPlans.filter(function (vv) {
            return vv.actionTextId !== actionTextId;
          });
          actions[v.indicatorId].after += v.actionPlans.length;
          if (v.actionPlans.length === 0) v.actionPlan = false;
        }
        return v;
      });
      Object.keys(actions).forEach((indicatorId) => {
        const currentIndicator = dt.indicators.filter((v) => {
          return v.id === indicatorId;
        })[0];
        if(actions[indicatorId].after===0 && actions[indicatorId].before>0) currentIndicator.reviewed -= 1;
        else if(actions[indicatorId].before===0 && actions[indicatorId].after>0) currentIndicator.reviewed += 1;
      });
    }
    if (dt.patientList) {
      Object.keys(dt.patientList).forEach(function (practiceId) {
        Object.keys(dt.patientList[practiceId]).forEach(function (indicatorId) {
          Object.keys(dt.patientList[practiceId][indicatorId]).forEach(function (standard) {
            dt.patientList[practiceId][indicatorId][standard].patients.forEach(function (patient) {
              if (patient.patientId === +patientId) {
                patient.actionStatus = patient.actionStatus.filter(function (v) {
                  return v.actionTextId !== actionTextId;
                });
                if (patient.actionStatus.filter(function (v) {
                  return v.indicatorList && v.indicatorList.indexOf(indicatorId) > -1;
                }).length === 0) {
                  patient.items[patient.items.length - 1] = "";
                }
              }
            });
          });
        });
      });
    }
  },

  getPatientData: function (patientId, callback) {
    return _getPatientData(patientId, callback);
  },

  getPatientActionData: function (practiceId, patientId, callback) {
    $.ajax({
      url: "api/action/individual/" + practiceId + "/" + patientId,
      success: function (file) {
        return callback(null, file);
      },
      error: function (err) {
        return callback(err);
      }
    });
  },

  getTeamActionData: function (practiceId, indicatorId, callback) {
    $.ajax({
      url: "api/action/team/" + practiceId + "/" + indicatorId,
      success: function (file) {
        return callback(null, file);
      },
      error: function (err) {
        return callback(err);
      }
    });
  },

  getExcludedPatients: function (practiceId, callback) {
    $.ajax({
      url: "/api/excludedpatients/practice/" + practiceId,
      success: function (file) {
        dt.excludedPatients = {};
        dt.excludedPatientsByIndicator = {};
        file.forEach(function (v) {
          if (!dt.excludedPatients[v.patientId]) dt.excludedPatients[v.patientId] = [v];
          else dt.excludedPatients[v.patientId].push(v);
          if (!dt.excludedPatientsByIndicator[v.indicatorId]) dt.excludedPatientsByIndicator[v.indicatorId] = [v.patientId];
          else dt.excludedPatientsByIndicator[v.indicatorId].push(v.patientId);
        });
        if (callback) return callback(null, dt.excludedPatients);
      },
      error: function (err) {
        if (callback) return callback(err);
      }
    });
  },

  isExcluded: function (patientId, indicatorId) {
    if (dt.excludedPatients[patientId] && dt.excludedPatients[patientId].filter(function (v) {
      return v.indicatorId === indicatorId;
    }).length > 0) return true;
    return false;
  },

  getExcludedTooltip: function (patientId, indicatorId) {
    var thing = dt.excludedPatients[patientId].filter(function (v) {
      return v.indicatorId === indicatorId;
    })[0];
    return thing.who + ' excluded this patient from this indicator on ' + new Date(thing.when).toDateString() + (thing.reason ? ' because: ' + (thing.reason === 'other' && thing.freetext ? thing.freetext : thing.reason) : '');
  },

};
window.DATA = dt;
module.exports = dt;
