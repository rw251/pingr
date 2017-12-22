var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PracticeSchema = new Schema({
  _id: String,
  name: String,
  neighbourhood: String,
  ehr: String,
});

module.exports = mongoose.model('Practice', PracticeSchema);
