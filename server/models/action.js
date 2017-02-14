var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ActionSchema = new Schema({
  practiceId: String,
  indicatorId: String,
  patientId: Number,
  actionTextId: String,
  actionText: String,
  agree: Boolean,
  done: Boolean,
  history: [String],
  userDefined: Boolean,
  rejectedReason: String,
  rejectedReasonText: String
});

module.exports = mongoose.model('Action', ActionSchema);
