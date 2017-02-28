var Highcharts = require('highcharts/highstock'),
  //  log = require('./log'),
  lookup = require('./lookup');

var _getFakePatientData = function(patient, callback) {
  var r = Math.random(),
    isAsync = typeof(callback) === "function";
  if (dt.patients && dt.patients.patient) {
    if (isAsync) return callback(dt.patients.patient);
    else return dt.patients.patient;
  }
  $.ajax({
    url: "data/patient.json?v=" + r,
    async: isAsync,
    success: function(file) {
      if (!dt.patients) dt.patients = {};
      dt.patients.patient = file;
      dt.patients[patient] = file;

      if (isAsync) callback(dt.patients.patient);
    }
  });
  if (!isAsync) return dt.patients.patient;
};

var _getPatientData = function(patient, callback) {
  //if callback provided do async - else do sync
  var isAsync = typeof(callback) === "function";

  if (dt.patients && dt.patients[patient]) {
    if (isAsync) return callback(dt.patients[patient]);
    else return dt.patients[patient];
  }

  $.ajax({
    url: "/api/PatientDetails/" + patient,
    async: isAsync,
    success: function(file) {
      if (!dt.patients) dt.patients = {};
      dt.patients[patient] = file;

      if (isAsync) callback(dt.patients[patient]);
    },
    error: function() {
      if (dt.patients.patient && isAsync) {
        dt.patients[patient] = dt.patients.patient;
        return callback(dt.patients.patient);
      } else if (!dt.patients.patient) {
        _getFakePatientData(patient, callback);
      }
    }
  });

  if (!isAsync) return dt.patients[patient];
};

