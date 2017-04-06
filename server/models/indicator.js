var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var IndicatorSchema = new Schema({
  practiceId: String,
  id: String,
  name: String,
  values: [[String]],
  benchmark: Number,
  opportunities: [{ _id:false, id: String, patients: [Number] }],
  measurementId: String, // the id of the measurement to display
  displayDate: Boolean, // whether to display the value or the date of the measurement
  type: String, //currently either "process" OR "outcome" - same as patient model
  mappedIndicators: [String], // for outcome indicators these are the relevant process
                              // indicators for displaying actions
  actions: [
    {
      _id:false,
      id: String,
      link: String, //needed anymore??
      indicatorId: String,
      numberPatients: String,
      reasonNumber: String,
      pointsPerAction: Number,
      priority: String,
      actionText: String,
      actionTextId: String,
      supportingText: String
    }
  ]
});

module.exports = mongoose.model('Indicator', IndicatorSchema);
