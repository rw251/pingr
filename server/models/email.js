const mongoose = require('mongoose');

const { Schema } = mongoose;

const EmailSchema = new Schema({
  label: String,
  subject: String,
  body: String,
  isDefault: Boolean,
});

module.exports = mongoose.model('Email', EmailSchema);
