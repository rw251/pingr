var csv = require('csv-parser'),
  fs = require('fs'),
  path = require('path'),
  async = require('async');

//var heapdump = require('heapdump');

var FILENAMES = {
  demographics: 'demographics.dat',
  denominators: 'denominators.dat',
  diagnoses: 'diagnoses.dat',
  medications: 'medications.dat',
  events: 'impCodes.dat',
  processIndicators: 'indicator.dat',
  outcomeIndicators: 'indicatorOutcome.dat',
  indicatorMapping: 'indicatorMapping.dat',
  measurements: 'measures.dat',
  contacts: 'contacts.dat',
  patientActions: 'patActions.dat',
  orgActions: 'orgActions.dat',
  text: 'text.dat'
};

var dp = function (number, decimalPlaces) {
  return Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
};

var IN_DIR = process.argv[2] || 'E:\\ImporterPINGR\\';
var OUT_DIR = process.argv[3] || 'data/';

//Load current data
//make sure opportunities is empty
var dataFile = { indicators: JSON.parse(fs.readFileSync(IN_DIR + 'existingIndicators.json', 'utf8') || "[]"), patients: {} };
var textFile = {
  pathways: {},
  measurements: {
    "eGFR": {
      "name": "eGFR",
      "unit": "ml/min/1.73m^2",
      "type": "line",
      "valueDecimals": 1
    },
    "ACR": {
      "name": "ACR",
      "unit": "μg/mg",
      "type": "line",
      "valueDecimals": 0
    },
    "BP": {
      "name": "BP",
      "unit": "mmHg",
      "type": "errorbar"
    },
    "strokeHosp": {
      "name": "Stroke",
      "unit": "Stroke",
      "type": "line"
    },
    "pulseRhythm": {
      "name": "Pulse rhythm",
      "unit": "Pulse rhythm",
      "type": "line"
    },
    "FEV1": {
      "name": "FEV1",
      "unit": "L",
      "type": "line",
      "valueDecimals": 1
    },
    "SBP": {},
    "DBP": {}
  }
};

var messages = [];

var readCsvAsyncToObject = function (input, callback) {
  var obj = [];
  fs.createReadStream(input.file)
    .pipe(csv({ separator: '\t', headers: input.headers }))
    .on('data', function (data) {
      var o = {};
      for (var i = 0; i < input.headers.length; i++) {
        o[input.headers[i]] = data[input.headers[i]];
      }
      obj.push(o);
    })
    .on('err', function (err) { callback(err); })
    .on('end', function () { callback(null, obj); });
};

//for files of the form PatID, Date, Thing
var readCsvAsync = function (input, callback) {
  var obj = [];
  fs.createReadStream(input.file)
    .pipe(csv({ separator: '\t', headers: ['patientId', 'date', 'thing'] }))
    .on('data', function (data) {
      if (!patients[+data.patientId]) console.log(input.thing + " without patient:" + JSON.stringify(data));
      else {
        if (!patients[+data.patientId][input.thing]) patients[+data.patientId][input.thing] = [];
        patients[+data.patientId][input.thing].push({
          name: data.thing,
          time: new Date(data.date).getTime(),
          task: input.task
        });
      }
    })
    .on('err', function (err) { callback(err); })
    .on('end', function () { callback(null); });
};

dataFile.indicators = dataFile.indicators.filter(function (v) {
  return v.practiceId && v.practiceId !== "ALL";
});

var patients = dataFile.patients;

var assign = function (obj, prop, value) {
  if (typeof prop === "string")
    prop = prop.split(".");

  if (prop.length > 1) {
    var e = prop.shift();
    assign(obj[e] =
      Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {},
      prop,
      value);
  } else
    obj[prop[0]] = value;
};

//Load new text


//read existing indicators as dumped from mongo
fs.readFileSync(IN_DIR + FILENAMES.text, 'utf8').split("\n").forEach(function (line) {
  var els = line.trim("\r").split("\t");
  if (els.length < 5) {
    if (els[0].replace(/[^a-zA-Z0-9]/g, "").length > 0) messages.push("The text.dat file contains a row with no TAB character: " + els[0]);
    return;
  }
  var pathway = els[0],
    stage = els[1],
    standard = els[2],
    key = els[3],
    val = els[4];
  if (!textFile.pathways[pathway]) textFile.pathways[pathway] = {};
  if (!textFile.pathways[pathway][stage]) textFile.pathways[pathway][stage] = { standards: {} };
  if (!textFile.pathways[pathway][stage].standards[standard]) textFile.pathways[pathway][stage].standards[standard] = {};
  assign(textFile.pathways[pathway][stage].standards[standard], key, val);
});