var dt = {

  pathwayNames: {},
  diseases: [],
  options: [],

  populateNhsLookup: function(done) {
    if (dt.patLookup) return done();
    $.getJSON("/api/nhs", function(lookup) {
      dt.patLookup = lookup;
      return done();
    });
  },

  getAllAgreedWithActions: function(done) {
    $.ajax({
      type: "GET",
      url: "/api/action/all/",
      success: function(d) {
        return done(null, d);
      },
      dataType: "json",
      contentType: "application/json"
    });
  },

  get: function(callback, json) {
    $.getJSON("/api/userDetails", function(userDetails) {
      dt.userDetails = userDetails;

      $.getJSON("/api/Text", function(textfile) {
        dt.text = textfile;
        if (typeof callback === 'function') {
          callback();
        }
      }).fail(function(err) {
        //alert("data/text.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
      });
    });
  },

  processIndicators: function(indicators) {
    indicators = indicators.map(function(indicator) {
      var last = indicator.values[0].length - 1;
      var pathwayId = indicator.id.split(".")[0];
      var pathwayStage = indicator.id.split(".")[1];
      var standard = indicator.id.split(".")[2];
      //if (!dt.pathwayNames[pathwayId]) dt.pathwayNames[pathwayId] = "";
      var percentage = Math.round(100 * indicator.values[1][last] * 100 / indicator.values[2][last]) / 100;
      indicator.performance = {
        fraction: indicator.values[1][last] + "/" + indicator.values[2][last],
        percentage: percentage
      };
      //indicator.benchmark = "90%"; //TODO magic number
      indicator.target = indicator.values[3][last] * 100 + "%";
      var lastPercentage = Math.round(100 * indicator.values[1][last - 1] * 100 / indicator.values[2][last - 1]) / 100;
      indicator.up = percentage > lastPercentage;
      indicator.change = percentage > lastPercentage ? "up" : (percentage < lastPercentage ? "down" : "none");
      var today = new Date();
      var lastyear = today.setYear(today.getFullYear() - 1);
      var trend = indicator.values[1].map(function(val, idx) {
        return (new Date(indicator.values[0][idx]) > lastyear) ? Math.round(100 * val * 100 / indicator.values[2][idx]) / 100 : "old";
      }).filter(function(v) {
        return v !== "old";
      });
      //trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].filter(function(v) {
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
      dt.patientArray = indicator.opportunities.reduce(function(prev, curr) {
        var union = prev.concat(curr.patients);
        return union.filter(function(item, pos) {
          return union.indexOf(item) == pos;
        });
      }, dt.patientArray);

      indicator.opportunities = indicator.opportunities.map(function(v) {
        v.name = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[v.id].name;
        v.description = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[v.id].description;
        return v;
      });

      return indicator; //= { performance: indicator.performance, tagline: indicator.tagline, positiveMessage: indicator.positiveMessage, target: indicator.target, "opportunities": indicator.opportunities || [], "patients": {} };
    });

    return indicators;
  },

  //prepare an annoymised ranking demonstrating my postition in amongst other practices
  getPracticePerformanceData: function(pathwayId, pathwayStage, standard, callback) {

    var practiceObj;

    var indicatorId = [pathwayId, pathwayStage, standard].join(".");

    $.ajax({
      url: "/api/BenchmarkDataFor/" + indicatorId,
      success: function(benchmarkData) {
        return callback(benchmarkData);
      },
      error: function() {
        //throw some ungracious issue eventually...
      }
    });
  },

  getAllIndicatorData: function(practiceId, callback) {
    //var addId = '/'+practiceId;
    var routeURL;
    if (practiceId) {
      routeURL = "/api/ListOfIndicatorsForPractice/" + practiceId;

    } else {
      routeURL = "/api/ListOfIndicatorsForPractice";
    }

    //we never want to cache this anymore.
    if (dt.indicators) {
      return callback(dt.indicators);
    } else {

      $.ajax({
        url: routeURL,
        success: function(file) {
          //don't retian the object, refresh of object
          dt.indicators = dt.processIndicators(file);

          return callback(dt.indicators);
        },
        error: function() {

        }
      });
    }

  },

  // *b* practice id not used?
  getAllIndicatorDataSync: function(practiceId) {
    if (dt.indicators) {
      return dt.indicators;
    } else {
      //use practiceId to populate? TODO implement?
      return null;
    }
  },

  getIndicatorData: function(practiceId, indicatorId, callback) {
    if (dt.indicators && dt.indicators[indicatorId]) {
      return callback(dt.indicators[indicatorId]);
    }
    var isAsync = typeof(callback) === "function";

    $.ajax({
      url: "/api/PatientListForPractice/Indicator/" + indicatorId,
      async: isAsync,
      success: function(file) {
        if (!dt.indicators) dt.indicators = {};
        dt.indicators[indicatorId] = file;

        if (isAsync) callback(dt.indicators[indicatorId]);
      },
      error: function() {

      }
    });

    if (!isAsync) return dt.indicators[indicatorId];
  },

  // *b* practice id not used??
  getTrendData: function(practiceId, pathwayId, pathwayStage, standard) {
    if (dt.indicators) {
      return dt.indicators.filter(function(v) {
        return v.id === [pathwayId, pathwayStage, standard].join(".");
      })[0];
    }
    return null;
  },

  getIndicatorDataSync: function(practiceId, indicatorId) {
    //practiceId not used in getAllIndicatorDataSync
    dt.getAllIndicatorDataSync(practiceId);
    var indicator = dt.indicators.filter(function(v) {
      return v.id === indicatorId;
    });
    if (indicator.length > 0) {
      return indicator[0];
    }
  },

  processPatientList: function(pathwayId, pathwayStage, standard, subsection, patients) {
    var i, k, prop, pList, header;

    if (subsection !== "all") {
      var subsectionIds = Object.keys(dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities).filter(function(key) {
        return dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[key].name === subsection;
      });
      if (subsectionIds.length > 0) {
        patients = patients.filter(function(v) {
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
    var opps = dt.indicators.filter(function(v) {
      return v.id === indicatorId;
    })[0].opportunities.map(function(v) {
      return v.id;
    });

    patients = patients.map(function(patient) {
      patient.nhsNumber = patient.nhs || patient.patientId;
      patient.items = [
        patient.age,
        patient.value,
        patient.opportunities.map(function(v) {
          return '<span style="width:13px;height:13px;float:left;background-color:' + Highcharts.getOptions().colors[opps.indexOf(v)] + '"></span>';
        }).join("")
      ]; //The fields in the patient list table
      if (patient.actionStatus) {
        var releventActions = patient.actionStatus.filter(function(v) {
          return !v.indicatorList || v.indicatorList.indexOf(indicatorId) > -1;
        });
        if (releventActions.length > 0) {
          //This patient has had some interaction - agree / disagree / user added
          var info = {};
          var mostRecent;
          releventActions.forEach(function(v) {
            var name = $('#user_fullname').text().trim() === v.history[0].who ? "You have" : v.history[0].who + " has";
            if (!info[name]) info[name] = { agree: 0, added: 0 };

            if (!mostRecent) mostRecent = v.history[0].when;
            else mostRecent = Math.max(mostRecent, v.history[0].when);

            if (v.history[0].what === "agreed with") info[name].agree++;
            if (v.history[0].what === "added") info[name].added++;
          });
          var tooltip = Object.keys(info).map(function(v) {
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
      return patient;

    });

    var rtn = {
      "patients": patients,
      "n": patients.length,
      "header": header,
      "header-items": [{
        "title": "NHS no.",
        "isSorted": false,
        "direction": "sort-asc",
        "tooltip": "NHS number of each patient"
      }, {
        "title": "Age",
        "isSorted": false,
        "direction": "sort-asc",
        "tooltip": "The age of the patient"
      }]
    };

    //middle column is either value or date
    if (dOv) {
      rtn["header-items"].push({
        "title": dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueName,
        "tooltip": dOv === "date" ? "Last date " + vId + " was measured" : "Last " + vId + " reading",
        "isSorted": false,
        "direction": "sort-asc"
      });
    } else {
      if (pathwayStage === lookup.categories.monitoring.name) {
        rtn["header-items"].push({
          "title": "Last BP Date",
          "isSorted": false,
          "direction": "sort-asc",
          "tooltip": "Last date BP was measured"
        });
      } else {
        rtn["header-items"].push({
          "title": "Last SBP",
          "tooltip": "Last systolic BP reading",
          "isSorted": false,
          "direction": "sort-asc"
        });
      }
    }

    //add qual standard column
    rtn["header-items"].push({
      "title": "Improvement opportunities",
      "isSorted": true,
      "tooltip": "Improvement opportunities from the bar chart above"
    });

    //add does patient have a plan column
    rtn["header-items"].push({
      "title": "Action plan?",
      "isSorted": false,
      "tooltip": "Whether this patient has had any actions added, agreed or disagreed"
    });

    return rtn;
  },

  getPatientList: function(practiceId, pathwayId, pathwayStage, standard, subsection, callback) {
    var indicatorId = [pathwayId, pathwayStage, standard].join(".");
    if (!subsection) subsection = "all";
    if (!dt.patientList) dt.patientList = {};
    if (!dt.patientList[practiceId]) dt.patientList[practiceId] = {};
    if (!dt.patientList[practiceId][indicatorId]) dt.patientList[practiceId][indicatorId] = {};

    if (dt.patientList[practiceId][indicatorId][subsection]) {
      return callback(dt.patientList[practiceId][indicatorId][subsection]);
    } else {

      $.ajax({
        url: "/api/PatientListForPractice/Indicator/" + indicatorId,
        success: function(file) {
          dt.patientList[practiceId][indicatorId][subsection] = dt.processPatientList(pathwayId, pathwayStage, standard, subsection, file);

          callback(dt.patientList[practiceId][indicatorId][subsection]);
        },
        error: function() {

        }
      });

    }
  },

  addOrUpdatePatientAction: function(patientId, action) {
    if (!dt.patientList) return;
    Object.keys(dt.patientList).forEach(function(a) {
      Object.keys(dt.patientList[a]).forEach(function(b) {
        Object.keys(dt.patientList[a][b]).forEach(function(c) {
          dt.patientList[a][b][c].patients.forEach(function(patient) {
            if (patient.patientId === +patientId) {
              if (!patient.actionStatus) patient.actionStatus = [];
              if (patient.actionStatus.filter(function(v) {
                  return v.actionTextId === action.actionTextId;
                }).length === 0) {
                if (action.agree === true || action.agree === false || action.userDefined === true) {
                  patient.actionStatus.push({ actionTextId: action.actionTextId, agree: action.agree, history: action.history });
                }
              } else {
                patient.actionStatus = patient.actionStatus.map(function(v) {
                  if (v.actionTextId === action.actionTextId) {
                    v.agree = action.agree;
                    v.history = action.history;
                  }
                  return v;
                }).filter(function(v) {
                  return v.agree === true || v.agree === false;
                });
              }
              var releventActions = patient.actionStatus.filter(function(v) {
                return !v.indicatorList || v.indicatorList.indexOf(b) > -1;
              });
              if (releventActions.length > 0) {
                //This patient has had some interaction - agree / disagree / user added
                var info = {};
                var mostRecent;
                releventActions.forEach(function(v) {
                  var name = $('#user_fullname').text().trim() === v.history[0].who ? "You have" : v.history[0].who + " has";
                  if (!info[name]) info[name] = { agree: 0, added: 0 };

                  if (!mostRecent) mostRecent = v.history[0].when;
                  else mostRecent = Math.max(mostRecent, v.history[0].when);

                  if (v.history[0].what === "agreed with") info[name].agree++;
                  if (v.history[0].what === "added") info[name].added++;
                });
                var tooltip = Object.keys(info).map(function(v) {
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
  },

  removePatientAction: function(patientId, actionTextId) {
    if (!dt.patientList) return;
    Object.keys(dt.patientList).forEach(function(a) {
      Object.keys(dt.patientList[a]).forEach(function(b) {
        Object.keys(dt.patientList[a][b]).forEach(function(c) {
          dt.patientList[a][b][c].patients.forEach(function(patient) {
            if (patient.patientId === +patientId) {
              patient.actionStatus = patient.actionStatus.filter(function(v) {
                return v.actionTextId !== actionTextId;
              });
              if (patient.actionStatus.length === 0) {
                patient.items[patient.items.length - 1] = "";
              }
            }
          });
        });
      });
    });
  },

  getPatientData: function(patientId, callback) {
    return _getPatientData(patientId, callback);
  },

  getPatientActionData: function(patientId, callback) {
    $.ajax({
      url: "api/action/individual/" + patientId,
      success: function(file) {
        return callback(null, file);
      },
      error: function(err) {
        return callback(err);
      }
    });
  },

  getTeamActionData: function(indicatorId, callback) {
    $.ajax({
      url: "api/action/team/" + indicatorId,
      success: function(file) {
        return callback(null, file);
      },
      error: function(err) {
        return callback(err);
      }
    });
  }

};

module.exports = dt;
