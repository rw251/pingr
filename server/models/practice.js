const mongoose = require('mongoose');

const { Schema } = mongoose;

const PracticeSchema = new Schema({
  _id: String,
  name: String,
  neighbourhood: String,
  ehr: String,
});

module.exports = mongoose.model('Practice', PracticeSchema);
