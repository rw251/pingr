var log = require('./log.js'),
  lookup = require('./lookup.js');


var _getAllIndicatorData = function(callback) {
  var r = Math.random();
  $.getJSON("data/indicators.json?v=" + r, function(file) {
    dt.indicators = file;

    dt.indicators.forEach(function(indicator) {
      var percentage = Math.round(100 * indicator.values[1][1] * 100 / indicator.values[2][1]) / 100;
      indicator.performance = indicator.values[1][1] + " / " + indicator.values[2][1] + " (" + percentage + "%)";
      indicator.target = indicator.values[3][1] * 100 + "%";
      indicator.up = percentage > Math.round(100 * indicator.values[1][2] * 100 / indicator.values[2][2]) / 100;
      var trend = indicator.values[1].map(function(val, idx) {
        return Math.round(100 * val * 100 / indicator.values[2][idx]) / 100;
      }).slice(1, 10);
      trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].slice(1, 10);
      dates.reverse();
      indicator.dates = dates;
    });


    callback(dt.indicators);
  });
};

var _getAllIndicatorDataSync = function(callback) {
  var r = Math.random();
  $.ajax({
    url: "data/indicators.json?v=" + r,
    async: false,
    success: function(file) {
      dt.indicators = file;

      dt.indicators.forEach(function(indicator) {
        var percentage = Math.round(100 * indicator.values[1][1] * 100 / indicator.values[2][1]) / 100;
        indicator.performance = indicator.values[1][1] + " / " + indicator.values[2][1] + " (" + percentage + "%)";
        indicator.target = indicator.values[3][1] * 100 + "%";
        indicator.up = percentage > Math.round(100 * indicator.values[1][2] * 100 / indicator.values[2][2]) / 100;
        var trend = indicator.values[1].map(function(val, idx) {
          return Math.round(100 * val * 100 / indicator.values[2][idx]) / 100;
        }).slice(1, 10);
        trend.reverse();
        indicator.trend = trend.join(",");
        var dates = indicator.values[0].slice(1, 10);
        dates.reverse();
        indicator.dates = dates;
      });

    }
  });

  return dt.indicators;
};

var _getIndicatorData = function(indicator, callback) {
  var r = Math.random();
  $.getJSON("data/idata." + indicator + ".json?v=" + r, function(file) {
    dt.indicators[indicator] = file;

    //apply which categories people belong to
    Object.keys(dt.indicators[indicator].patients).forEach(function(patient) {
      dt.indicators[indicator].patients[patient].opportunities = [];
      dt.indicators[indicator].opportunities.forEach(function(opp, idx) {
        if (opp.patients.indexOf(+patient) > -1) {
          dt.indicators[indicator].patients[patient].opportunities.push(idx);
        }
      });
    });

    callback(dt.indicators[indicator]);
  });
};

var _getIndicatorDataSync = function(indicator) {
  var r = Math.random();
  $.ajax({
    url: "data/idata." + indicator + ".json?v=" + r,
    async: false,
    success: function(file) {
      dt.indicators[indicator] = file;

      //apply which categories people belong to
      Object.keys(dt.indicators[indicator].patients).forEach(function(patient) {
        dt.indicators[indicator].patients[patient].opportunities = [];
        dt.indicators[indicator].opportunities.forEach(function(opp, idx) {
          if (opp.patients.indexOf(+patient) > -1) {
            dt.indicators[indicator].patients[patient].opportunities.push(idx);
          }
        });
      });

    }
  });
  return dt.indicators[indicator];
};

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
  var r = Math.random(),
    isAsync = typeof(callback) === "function";

  if (dt.patients && dt.patients[patient]) {
    if (isAsync) return callback(dt.patients[patient]);
    else return dt.patients[patient];
  }

  $.ajax({
    url: "data/" + patient + ".json?v=" + r,
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

  if (!isAsync) return dt.patients.patient;
};

var dt = {

  pathwayNames: {},
  diseases: [],
  options: [],
  patLookup:{},

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
    $.getJSON("data/text.json?v=" + Math.random(), function(textfile) {
      dt.text = textfile.pathways;

      if (json) {
        dt.newload(json);
        if (typeof callback === 'function') callback();
      } else {
        $.getJSON("data/data.json?v=" + Math.random(), function(file) {
          dt.newload(file);
          if (typeof callback === 'function') callback();
        }).fail(function(err) {
          alert("data/data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
        });
      }

    }).fail(function(err) {
      alert("data/text.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
    });
  },

  newload: function(file) {
    dt.indicators = file.indicators;
    dt.pathwayNames = {};

    dt.indicators.forEach(function(indicator) {
      var pathwayId = indicator.id.split(".")[0];
      var pathwayStage = indicator.id.split(".")[1];
      var standard = indicator.id.split(".")[2];
      if(!dt.pathwayNames[pathwayId]) dt.pathwayNames[pathwayId]="";
      var percentage = Math.round(100 * indicator.values[1][1] * 100 / indicator.values[2][1]) / 100;
      indicator.performance = {
        fraction: indicator.values[1][1] + "/" + indicator.values[2][1],
        percentage: percentage
      };
      indicator.benchmark = "90%";//TODO magic number
      indicator.target = indicator.values[3][1] * 100 + "%";
      indicator.up = percentage > Math.round(100 * indicator.values[1][2] * 100 / indicator.values[2][2]) / 100;
      var trend = indicator.values[1].map(function(val, idx) {
        return Math.round(100 * val * 100 / indicator.values[2][idx]) / 100;
      }).slice(1, 10);
      trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].slice(1, 10);
      dates.reverse();
      indicator.dates = dates;
      indicator.description=dt.text[pathwayId][pathwayStage].standards[standard].description;

      dt.indicators[indicator.id] = { performance: indicator.performance, target: indicator.target, "opportunities": indicator.opportunities || [], "patients": {} };

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

  getAllIndicatorData: function(callback) {
    if (dt.indicators) {
      return callback(dt.indicators);
    } else {
      _getAllIndicatorData(callback);
    }
  },

  getAllIndicatorDataSync: function() {
    if (dt.indicators) {
      return dt.indicators;
    } else {
      return _getAllIndicatorDataSync();
    }
  },

  getIndicatorData: function(indicator, callback) {
    if (!dt.indicators) {
      _getAllIndicatorData(function(data) {
        _getIndicatorData(indicator, callback);
      });
    } else if (dt.indicators && dt.indicators[indicator]) {
      return callback(dt.indicators[indicator]);
    } else {
      _getIndicatorData(indicator, callback);
    }
  },

  getIndicatorDataSync: function(indicator) {
    dt.getAllIndicatorDataSync();
    if (dt.indicators[indicator]) {
      return dt.indicators[indicator];
    } else {
      return _getIndicatorDataSync(indicator);
    }
  },

  getPatientData: function(patientId, callback) {
    return _getPatientData(patientId, callback);
  }

};

module.exports = dt;
