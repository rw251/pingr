var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var IndicatorSchema = new Schema({
  practiceId: String,
  id: String,
  values: [[String]],
  opportunities: [{ id: String, patients: [Number] }],
  measurementId: String, // the id of the measurement to display
  displayDate: Boolean, // whether to display the value or the date of the measurement
  actions: [
    {
      id: String,
      short: String,
      long: String,
      reason: String,
      link: String,
      agree: Boolean,
      done: Boolean,
      history: [String],
      userDefined: Boolean,
      rejected: {
        reason: String,
        reasonText: String
      }
    }
  ]
});

module.exports = mongoose.model('Indicator', IndicatorSchema);
