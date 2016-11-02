var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PracticeSchema = new Schema({
  _id: {
    type: String
  },
  name: {
    type: String
  },
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

module.exports = mongoose.model('Practice', PracticeSchema);