var tempDates = [];

var isInTextFile = function (pathway, stage, standard) {
  if (!textFile.pathways[pathway] || !textFile.pathways[pathway][stage] || !textFile.pathways[pathway][stage].standards[standard]) {
    return false;
  }
  return true;
};

var checkTextFile = function (pathway, stage, standard, file) {
  if (!isInTextFile(pathway, stage, standard)) {
    console.log("#######################");
    console.log("##    ERROR         ###");
    console.error([pathway, stage, standard].join(".") + " occurs in the " + file + " file - but you don't have anything in the text file ");
    console.log("#######################");
    process.exit(1);
  }
};

dataFile.indicators = dataFile.indicators.filter(function (v) {
  var pathway = v.id.split('.')[0];
  var stage = v.id.split('.')[1];
  var standard = v.id.split('.')[2];
  return isInTextFile(pathway, stage, standard);
});

var indicators = dataFile.indicators;

var indicatorType = {};

var doProcessIndicators = function (callback) {
  console.log("Doing process indicators...");
  fs.createReadStream(IN_DIR + FILENAMES.processIndicators)
    .pipe(
    csv({
      separator: '\t',
      headers: ['indicatorid', 'gpcode', 'date', 'numerator', 'denominator', 'target', 'benchmark']
    })
    )
    .on('data', function (data) {
      if (data.date) {

        if (!indicatorType[data.indicatorid]) {
          indicatorType[data.indicatorid] = "process";
        }

        var i = indicators.filter(function (v) {
          return v.id === data.indicatorid && v.practiceId === data.gpcode;
        })[0];

        var pathway = data.indicatorid.split('.')[0];
        var stage = data.indicatorid.split('.')[1];
        var standard = data.indicatorid.split('.')[2];

        checkTextFile(pathway, stage, standard, FILENAMES.processIndicators);
        var indText = textFile.pathways[pathway][stage].standards[standard];
        var oppText = indText.opportunities;

        if (!i) {
          i = {
            id: data.indicatorid,
            practiceId: data.gpcode,
            measurementId: indText.valueId,
            benchmark: data.benchmark,
            displayValue: indText.dateORvalue !== "date",
            displayDate: indText.dateORvalue !== "value",
            displayReviewDate: indText.showNextReviewDateColumn !== "false",
            displayValueFrom: indText.valueFrom,
            type: "process",
            sortDirection: indText.valueSortDirection ? indText.valueSortDirection[0] === "a" : "desc",
            name: indText.name,
            description: indText.description,
            values: [["x"], ["numerator"], ["denominator"], ["target"]],
            opportunities: []
          };
          indicators.push(i);
        } else {
          i.benchmark = data.benchmark;
          i.measurementId = indText.valueId;
          i.displayValue = indText.dateORvalue !== "date";
          i.displayDate = indText.dateORvalue !== "value";
          i.displayReviewDate = indText.showNextReviewDateColumn !== "false";
          i.displayValueFrom = indText.valueFrom;
          i.type = "process";
          i.name = indText.name;
          i.description = indText.description;
        }

        var dtt = data.date.replace(/[^0-9-]/g, "");
        //replace if already there
        var dttIdx = i.values[0].indexOf(dtt);
        if (dttIdx === -1) {
          i.values[0].push(dtt);
          i.values[1].push(data.numerator);
          i.values[2].push(data.denominator);
          i.values[3].push(data.target);
        } else {
          i.values[1][dttIdx] = data.numerator;
          i.values[2][dttIdx] = data.denominator;
          i.values[3][dttIdx] = data.target;
        }

        //Sort them all..
        var temp = i.values[0].slice(1).map(function (v, idx) {
          return { a: v, b: i.values[1][idx + 1], c: i.values[2][idx + 1], d: i.values[3][idx + 1] };
        });
        //sort
        temp.sort(function (a, b) {
          return a.a === b.a ? 0 : (a.a < b.a ? -1 : 1);
        });

        //reassign
        temp.forEach(function (v, idx) {
          i.values[0][idx + 1] = v.a;
          i.values[1][idx + 1] = v.b;
          i.values[2][idx + 1] = v.c;
          i.values[3][idx + 1] = v.d;
        });
      }
    })
    .on('end', function () {
      console.log("Process indicators done.");
      callback(null);
    })
    .on('err', function (err) {
      console.log("Error while doing process indicators.");
      callback(err);
    });
};

