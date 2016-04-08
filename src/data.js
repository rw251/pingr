var log = require('./log.js'),
  lookup = require('./lookup.js');

var _getAllIndicatorData = function(callback){
  var r = Math.random();
  $.getJSON("data/indicators.json?v=" + r, function(file) {
    main.indicators = file;

    main.indicators.forEach(function(indicator){
      var percentage = Math.round(100*indicator.values[1][1]*100/indicator.values[2][1])/100;
      indicator.performance = indicator.values[1][1] + " / " + indicator.values[2][1] + " (" + percentage + "%)";
      indicator.target = indicator.values[3][1]*100 + "%";
      indicator.up = percentage > Math.round(100*indicator.values[1][2]*100/indicator.values[2][2])/100;
      var trend = indicator.values[1].map(function(val, idx) {
        return Math.round(100*val*100/indicator.values[2][idx])/100;
      }).slice(1,10);
      trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].slice(1,10);
      dates.reverse();
      indicator.dates = dates;
    });


    callback(main.indicators);
  });
};

var _getIndicatorData = function(indicator, callback) {
  var r = Math.random();
  $.getJSON("data/idata." + indicator + ".json?v=" + r, function(file) {
    main.indicators[indicator] = file;

    callback(main.indicators[indicator]);
  });
};

var _getFakePatientData = function(callback){
  var r = Math.random();
  $.getJSON("data/patient.json?v=" + r, function(file) {
    if(!main.patients) main.patients = {};
    main.patients.patient = file;

    callback(main.patients.patient);
  });
};

var _getPatientData = function(patient, callback) {
  var r = Math.random();
  $.getJSON("data/" + patient + ".json?v=" + r, function(file) {
    if(!main.patients) main.patients = {};
    main.patients[patient] = file;

    callback(main.patients[patient]);
  }).fail(function(){
    if(main.patients.patient) return callback(main.patients.patient);
    else _getFakePatientData(callback);
  });
};

