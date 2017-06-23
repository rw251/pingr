var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var EmailSchema = new Schema({
  label: String,
  subject: String,
  body: String,
  isDefault: Boolean
});

module.exports = mongoose.model('Email', EmailSchema);