var doOutcomeIndicators = function (callback) {
  console.log("Doing outcome indicators...");
  fs.createReadStream(IN_DIR + FILENAMES.outcomeIndicators)
    .pipe(
    csv({
      separator: '\t',
      headers: ['indicatorid', 'gpcode', 'date', 'patientCount', 'eventCount', 'denominator', 'standardisedIncidence', 'benchmark']
    })
    )
    .on('data', function (data) {
      if (data.date) {

        if (!indicatorType[data.indicatorid]) {
          indicatorType[data.indicatorid] = "outcome";
        }

        var i = indicators.filter(function (v) {
          return v.id === data.indicatorid && v.practiceId === data.gpcode;
        })[0];

        var pathway = data.indicatorid.split('.')[0];
        var stage = data.indicatorid.split('.')[1];
        var standard = data.indicatorid.split('.')[2];

        checkTextFile(pathway, stage, standard, FILENAMES.outcomeIndicators);
        var indText = textFile.pathways[pathway][stage].standards[standard];
        var oppText = indText.opportunities;

        if (!i) {
          i = {
            id: data.indicatorid,
            practiceId: data.gpcode,
            measurementId: indText.valueId,
            benchmark: data.benchmark,
            displayValue: indText.dateORvalue !== "date",
            displayDate: indText.dateORvalue !== "value",
            displayReviewDate: indText.showNextReviewDateColumn !== "false",
            displayValueFrom: indText.valueFrom,
            type: "outcome",
            sortDirection: indText.valueSortDirection ? indText.valueSortDirection[0] === "a" : "desc",
            name: indText.name,
            description: indText.description,
            values: [["x"], ["patientCount"], ["denominator"], ["eventCount"], ["standardisedIncidence"]],
            opportunities: []
          };
          indicators.push(i);
        } else {
          if (i.values[1][0] === "numerator") {
            i.values = [["x"], ["patientCount"], ["denominator"], ["eventCount"], ["standardisedIncidence"]];
          }
          i.benchmark = data.benchmark;
          i.measurementId = indText.valueId;
          i.displayValue = indText.dateORvalue !== "date";
          i.displayDate = indText.dateORvalue !== "value";
          i.displayReviewDate = indText.showNextReviewDateColumn !== "false";
          i.displayValueFrom = indText.valueFrom;
          i.type = "outcome";
          i.name = indText.name;
          i.description = indText.description;
        }

        var dtt = data.date.replace(/[^0-9-]/g, "");
        //replace if already there
        var dttIdx = i.values[0].indexOf(dtt);
        if (dttIdx === -1) {
          i.values[0].push(dtt);
          i.values[1].push(data.patientCount);
          i.values[2].push(data.denominator);
          i.values[3].push(data.standardisedIncidence);
          i.values[4].push(data.eventCount);
        } else {
          i.values[1][dttIdx] = data.patientCount;
          i.values[2][dttIdx] = data.denominator;
          i.values[3][dttIdx] = data.standardisedIncidence;
          i.values[4][dttIdx] = data.eventCount;
        }

        //Sort them all..
        var temp = i.values[0].slice(1).map(function (v, idx) {
          return { a: v, b: i.values[1][idx + 1], c: i.values[2][idx + 1], d: i.values[3][idx + 1], e: i.values[4][idx + 1] };
        });
        //sort
        temp.sort(function (a, b) {
          return a.a === b.a ? 0 : (a.a < b.a ? -1 : 1);
        });

        //reassign
        temp.forEach(function (v, idx) {
          i.values[0][idx + 1] = v.a;
          i.values[1][idx + 1] = v.b;
          i.values[2][idx + 1] = v.c;
          i.values[3][idx + 1] = v.d;
          i.values[4][idx + 1] = v.e;
        });
      }
    })
    .on('end', function () {
      console.log("Outcome indicators done.");
      callback(null);
    })
    .on('err', function (err) {
      console.log("Error while doing outcome indicators.");
      callback(err);
    });
};

