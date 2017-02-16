var Highcharts = require('highcharts/highstock'),
  log = require('./log'),
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

  populateNhsLookup: function(done){
    if(dt.patLookup) return done();
    $.getJSON("/api/nhs", function(lookup){
      dt.patLookup = lookup;
      return done();
    });
  },

  getPatietListForStandard: function(pathwayId, pathwayStage, standard) {
    var patients = dt.removeDuplicates(dt[pathwayId][pathwayStage].standards[standard].opportunities.reduce(function(a, b) {
      return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
    }));
    return patients;
  },

  getPatientStatus: function(patientId, pathwayId, pathwayStage, standard) {
    if (dt.patients[patientId].breach) {
      if (dt.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard;
        }).length > 0) {
        return "missed";
      } else if (dt.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId && val.pathwayStage === "diagnosis";
        }).length > 0 && pathwayStage !== "diagnosis") {
        return "not";
      } else if (dt.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId;
        }).length > 0) {
        return "ok";
      } else {
        return "not";
      }
    } else {
      return "not";
    }
  },

  getNumeratorForStandard: function(pathwayId, pathwayStage, standard) {
    var patients = dt.getPatietListForStandard(pathwayId, pathwayStage, standard);
    return patients.length;
  },

  getDenominatorForStandard: function(pathwayId, pathwayStage) {
    var patients = dt[pathwayId][pathwayStage].patientsOk;
    for (var standard in dt[pathwayId][pathwayStage].standards) {
      var newPatients = dt.getPatietListForStandard(pathwayId, pathwayStage, standard);
      patients = patients.concat(newPatients);
    }
    return dt.removeDuplicates(patients).length;
  },

  removeDuplicates: function(array) {
    var arrResult = {};
    var rtn = [];
    for (var i = 0; i < array.length; i++) {
      arrResult[array[i]] = array[i];
    }
    for (var item in arrResult) {
      rtn.push(arrResult[item]);
    }
    return rtn;
  },

  numberOfStandardsMissed: function(patientId) {
    if (!dt.patients[patientId].breach) return 0;
    var a = dt.patients[patientId].breach.map(function(val) {
      return val.pathwayId + val.pathwayStage + val.standard;
    });
    var obj = {};
    for (var i = 0; i < a.length; i++) {
      obj[a[i]] = "";
    }
    return Object.keys(obj).length;
  },

  getAllPatients: function() {
    var pList = [],
      i, k, prop;
    for (k = 0; k < dt.diseases.length; k++) {
      for (i in lookup.categories) {
        for (prop in dt[dt.diseases[k].id][i].bdown) {
          if (dt[dt.diseases[k].id][i].bdown.hasOwnProperty(prop)) {
            pList = pList.concat(dt[dt.diseases[k].id][i].bdown[prop].patients);
          }
        }
        pList = pList.concat(dt[dt.diseases[k].id][i].patientsOk);
      }
    }
    pList = dt.removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
      var ret = dt.patients[patientId];
      ret.nhsNumber = dt.patLookup ? dt.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(dt.numberOfStandardsMissed(patientId));
      return ret;
    });

    return patients;
  },

  get: function(callback, json) {
    //get text
    //$.getJSON("data/text.json?v=" + Math.random(), function(textfile) {
    $.getJSON("/api/userDetails", function(userDetails){
        dt.userDetails = userDetails;

      $.getJSON("/api/Text", function(textfile) {
        dt.text = textfile;

        if (json) {
          dt.newload(json);
          if (typeof callback === 'function') callback();
        } else {
        /*  $.getJSON("data/data.json?v=" + Math.random(), function(file) {
            dt.newload(file);
            if (typeof callback === 'function') callback();
          }).fail(function(err) {
            alert("data/data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
          });*/
          if (typeof callback === 'function') callback();
        }

      }).fail(function(err) {
        alert("data/text.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
      });
    });
  },

  newload: function(file) {
    dt.indicators = file.indicators;
    dt.pathwayNames = {};

    if (file.text) dt.text = file.text;

    dt.indicators.forEach(function(indicator) {
      var last = indicator.values[0].length - 1;
      var pathwayId = indicator.id.split(".")[0];
      var pathwayStage = indicator.id.split(".")[1];
      var standard = indicator.id.split(".")[2];
      if (!dt.pathwayNames[pathwayId]) dt.pathwayNames[pathwayId] = "";
      var percentage = Math.round(100 * indicator.values[1][last] * 100 / indicator.values[2][last]) / 100;
      indicator.performance = {
        fraction: indicator.values[1][last] + "/" + indicator.values[2][last],
        percentage: percentage
      };
      //indicator.benchmark = "90%"; //TODO magic number
      indicator.target = indicator.values[3][last] * 100 + "%";
      var lastPercentage = Math.round(100 * indicator.values[1][last - 1] * 100 / indicator.values[2][last - 1]) / 100;
      indicator.up = percentage > lastPercentage;
      indicator.change= percentage > lastPercentage ? "up" : (percentage < lastPercentage ? "down" : "none");
      var trend = indicator.values[1].map(function(val, idx) {
        return Math.round(100 * val * 100 / indicator.values[2][idx]) / 100;
      }).slice(Math.max(1, last - 10), Math.max(1, last - 10) + 11);
      //trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].slice(Math.max(1, last - 10), Math.max(1, last - 10) + 11);
      //dates.reverse();
      indicator.dates = dates;
      if (dt.text.pathways[pathwayId] && dt.text.pathways[pathwayId][pathwayStage] && dt.text.pathways[pathwayId][pathwayStage].standards[standard]) {
        indicator.description = dt.text.pathways[pathwayId][pathwayStage].standards[standard].description;
        indicator.tagline = dt.text.pathways[pathwayId][pathwayStage].standards[standard].tagline;
        indicator.positiveMessage = dt.text.pathways[pathwayId][pathwayStage].standards[standard].positiveMessage;
      } else {
        indicator.description = "No description specified";
        indicator.tagline = "";
      }
      indicator.aboveTarget = indicator.performance.percentage > +indicator.values[3][last] * 100;

      dt.indicators[indicator.id] = { performance: indicator.performance, tagline: indicator.tagline, positiveMessage: indicator.positiveMessage, target: indicator.target, "opportunities": indicator.opportunities || [], "patients": {} };

      //apply which categories people belong to
      dt.patients = {};
      dt.patientArray = [];

      Object.keys(file.patients).forEach(function(patient) {
        dt.patientArray.push(patient);
        dt.patients[patient] = file.patients[patient];
        dt.indicators[indicator.id].patients[patient] = {};
        dt.indicators[indicator.id].patients[patient].opportunities = [];
        dt.indicators[indicator.id].opportunities.forEach(function(opp, idx) {
          if (opp.patients.indexOf(+patient) > -1) {
            dt.indicators[indicator.id].patients[patient].opportunities.push(idx);
          }
        });
      });
    });


  },

  load: function(file) {
    var d = "",
      j, k, key, data = file.diseases;

    dt = jQuery.extend(dt, data); //copy

    dt.patients = file.patients;
    dt.codes = file.codes;
    dt.patientArray = [];
    for (var o in file.patients) {
      if (file.patients.hasOwnProperty(o)) {
        dt.patientArray.push(o);
      }
    }

    for (d in data) {
      dt.pathwayNames[d] = data[d]["display-name"];
      var diseaseObject = {
        "id": d,
        "link": data[d].link ? data[d].link : "dt/" + d,
        "faIcon": data[d].icon,
        "name": data[d]["display-name"],
        "text": {
          "dt": {
            "tooltip": data[d]["side-panel-tooltip"]
          }
        }
      };
      if (data[d].monitoring.text) {
        diseaseObject.text.monitoring = data[d].monitoring.text.sidePanel;
      }
      if (data[d].treatment.text) {
        diseaseObject.text.treatment = data[d].treatment.text.sidePanel;
      }
      if (data[d].diagnosis.text) {
        diseaseObject.text.diagnosis = data[d].diagnosis.text.sidePanel;
      }
      if (data[d].exclusions.text) {
        diseaseObject.text.exclusions = data[d].exclusions.text.sidePanel;
      }
      this.diseases.push(diseaseObject);
      dt[d].suggestions = log.plan[d].team;
      $.extend(dt[d].monitoring, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(dt[d].treatment, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(dt[d].diagnosis, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(dt[d].exclusions, {
        "breakdown": [],
        "bdown": {}
      });

      if (!dt[d].monitoring.header) continue;
      for (key in dt[d].monitoring.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "monitoring",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Monitoring" + ' - ' + dt[d].monitoring.standards[key].tab.title
        });
        for (j = 0; j < dt[d].monitoring.standards[key].opportunities.length; j++) {
          dt[d].monitoring.bdown[dt[d].monitoring.standards[key].opportunities[j].name] = dt[d].monitoring.standards[key].opportunities[j];
          dt[d].monitoring.bdown[dt[d].monitoring.standards[key].opportunities[j].name].suggestions = log.plan[d].monitoring.individual[dt[d].monitoring.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].monitoring.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].monitoring.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].monitoring.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].monitoring.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "monitoring",
              "standard": key,
              "subsection": dt[d].monitoring.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in dt[d].diagnosis.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "diagnosis",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Diagnosis" + ' - ' + dt[d].diagnosis.standards[key].tab.title
        });
        for (j = 0; j < dt[d].diagnosis.standards[key].opportunities.length; j++) {
          dt[d].diagnosis.bdown[dt[d].diagnosis.standards[key].opportunities[j].name] = dt[d].diagnosis.standards[key].opportunities[j];
          dt[d].diagnosis.bdown[dt[d].diagnosis.standards[key].opportunities[j].name].suggestions = log.plan[d].diagnosis.individual[dt[d].diagnosis.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].diagnosis.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].diagnosis.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].diagnosis.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].diagnosis.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "diagnosis",
              "standard": key,
              "subsection": dt[d].diagnosis.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in dt[d].treatment.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "treatment",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Treatment" + ' - ' + dt[d].treatment.standards[key].tab.title
        });
        for (j = 0; j < dt[d].treatment.standards[key].opportunities.length; j++) {
          dt[d].treatment.bdown[dt[d].treatment.standards[key].opportunities[j].name] = dt[d].treatment.standards[key].opportunities[j];
          dt[d].treatment.bdown[dt[d].treatment.standards[key].opportunities[j].name].suggestions = log.plan[d].treatment.individual[dt[d].treatment.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].treatment.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].treatment.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].treatment.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].treatment.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "treatment",
              "standard": key,
              "subsection": dt[d].treatment.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in dt[d].exclusions.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "exclusions",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Exclusions" + ' - ' + dt[d].exclusions.standards[key].tab.title
        });
        for (j = 0; j < dt[d].exclusions.standards[key].opportunities.length; j++) {
          dt[d].exclusions.bdown[dt[d].exclusions.standards[key].opportunities[j].name] = dt[d].exclusions.standards[key].opportunities[j];
          dt[d].exclusions.bdown[dt[d].exclusions.standards[key].opportunities[j].name].suggestions = log.plan[d].exclusions.individual[dt[d].exclusions.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].exclusions.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].exclusions.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].exclusions.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].exclusions.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "exclusions",
              "standard": key,
              "subsection": dt[d].exclusions.standards[key].opportunities[j].name
            });
          }
        }
      }
    }
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
      indicator.change= percentage > lastPercentage ? "up" : (percentage < lastPercentage ? "down" : "none");
      var today = new Date();
      var lastyear = today.setYear(today.getFullYear()-1);
      var trend = indicator.values[1].map(function(val, idx) {
        return (new Date(indicator.values[0][idx]) > lastyear) ? Math.round(100 * val * 100 / indicator.values[2][idx]) / 100 : "old";
      }).filter(function(v){
        return v !== "old";
      });
      //trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].filter(function(v){
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

      if(!dt.patientArray) dt.patientArray=[];
      dt.patientArray = indicator.opportunities.reduce(function(prev, curr) {
        var union = prev.concat(curr.patients);
        return union.filter(function(item, pos) {
          return union.indexOf(item) == pos;
        });
      }, dt.patientArray);

      indicator.opportunities = indicator.opportunities.map(function(v){
        v.name = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[v.id].name;
        v.description = dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities[v.id].description;
        return v;
      });

      return indicator; //= { performance: indicator.performance, tagline: indicator.tagline, positiveMessage: indicator.positiveMessage, target: indicator.target, "opportunities": indicator.opportunities || [], "patients": {} };
    });

    return indicators;
  },
  //get a raw list of all practices
  getPractices: function(callback) {
    if (dt.practices) {
      return callback(dt.practices);
    } else {

      $.ajax({
        url: "/api/ListOfPractices",
        success: function(file) {
          if (!dt.practices)
          {
            dt.practices = file;
          }

          return callback(dt.practices);
        },
        error: function() {
            //throw some ungracious issue eventually...
        }
      });
    }
  },
  //prepare an annoymised ranking demonstrating my postition in amongst other practices
  getPracticePerformanceData: function(pathwayId, pathwayStage, standard, callback) {

    var practiceObj;

    var indicatorId = [pathwayId, pathwayStage, standard].join(".");

    $.ajax({
      url: "/api/BenchmarkDataFor/" +indicatorId,
      success: function(benchmarkData) {
        return callback(benchmarkData);
      },
      error: function() {
          //throw some ungracious issue eventually...
      }
    });

/*
    //get all practice data
    dt.getPractices(function(_data){
      //got the practice data!
      practiceObj = _data;
      var userPractice = dt.userDetails.practiceId;
      //generate the pathwayName
      ////////var indicatorId = [pathwayId, pathwayStage, standard].join(".");

      var rawData = [];
      var productObj = [];
      //dynamically identify all calls necessary and create deferred objects
      var asyncPracticeCalls = [];
      //generate and push a call for each practice found
      for(var i = 0; i < practiceObj.length; ++i)
      {
        asyncPracticeCalls.push($.ajax({
              url: "/api/ListOfIndicatorsForPractice/" + practiceObj[i]._id,
              success: function(file, i) {
                dt.indicators = dt.processIndicators(file);
                return dt.indicators;
              }
            }));
      }

      //once all async calls are complete move on to done
      $.when.apply($, asyncPracticeCalls).done(function() {
          rawData = arguments;
          //pass the practice object so that full names are available
          sculptData(rawData, practiceObj);
          });

      //form raw data into an final product and return
      function sculptData(rawData, practiceObj){
        var returnObjs = rawData;
        for(var i = 0; i < rawData.length; ++i)
        {
            //find the object that corresponds to indicatorId
            var tempData = jQuery.grep(rawData[i][0], function (n, i){
              return ( n.id == indicatorId);
            });

            //last is the index of most recent observation from array
            var last = tempData[0].values[0].length - 1;
            //identify the practice as either the user or not
            var _name = "";
            var _fullName = tempData[0].practiceId;
            if(userPractice == tempData[0].practiceId)
            {

              _name = "You";
              _fullName = "You";
            }
            else {
              _name = "P" + i;
              if(practiceObj[i].name)
              {
                _fullName = practiceObj[i].name;
              }
            }
            //generate the refined product value
            var valueOfX = (tempData[0].values[1][last]/tempData[0].values[2][last])*100;
            //x = value, p = practiceId, local = is this practice local to user practice
            if(i < 10 || _name === "You")
            {
              productObj[i] = {"x": valueOfX, "p": _name, "pFull": _fullName, local: true };
            }
            else {
              productObj[i] = {"x": valueOfX, "p": _name, "pFull": _fullName };
            }
        }
        //use the callback to handle the return
        return callback(productObj);
      };
    });*/
  },
  getAllIndicatorData: function(practiceId, callback) {
    //var addId = '/'+practiceId;
    var routeURL;
    if(practiceId)
    {
      routeURL = "/api/ListOfIndicatorsForPractice/" + practiceId;

    }
    else {
      routeURL = "/api/ListOfIndicatorsForPractice";
    }

    //we never want to cache this anymore.
    if (dt.indicators) {
      return callback(dt.indicators);
    } else {

        $.ajax({
          url: routeURL,
          success: function(file) {
            //if (!dt.indicators) dt.indicators = dt.processIndicators(file);

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
    var indicator = dt.indicators.filter(function(v){
      return v.id === indicatorId;
    });
    if (indicator.length>0) {
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
    var opps = dt.indicators.filter(function(v){
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
      return patient;
      /*var ret = dt.indicators[indicatorId].patients[patientId];
      ret.nhsNumber = dt.patLookup[patientId] || patientId;
      ret.patientId = patientId;
      ret.items = [dt.patients[patientId].characteristics.age]; //The fields in the patient list table

      var measures = dt.patients[patientId].measurements.filter(function(v) {
        return v.id === vId;
      });

      if (measures[0] && measures[0].data) {
        if (dOv === "date") {
          ret.items.push(new Date(measures[0].data[measures[0].data.length - 1][0]));
        } else {
          ret.items.push(measures[0].data[measures[0].data.length - 1][1]);
        }
      } else {
        ret.items.push("?");
      }
      ret.items.push(dt.indicators[indicatorId].patients[patientId].opportunities.map(function(v) {
        return '<span style="width:13px;height:13px;float:left;background-color:' + Highcharts.getOptions().colors[v] + '"></span>';
      }).join(""));
      //ret.items.push(data.numberOfStandardsMissed(patientId));
      return ret;*/
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
      "titleHTML": 'Improvement opportunities',
      "isSorted": true,
      "tooltip": "Improvement opportunities from the bar chart above"
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

  getPatientData: function(patientId, callback) {
    return _getPatientData(patientId, callback);
  }

};

module.exports = dt;
