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
  displayValue: Boolean, // whether to display the value of the measurement
  displayDate: Boolean, // whether to display the date of the measurement
  displayReviewDate: Boolean, // whether or not to display the review date column
  displayValueFrom: String, // whether to display the latest date/value from the 'practice', 'hospital' or 'both' (default)
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
      priority: Number,
      actionText: String,
      actionTextId: String,
      supportingText: String
    }
  ]
});

module.exports = mongoose.model('Indicator', IndicatorSchema);