var doIndicatorMapping = function (callback) {
  console.log("Doing indicator mapping...");

  indicators.forEach(function (v) {
    if (v.mappedIndicators) v.mappedIndicators = [];
  });

  fs.createReadStream(IN_DIR + FILENAMES.indicatorMapping)
    .pipe(
    csv({
      separator: '\t',
      headers: ['outcomeIndicatorId', 'processIndicatorId']
    })
    )
    .on('data', function (data) {

      indicators.filter(function (v) {
        return v.id === data.outcomeIndicatorId;
      }).forEach(function (v) {
        if (!v.mappedIndicators) v.mappedIndicators = [];
        v.mappedIndicators.push(data.processIndicatorId);
      });
    })
    .on('err', function (err) {
      console.log("Error while doing indicator mapping.");
      callback(err);
    })
    .on('end', function () {
      console.log("Indicator mapping done.");
      callback(null);
    });
};

var doDemographics = function (callback) {
  console.log("Doing demographics...");
  readCsvAsyncToObject({
    file: IN_DIR + FILENAMES.demographics,
    headers: ['patientId', 'nhsnumber', 'age', 'sex', 'gpcode']
  }, function (err, result) {
    if (err) {
      console.log("Error doing demographics.");
      return callback(err);
    }
    //age, sex
    result.forEach(function (v) {
      temp[+v.patientId] = {};
      if (!patients[+v.patientId]) {
        patients[+v.patientId] = {
          patientId: +v.patientId,
          characteristics: { nhs: v.nhsnumber, age: v.age, sex: v.sex, practiceId: v.gpcode }
        };
      }
    });
    result = null;
    console.log("Demographics done.");
    callback(null);
  });
};

var doDenominators = function (callback) {
  console.log("Doing denominators...");
  readCsvAsyncToObject({
    file: IN_DIR + FILENAMES.denominators,
    headers: ['patientId', 'indicatorId', 'why', 'nextReviewDate']
  }, function (err, result) {
    if (err) {
      console.log("Error doing denominators.");
      return callback(err);
    }
    //denominator
    result.forEach(function (v) {
      if (!temp[+v.patientId]) {
        console.log("Denominator for unknown patient: " + v.patientId);
        return;
      }
      var pathway = v.indicatorId.split('.')[0];
      var stage = v.indicatorId.split('.')[1];
      var standard = v.indicatorId.split('.')[2];

      checkTextFile(pathway, stage, standard, FILENAMES.denominators);
      var indText = textFile.pathways[pathway][stage].standards[standard];
      var item = { indicatorId: v.indicatorId, display: indText.tabText, targetMet: true, type: indicatorType[v.indicatorId] };
      if (v.why && v.why !== "") item.why = v.why;
      if (v.nextReviewDate && v.nextReviewDate !== "") item.nextReviewDate = new Date(v.nextReviewDate);
      if (!patients[+v.patientId].standards) patients[+v.patientId].standards = [];
      patients[+v.patientId].standards.push(item);
    });
    result = null;
    console.log("Denominators done.");
    callback(null);
  });
};

var doEvents = function (callback) {
  console.log("Doing events...");
  readCsvAsync({
    file: IN_DIR + FILENAMES.events,
    thing: 'events',
    task: 1
  }, function (err, result) {
    if (err) {
      console.log("Error when doing events.");
      return callback(err);
    }
    result = null;
    console.log("Events done.");
    callback(null);
  });
};

var doContacts = function (callback) {
  console.log("Doing contacts...");
  readCsvAsync({
    file: IN_DIR + FILENAMES.contacts,
    thing: 'contacts',
    task: 2
  }, function (err, result) {
    if (err) {
      console.log("Error when doing contacts.");
      return callback(err);
    }
    result = null;
    console.log("Contacts done.");
    callback(null);
  });
};

