const mongoose = require('mongoose');

const { Schema } = mongoose;

const ConfigSchema = new Schema({
  key: String,
  value: String,
});

module.exports = mongoose.model('Config', ConfigSchema);
