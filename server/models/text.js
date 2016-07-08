var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TextSchema = new Schema({
  events : Schema.Types.Mixed,
  measurements : Schema.Types.Mixed,
  pathways : Schema.Types.Mixed
});

module.exports = mongoose.model('Text', Schema.Types.Mixed);