var doDiagnoses = function (callback) {
  console.log("Doing diagnoses.");
  var lastPatId = -1;
  temp = {};
  var processDiagnoses = function (patientId) {
    if (temp.diag) {
      patients[patientId].conditions = [];
      Object.keys(temp.diag).forEach(function (d) {
        temp.diag[d].sort(function (a, b) {
          return a.date - b.date;
        });
        var intervals = [];
        var last = temp.diag[d].reduce(function (prev, cur) {
          var end = new Date(cur.date);
          end.setDate(end.getDate() - 1);
          intervals.push({
            from: prev.date,
            to: end.getTime(),
            label: prev.cat || ""
          });
          return cur;
        });
        intervals.push({
          from: last.date,
          to: new Date().getTime(),
          label: last.cat
        });
        patients[patientId].conditions.push({
          name: d,
          intervals: intervals
        });
      });
    }
  };

  fs.createReadStream(IN_DIR + FILENAMES.diagnoses)
    .pipe(
    csv({
      separator: '\t',
      headers: ['patientId', 'date', 'diag', 'cat']
    })
    )
    .on('data', function (data) {
      if (+data.patientId !== lastPatId) {
        processDiagnoses(lastPatId);
        temp = {};
        lastPatId = +data.patientId;
      }
      if (!patients[lastPatId]) {
        console.log("Diagnosis for unknown patient: " + lastPatId);
        return;
      }
      if (!temp.diag) temp.diag = {};
      if (!temp.diag[data.diag]) temp.diag[data.diag] = [];
      temp.diag[data.diag].push({ date: new Date(data.date).getTime(), cat: data.cat });
    })
    .on('err', function (err) {
      console.log("Error when doing diagnoses.");
      return callback(err);
    })
    .on('end', function () {
      processDiagnoses(lastPatId);
      console.log('Diagnoses done.');
      callback(null);
    });
};

var doMedications = function (callback) {
  console.log("Doing medications...");
  temp = {};
  lastPatId = -1;


  var processMedications = function (patientId) {
    if (temp.meds) {
      patients[patientId].medications = [];
      Object.keys(temp.meds).forEach(function (d) {
        temp.meds[d].sort(function (a, b) {
          return a.date - b.date;
        });
        var intervals = [];
        var last = temp.meds[d].reduce(function (prev, cur) {
          var end = new Date(cur.date);
          end.setDate(end.getDate() - 1);
          if (prev) {
            intervals.push({
              from: prev.date,
              to: end.getTime(),
              label: dp(prev.mg, 3) + "mg" || ""
            });
          }
          return d.event === "STOPPED" ? null : cur;
        });
        if (last) {
          intervals.push({
            from: last.date,
            to: new Date().getTime(),
            label: dp(last.mg, 3) + "mg" || ""
          });
        }
        patients[patientId].medications.push({
          name: d,
          intervals: intervals
        });
      });
    }
  };
  fs.createReadStream(IN_DIR + FILENAMES.medications)
    .pipe(
    csv({
      separator: '\t',
      headers: ['patientId', 'date', 'type', 'family', 'mg', 'event']
    })
    )
    .on('data', function (data) {
      if (+data.patientId !== lastPatId) {
        processMedications(lastPatId);
        temp = {};
        lastPatId = +data.patientId;
      }
      if (!patients[lastPatId]) {
        console.log("Medication for unknown patient: " + lastPatId);
        return;
      }
      if (!temp.meds) temp.meds = {};
      if (!temp.meds[data.type]) temp.meds[data.type] = [];
      temp.meds[data.type].push({ date: new Date(data.date).getTime(), type: data.type, family: data.family, mg: data.mg, event: data.event });

    })
    .on('err', function (err) {
      console.log("Error when doing medications.");
      return callback(err);
    })
    .on('end', function () {
      processMedications(lastPatId);
      console.log('Medications done.');
      callback(null);
    });
};

