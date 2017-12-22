var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TextSchema = new Schema({
  events: Schema.Types.Mixed,
  measurements: Schema.Types.Mixed,
  pathways: Schema.Types.Mixed,
}, { collection: 'text' });

module.exports = mongoose.model('Text', TextSchema);
