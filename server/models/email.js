var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var EmailSchema = new Schema({
  label: String,
  subject: String,
  body: String
});

module.exports = mongoose.model('Email', EmailSchema);