var doMeasurements = function (callback) {
  console.log("Doing measurements...");
  temp = {};
  lastPatId = -1;

  var processMeasurements = function (patientId) {
    if (temp.meas) {
      patients[patientId].measurements = [];
      Object.keys(temp.meas).forEach(function (d) {
        temp.meas[d].sort(function (a, b) {
          return a.date - b.date;
        });
        var mData = [];
        if (d === "BP") {
          var lastdate;
          var sbp, dbp;
          for (var i = 0; i < temp.meas[d].length; i++) {
            if (lastdate === temp.meas[d][i].date) {
              if (temp.meas[d][i].thing === "SBP") {
                sbp = +temp.meas[d][i].value;
              } else {
                dbp = +temp.meas[d][i].value;
              }
              if (sbp && dbp) {
                mData.push([lastdate, temp.meas[d][i].source, sbp, dbp]);
                sbp = null;
                dbp = null;
                lastdate = null;
              }
            } else {
              sbp = null;
              dbp = null;
              lastdate = temp.meas[d][i].date;
              if (temp.meas[d][i].thing === "SBP") {
                sbp = temp.meas[d][i].value;
              } else {
                dbp = temp.meas[d][i].value;
              }
            }
          }

          patients[patientId].measurements.push({
            "id": d,
            "name": "BP",
            "data": mData,
            "unit": "mmHg",
            "type": "errorbar",
            "valueDecimals": 0
          });
        } else {
          temp.meas[d].forEach(function (v) {
            mData.push([v.date, v.source, +v.value]);
          });

          patients[patientId].measurements.push({
            "id": d,
            "name": textFile.measurements[d].name,
            "data": mData,
            "unit": textFile.measurements[d].unit,
            "type": textFile.measurements[d].type,
            "valueDecimals": textFile.measurements[d].valueDecimals
          });
        }
      });
    }
  };

  fs.createReadStream(IN_DIR + FILENAMES.measurements)
    .pipe(
    csv({
      separator: '\t',
      headers: ['patientId', 'date', 'thing', 'value', 'source']
    })
    )
    .on('data', function (data) {
      if (!textFile.measurements[data.thing]) return;
      if (+data.patientId !== lastPatId) {
        processMeasurements(lastPatId);
        temp = {};
        lastPatId = +data.patientId;
      }
      if (!patients[lastPatId]) {
        console.log("Measure for unknown patient: " + lastPatId);
        return;
      }
      if (!temp.meas) temp.meas = {};
      if (["SBP", "DBP"].indexOf(data.thing) > -1) {
        if (!temp.meas.BP) temp.meas.BP = [];
        temp.meas.BP.push({ date: new Date(data.date).getTime(), value: parseInt(data.value), thing: data.thing, source: data.source });
      } else if (data.thing === "BP") {
        return;
      } else {
        if (!temp.meas[data.thing]) temp.meas[data.thing] = [];
        temp.meas[data.thing].push({ date: new Date(data.date).getTime(), value: parseFloat(data.value), source: data.source });
      }
    })
    .on('err', function (err) {
      console.log("Error when doing measurements.");
      return callback(err);
    })
    .on('end', function () {
      console.log('Measurements done.');
      callback(null);
    });
};

