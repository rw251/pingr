var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ConfigSchema = new Schema({
  key : String,
  value : String
});

module.exports = mongoose.model('Config', ConfigSchema);
