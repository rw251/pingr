var csv = require('csv-parser'),
  fs = require('fs'),
  async = require('async');

//CKD indicator hard coded
var pathway = "ckd";
var stage = "diagnosis";
var standard = "ckd";

var id = [pathway, stage, standard].join(".");

var FILENAMES = {
  demographics: 'demographics.txt',
  diagnoses: 'diagnoses.txt',
  events: 'important codes.txt',
  indicators: 'indicator.txt',
  measurements: 'measures.txt',
  contacts: 'contacts.txt',
  opportunities: 'impOppCatsAndActions.txt'
};


//Load current data
var dataFile = JSON.parse(fs.readFileSync('data/datareal.json', 'utf8') || "{}");

var textFile = JSON.parse(fs.readFileSync('data/text.json', 'utf8') || "{}");

var indText = textFile.pathways[pathway][stage].standards[standard];
var oppText = indText.opportunities;
var indicators = dataFile.indicators;
var patients = {};

var i = indicators.filter(function(v) {
  return v.id === id;
})[0];

if (!i) {
  i = {
    id: id,
    name: indText.name,
    description: indText.description,
    values: [["x"], ["numerator"], ["denominator"], ["target"]],
    opportunities: []
  };
  indicators.push(i);
}

if (!i.opportunities) i.opportunities = [];

var readCsvAsync = function(input, callback) {
  var obj = [];
  fs.createReadStream(input.file)
    .pipe(csv({ separator: '\t', headers: input.headers }))
    .on('data', function(data) {
      var o = {};
      for (var i = 0; i < input.headers.length; i++) {
        o[input.headers[i]] = data[input.headers[i]];
      }
      obj.push(o);
    })
    .on('err', function(err) { callback(err); })
    .on('end', function() { callback(null, obj); });
};

async.series([
  function(callback) {
      console.log("1 series");
      fs.createReadStream('data/in/' + FILENAMES.indicators)
        .pipe(
          csv({
            separator: '\t',
            headers: ['date', 'numerator', 'denominator', 'target']
          })
        )
        .on('data', function(data) {
          i.values[0].push(data.date);
          i.values[1].push(data.numerator);
          i.values[2].push(data.denominator);
          i.values[3].push(data.target);
        })
        .on('end', function() {
          /*fs.writeFile('data/indicators.json', JSON.stringify(indicators, null, 2), function(err) {
            if (err) return console.log(err);
          });*/
          console.log("1 series done");
          callback(null);
        })
        .on('err', function(err) {
          console.log("1 series err");
          callback(err);
        });
  },

  function(callback) {
      console.log("2 series");
      async.map([
        { file: "data/in/" + FILENAMES.demographics, headers: ['patientId', 'age', 'sex'] },
        { file: "data/in/" + FILENAMES.diagnoses, headers: ['patientId', 'date', 'diag', 'cat'] },
        { file: "data/in/" + FILENAMES.measurements, headers: ['patientId', 'date', 'thing', 'value'] },
        { file: "data/in/" + FILENAMES.events, headers: ['patientId', 'date', 'event'] },
        { file: "data/in/" + FILENAMES.contacts, headers: ['patientId', 'date', 'contact'] }
    ], readCsvAsync, function(err, results) {
        if (err) {
          return callback(err);
        }
        var temp = {};
        //age, sex
        results[0].forEach(function(v) {
          temp[+v.patientId] = {};
          patients[+v.patientId] = { characteristics: { age: v.age, sex: v.sex } };
          patients[+v.patientId].conditions = [];
          patients[+v.patientId].events = [];
          patients[+v.patientId].contacts = [];
          patients[+v.patientId].measurements = [];
          patients[+v.patientId].standards = [{display:indText.name, targetMet:false}];
          patients[+v.patientId].medications = [];
          patients[+v.patientId].actions = [];
        });

        //diagnoses
        results[1].forEach(function(v) {
          if (!temp[+v.patientId].diag) temp[+v.patientId].diag = {};
          if (!temp[+v.patientId].diag[v.diag]) temp[+v.patientId].diag[v.diag] = [];
          temp[+v.patientId].diag[v.diag].push({ date: new Date(v.date).getTime(), cat: v.cat });
        });

        Object.keys(temp).forEach(function(p) {
          if (temp[p].diag) {
            Object.keys(temp[p].diag).forEach(function(d) {
              temp[p].diag[d].sort(function(a, b) {
                return a.date - b.date;
              });
              var intervals = [];
              var last = temp[p].diag[d].reduce(function(prev, cur) {
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
              patients[p].conditions.push({
                name: d,
                intervals: intervals
              });
            });
          }
        });

        //measurements
        results[2].forEach(function(v) {
          if (!temp[+v.patientId].meas) temp[+v.patientId].meas = {};
          if (!temp[+v.patientId].meas[v.thing]) temp[+v.patientId].meas[v.thing] = [];
          temp[+v.patientId].meas[v.thing].push({ date: new Date(v.date).getTime(), value: v.value });
        });

        Object.keys(temp).forEach(function(p) {
          if (temp[p].meas) {
            Object.keys(temp[p].meas).forEach(function(d) {
              temp[p].meas[d].sort(function(a, b) {
                return a.date - b.date;
              });
              var mData = [];
              temp[p].meas[d].forEach(function(v) {
                mData.push([v.date, +v.value]);
              });
              patients[p].measurements.push({
                "id": d,
                "name": textFile.measurements[d].name,
                "data": mData,
                "unit": textFile.measurements[d].unit,
                "type": textFile.measurements[d].type,
                "valueDecimals": textFile.measurements[d].valueDecimals
              });
            });
          }
        });


        //events
        results[3].forEach(function(v) {
          patients[+v.patientId].events.push({
            name: v.event,
            time: new Date(v.date).getTime(),
            task: 1
          });
        });

        //contacts
        results[4].forEach(function(v) {
          patients[+v.patientId].contacts.push({
            name: v.contact,
            time: new Date(v.date).getTime(),
            task: 2
          });
        });

        dataFile.patients = patients;

        i.opportunities.forEach(function(v, ix) {
          i.opportunities[ix].patients = [];
        });
        fs.createReadStream('data/in/' + FILENAMES.opportunities)
          .pipe(
            csv({
              separator: '\t',
              headers: ['patientId', 'opportunity', 'actionId', 'short', 'long', 'reason', 'link']
            })
          )
          .on('data', function(data) {
            patients[+data.patientId].actions.push({
              id: data.actionId,
              short: data.short,
              long: data.long,
              reason: data.reason,
              link: data.link
            });
            var opp = i.opportunities.filter(function(v) {
              return v.id === data.opportunity;
            })[0];
            if (!opp) {
              console.log(data.opportunity);
              opp = { id: data.opportunity, name: oppText[data.opportunity].name, description: oppText[data.opportunity].description, patients: [] };
              i.opportunities.push(opp);
            }
            if(opp.patients.indexOf(+data.patientId)===-1) opp.patients.push(+data.patientId);
          })
          .on('end', function() {
            /*fs.writeFile('data/idata.' + id + '.json', JSON.stringify(i, null, 2), function(err) {
              if (err) return console.log(err);
            });*/

            fs.writeFile('data/datareal.json', JSON.stringify(dataFile, null, 2), function(err) {
              if (err) return console.log(err);
            });
          });
      });
  }],
  // optional callback
  function(err, results) {
    // results is now equal to ['one', 'two']
    if (err) {
      console.log(err);
    }
  }
);