var doPatientActions = function (callback) {
  console.log("Doing patient actions...");
  indicators.forEach(function (v) {
    v.opportunities = [];
    v.actions = [];
  });

  fs.createReadStream(IN_DIR + FILENAMES.patientActions)
    .pipe(
    csv({
      separator: '\t',
      headers: ['patientId', 'indicatorId', 'actionCat', 'reasonNumber', 'pointsPerAction', 'priority', 'actionText', 'supportingText']
    })
    )
    .on('data', function (data) {
      var pathway = data.indicatorId.split('.')[0];
      var stage = data.indicatorId.split('.')[1];
      var standard = data.indicatorId.split('.')[2];

      checkTextFile(pathway, stage, standard, FILENAMES.patientActions);
      var indText = textFile.pathways[pathway][stage].standards[standard];
      var oppText = indText.opportunities;

      if (!patients[+data.patientId]) {
        console.log("Action for unknown patient: " + data.patientId);
        return;
      }

      if (!patients[+data.patientId].actions) patients[+data.patientId].actions = [];
      if (data.actionText && patients[+data.patientId].actions.filter(function (v) {
        return v.actionText === data.actionText && v.indicatorId === data.indicatorId;
      }).length === 0) {
        patients[+data.patientId].actions.push({
          indicatorId: data.indicatorId,
          actionCat: data.actionCat,
          reasonNumber: data.reasonNumber,
          pointsPerAction: +data.pointsPerAction,
          priority: +data.priority,
          actionText: data.actionText,
          actionTextId: data.actionText.toLowerCase().replace(/[^a-z0-9]/g, ""),
          supportingText: data.supportingText
        });
      }

      var patientsStandard = patients[+data.patientId].standards ? patients[+data.patientId].standards.filter(function (v) {
        return v.display === indText.tabText;
      }) : [];
      if (patientsStandard.length === 0) {
        console.log("patient: " + data.patientId + " --numerator patient not appearing in denominator e.g. they appear in patActions but not in the denominator table");
        if (!patients[+data.patientId].standards) patients[+data.patientId].standards = [];
        patients[+data.patientId].standards.push({ display: indText.tabText, targetMet: false, type: indicatorType[data.indicatorId] });
      } else if (patientsStandard.length > 1) console.log("patient: " + data.patientId + " --numerator patient appearing more than once in the denominator e.g. they appear in the denominator table more than once");
      else patientsStandard[0].targetMet = false;

      var i = indicators.filter(function (v) {
        return v.id === data.indicatorId && v.practiceId === patients[+data.patientId].characteristics.practiceId;
      })[0];

      if (!i) {
        console.log("no indicator for" + JSON.stringify(data));
        return;
      }
      if (!i.opportunities) i.opportunities = [];

      var opp = i.opportunities.filter(function (v) {
        return v.id === data.actionCat;
      })[0];
      if (!opp) {
        if (!oppText[data.actionCat]) oppText[data.actionCat] = {};
        //console.log(data.actionCat);
        opp = { id: data.actionCat, name: oppText[data.actionCat].name, positionInBarChart: oppText[data.actionCat].positionInBarChart, description: oppText[data.actionCat].description, patients: [] };
        i.opportunities.push(opp);
        i.opportunities.sort(function (a, b) {
          return a.positionInBarChart - b.positionInBarChart;
        });
      }
      if (opp.patients.indexOf(+data.patientId) === -1) opp.patients.push(+data.patientId);
    })
    .on('err', function (err) {
      console.log("Error when doing patient actions.");
      return callback(err);
    })
    .on('end', function () {

      var all_practice_hack = {};

      indicators.forEach(function (v) {
        if (!v.type) return;
        if (!all_practice_hack[v.id]) {
          all_practice_hack[v.id] = JSON.parse(JSON.stringify(v));
          all_practice_hack[v.id].practiceId = "ALL";
          all_practice_hack[v.id].opportunities = all_practice_hack[v.id].opportunities.map(function (vv) {
            vv.patients = [];
            vv.patientCount = 0;
            return vv;
          });
          all_practice_hack[v.id].values = [];
          all_practice_hack[v.id].data = {};
        }
        v.opportunities.forEach(function (vv) {
          var opp = all_practice_hack[v.id].opportunities.filter(function (vvv) {
            return vvv.id === vv.id;
          });
          if (opp.length === 0) {
            opp = JSON.parse(JSON.stringify(vv));
            opp.patients = [];
            opp.patientCount = 0;
            all_practice_hack[v.id].opportunities.push(opp);
          } else {
            opp = opp[0];
          }
          opp.patientCount += vv.patients.length;
        });
        if (v.values && v.values[0].length > 0) {
          v.values[0].slice(1).forEach(function (vv, i) {
            if (!all_practice_hack[v.id].data[vv]) {
              all_practice_hack[v.id].data[vv] = {
                n: +v.values[1][i + 1],
                d: +v.values[2][i + 1],
                t: +v.values[3][i + 1],
                n2: v.values[4] ? +v.values[4][i + 1] : null
              };
            } else {
              all_practice_hack[v.id].data[vv].n += +v.values[1][i + 1];
              all_practice_hack[v.id].data[vv].d += +v.values[2][i + 1];
              if (all_practice_hack[v.id].data[vv].n2) {
                all_practice_hack[v.id].data[vv].n2 += +v.values[4][i + 1];
              }
            }
          });
        }
      });

      Object.keys(all_practice_hack).forEach(function (v) {
        var x = all_practice_hack[v];
        if (x.data[Object.keys(x.data)[0]].n2) {
          x.values = [["x"], ["patientCount"], ["denominator"], ["eventCount"], ["standardisedIncidence"]];
          Object.keys(x.data).forEach(function (vv) {
            x.values[0].push(vv);
            x.values[1].push(x.data[vv].n);
            x.values[2].push(x.data[vv].d);
            x.values[3].push(x.data[vv].t);
            x.values[4].push(x.data[vv].n2);
          });
        } else {
          x.values = [["x"], ["numerator"], ["denominator"], ["target"]];
          Object.keys(x.data).forEach(function (vv) {
            x.values[0].push(vv);
            x.values[1].push(x.data[vv].n);
            x.values[2].push(x.data[vv].d);
            x.values[3].push(x.data[vv].t);
          });
        }
        delete x._id;
        delete x.data;
        indicators.push(x);
      });

      console.log("Patient actions done.");
      callback(null);
    });
};

