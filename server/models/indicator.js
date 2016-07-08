var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var IndicatorSchema = new Schema({
  practiceId : String,
  id : String,
  values : [[String]],
  opportunities : [{ id : String, patients : [Number] }]
});

module.exports = mongoose.model('Indicator', IndicatorSchema);
