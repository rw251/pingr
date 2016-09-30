var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PracticeSchema = new Schema({
  _id: {
    type: String
  },
  name: {
    type: String
  }
});

module.exports = mongoose.model('Practice', PracticeSchema);