var main = {

  pathwayNames: {},
  diseases: [],
  options: [],

  getPatietListForStandard: function(pathwayId, pathwayStage, standard) {
    var patients = main.removeDuplicates(main[pathwayId][pathwayStage].standards[standard].opportunities.reduce(function(a, b) {
      return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
    }));
    return patients;
  },

  getPatientStatus: function(patientId, pathwayId, pathwayStage, standard) {
    if (main.patients[patientId].breach) {
      if (main.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard;
        }).length > 0) {
        return "missed";
      } else if (main.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId && val.pathwayStage === "diagnosis";
        }).length > 0 && pathwayStage !== "diagnosis") {
        return "not";
      } else if (main.patients[patientId].breach.filter(function(val) {
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
    var patients = main.getPatietListForStandard(pathwayId, pathwayStage, standard);
    return patients.length;
  },

  getDenominatorForStandard: function(pathwayId, pathwayStage) {
    var patients = main[pathwayId][pathwayStage].patientsOk;
    for (var standard in main[pathwayId][pathwayStage].standards) {
      var newPatients = main.getPatietListForStandard(pathwayId, pathwayStage, standard);
      patients = patients.concat(newPatients);
    }
    return main.removeDuplicates(patients).length;
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
    if (!main.patients[patientId].breach) return 0;
    var a = main.patients[patientId].breach.map(function(val) {
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
    for (k = 0; k < main.diseases.length; k++) {
      for (i in lookup.categories) {
        for (prop in main[main.diseases[k].id][i].bdown) {
          if (main[main.diseases[k].id][i].bdown.hasOwnProperty(prop)) {
            pList = pList.concat(main[main.diseases[k].id][i].bdown[prop].patients);
          }
        }
        pList = pList.concat(main[main.diseases[k].id][i].patientsOk);
      }
    }
    pList = main.removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
      var ret = main.patients[patientId];
      ret.nhsNumber = main.patLookup ? main.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(main.numberOfStandardsMissed(patientId));
      return ret;
    });

    return patients;
  },

  get: function(callback, json) {
    if (json) {
      main.load(json);
      if (typeof callback === 'function') callback();
    } else {
      var r = Math.random();
      $.getJSON("data.json?v=" + r, function(file) {
        main.load(file);
        if (typeof callback === 'function') callback();
      }).fail(function(err) {
        alert("data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
      });
    }
  },

  load: function(file) {
    var d = "",
      j, k, key, data = file.diseases;

    main = jQuery.extend(main, data); //copy

    main.patients = file.patients;
    main.codes = file.codes;
    main.patientArray = [];
    for (var o in file.patients) {
      if (file.patients.hasOwnProperty(o)) {
        main.patientArray.push(o);
      }
    }

    for (d in data) {
      main.pathwayNames[d] = data[d]["display-name"];
      var diseaseObject = {
        "id": d,
        "link": data[d].link ? data[d].link : "main/" + d,
        "faIcon": data[d].icon,
        "name": data[d]["display-name"],
        "text": {
          "main": {
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
      main[d].suggestions = log.plan[d].team;
      $.extend(main[d].monitoring, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(main[d].treatment, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(main[d].diagnosis, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(main[d].exclusions, {
        "breakdown": [],
        "bdown": {}
      });

      if (!main[d].monitoring.header) continue;
      for (key in main[d].monitoring.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "monitoring",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Monitoring" + ' - ' + main[d].monitoring.standards[key].tab.title
        });
        for (j = 0; j < main[d].monitoring.standards[key].opportunities.length; j++) {
          main[d].monitoring.bdown[main[d].monitoring.standards[key].opportunities[j].name] = main[d].monitoring.standards[key].opportunities[j];
          main[d].monitoring.bdown[main[d].monitoring.standards[key].opportunities[j].name].suggestions = log.plan[d].monitoring.individual[main[d].monitoring.standards[key].opportunities[j].name];
          for (k = 0; k < main[d].monitoring.standards[key].opportunities[j].patients.length; k++) {
            if (!main.patients[main[d].monitoring.standards[key].opportunities[j].patients[k]].breach) main.patients[main[d].monitoring.standards[key].opportunities[j].patients[k]].breach = [];
            main.patients[main[d].monitoring.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "monitoring",
              "standard": key,
              "subsection": main[d].monitoring.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in main[d].diagnosis.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "diagnosis",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Diagnosis" + ' - ' + main[d].diagnosis.standards[key].tab.title
        });
        for (j = 0; j < main[d].diagnosis.standards[key].opportunities.length; j++) {
          main[d].diagnosis.bdown[main[d].diagnosis.standards[key].opportunities[j].name] = main[d].diagnosis.standards[key].opportunities[j];
          main[d].diagnosis.bdown[main[d].diagnosis.standards[key].opportunities[j].name].suggestions = log.plan[d].diagnosis.individual[main[d].diagnosis.standards[key].opportunities[j].name];
          for (k = 0; k < main[d].diagnosis.standards[key].opportunities[j].patients.length; k++) {
            if (!main.patients[main[d].diagnosis.standards[key].opportunities[j].patients[k]].breach) main.patients[main[d].diagnosis.standards[key].opportunities[j].patients[k]].breach = [];
            main.patients[main[d].diagnosis.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "diagnosis",
              "standard": key,
              "subsection": main[d].diagnosis.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in main[d].treatment.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "treatment",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Treatment" + ' - ' + main[d].treatment.standards[key].tab.title
        });
        for (j = 0; j < main[d].treatment.standards[key].opportunities.length; j++) {
          main[d].treatment.bdown[main[d].treatment.standards[key].opportunities[j].name] = main[d].treatment.standards[key].opportunities[j];
          main[d].treatment.bdown[main[d].treatment.standards[key].opportunities[j].name].suggestions = log.plan[d].treatment.individual[main[d].treatment.standards[key].opportunities[j].name];
          for (k = 0; k < main[d].treatment.standards[key].opportunities[j].patients.length; k++) {
            if (!main.patients[main[d].treatment.standards[key].opportunities[j].patients[k]].breach) main.patients[main[d].treatment.standards[key].opportunities[j].patients[k]].breach = [];
            main.patients[main[d].treatment.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "treatment",
              "standard": key,
              "subsection": main[d].treatment.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in main[d].exclusions.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "exclusions",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Exclusions" + ' - ' + main[d].exclusions.standards[key].tab.title
        });
        for (j = 0; j < main[d].exclusions.standards[key].opportunities.length; j++) {
          main[d].exclusions.bdown[main[d].exclusions.standards[key].opportunities[j].name] = main[d].exclusions.standards[key].opportunities[j];
          main[d].exclusions.bdown[main[d].exclusions.standards[key].opportunities[j].name].suggestions = log.plan[d].exclusions.individual[main[d].exclusions.standards[key].opportunities[j].name];
          for (k = 0; k < main[d].exclusions.standards[key].opportunities[j].patients.length; k++) {
            if (!main.patients[main[d].exclusions.standards[key].opportunities[j].patients[k]].breach) main.patients[main[d].exclusions.standards[key].opportunities[j].patients[k]].breach = [];
            main.patients[main[d].exclusions.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "exclusions",
              "standard": key,
              "subsection": main[d].exclusions.standards[key].opportunities[j].name
            });
          }
        }
      }
    }
  },

  getAllIndicatorData: function(callback){
    if(main.indicators) {
      return callback(main.indicators);
    } else {
      _getAllIndicatorData(callback);
    }
  },

  getIndicatorData: function(indicator, callback) {
    if(!main.indicators) {
      _getAllIndicatorData(function(data){
        _getIndicatorData(indicator, callback);
      });
    } else if(main.indicators && main.indicators[indicator]) {
      return callback(main.indicators[indicator]);
    } else {
      _getIndicatorData(indicator, callback);
    }
  },

  getPatientData: function(patientId, callback) {
    /*if(main.patients && main.patients[patientId]) {
      return callback(main.patients[patientId]);
    } else {*/
      _getPatientData(patientId, callback);
  /*  }*/
  }

};

module.exports = main;