var doOrgActions = function (callback) {
  console.log("Doing org actions...");
  //now for the orgactions
  fs.createReadStream(IN_DIR + FILENAMES.orgActions)
    .pipe(
    csv({
      separator: '\t',
      headers: ['practiceId', 'indicatorId', 'actionId', 'proportion', 'numberPatients', 'pointsPerAction', 'priority', 'actionText', 'supportingText']
    })
    ) //NEED practiceId, actionId and priority
    .on('data', function (data) {

      var i = indicators.filter(function (v) {
        return v.id === data.indicatorId && v.practiceId === data.practiceId;
      })[0];

      if (!i) {
        console.log("hmm - an org action for an as yet unknown indicator or practice...");
        console.log("Indicator: " + data.indicatorId);
        console.log("Practice : " + data.practiceId);
        return;
      }

      if (!i.actions) i.actions = [];

      i.actions.push({
        id: data.actionId,
        indicatorId: data.indicatorId,
        actionText: data.actionText,
        actionTextId: data.actionText.toLowerCase().replace(/[^a-z0-9]/g, ""),
        supportingText: data.supportingText,
        numberPatients: data.numberPatients,
        pointsPerAction: +data.pointsPerAction,
        priority: +data.priority
      });
    })
    .on('err', function (err) {
      console.log("Error when doing org actions.");
      return callback(err);
    })
    .on('end', function () {
      console.log("Org actions done.");
      callback(null);
    });
};

var writeFiles = function (callback) {
  console.log("Writing files...");
  dataFile.text = textFile;

  fs.writeFileSync(OUT_DIR + 'indicators.json', JSON.stringify(dataFile.indicators, null, 2));

  var file = fs.createWriteStream(OUT_DIR + 'patients.json');
  file.on('error', function (err) {
    console.log("Error writing files.");
    return callback(err);
  });
  Object.keys(dataFile.patients).forEach(function (v) { file.write(JSON.stringify(dataFile.patients[v]) + '\n'); });
  file.end();

  fs.writeFileSync(OUT_DIR + 'text.json', JSON.stringify([textFile], null, 2));

  callback(null);
};

var displayWarning = function (callback) {
  if (messages.length > 0) {
    console.log();
    console.log("################");
    console.log("## WARNING!!! ##");
    console.log("################");
    console.log();
    console.log("The following errors were detected and should be investigated:");
    console.log();
    messages.forEach(function (msg) {
      console.warn(msg);
    });
  }
  callback(null);
};

/*var dump = function(callback) {
  heapdump.writeSnapshot(function(err, filename) {
    if (err) return callback(err);
    callback(null);
  });
};*/

var temp = {};

async.series([
  //dump,
  doProcessIndicators,
  doOutcomeIndicators,
  doIndicatorMapping,
  doDemographics,
  doDenominators,
  doEvents,
  //dump,
  doContacts,
  //dump,
  doDiagnoses,
  //dump,
  doMedications,
  //dump,
  doMeasurements,
  //dump,
  doPatientActions,
  doOrgActions,
  writeFiles,
  displayWarning
],
  // optional callback
  function (err, results) {
    // results is now equal to ['one', 'two']
    if (err) {
      console.log(err);
    }
  }
);
