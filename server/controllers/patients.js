var Patient = require('../models/patient');

module.exports = {

  //Return a list of patients - not sure this is needed
  list: function(done) {
    Patient.find({}, {patientId: 1}, function(err, patients) {
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
    Patient.findOne({patientId: patientId}, function(err, patient) {
      if(err) {
        console.log(err);
        return done(new Error("Error finding patient"));
      }
      if (!patient) {
        console.log('Invalid request for patientId: ' + patientId);
        return done(null, false);
      } else {
        done(null, patient/*.toObject()*/);
      }
    });
  },

  //Get list of patients for a practice and indicator - for use on indicator screen
  getListForIndicator: function(practiceId, indicatorId, done){

  }
};
