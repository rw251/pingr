var Patient = require('../models/patient'),
  indicators = require('./indicators');

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
        done(null, patient /*.toObject()*/ );
      }
    });
  },

  //Get list of patients for a practice and indicator - for use on indicator screen
  getListForIndicator: function(practiceId, indicatorId, done) {
    //need to get
    // [{patientId, age, value, [impOpps]}]
    indicators.get(practiceId, indicatorId, function(err, indicator) {

      var patientList = indicator.opportunities.reduce(function(prev, curr) {
        var union = prev.concat(curr.patients);
        return union.filter(function(item, pos) {
          return union.indexOf(item) == pos;
        });
      }, []);

      Patient.find({ patientId: { $in: patientList } }, { _id: 0, patientId: 1, characteristics: 1, measurements: { $elemMatch: { id: indicator.measurementId } }, "measurements.data": { $slice: -1 } },
        function(err, patients) {
          var p = patients.map(function(patient) {
            patient = patient.toObject();
            var meas = "?";
            if (patient.measurements) {
              meas = indicator.displayDate ? patient.measurements[0].data[0][0] : patient.measurements[0].data[0][1];
            }
            var opps = indicator.opportunities.filter(function(v) {
              return v.patients.indexOf(""+patient.patientId) > -1;
            }).map(function(v) {
              return v.id;
            });
            return {
              patientId: patient.patientId,
              age: patient.characteristics.age,
              value: meas,
              opportunities: opps
            };
          });
          return done(null, p);
        });
    });
  }
};
