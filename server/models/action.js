var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ActionSchema = new Schema({
  practiceId: String,
  indicatorList: [String],
  patientId: Number,
  actionTextId: String,
  actionText: String,
  agree: Boolean,
  done: Boolean,
  history: [{
    _id: false,
    who: String,
    what: String,
    when: Date,
    why: String,
  }],
  userDefined: Boolean,
  rejectedReason: String,
  rejectedReasonText: String,
});

module.exports = mongoose.model('Action', ActionSchema);
