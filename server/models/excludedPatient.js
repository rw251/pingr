var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ExcludedPatientSchema = new Schema({
  practiceId: String,
  patientId: Number,
  indicatorId: String,
  reason: String,
  freetext: String,
  who: String,
  when: Date,
});

module.exports = mongoose.model('ExcludedPatient', ExcludedPatientSchema);
