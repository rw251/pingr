const mongoose = require('mongoose');

const { Schema } = mongoose;

// Conversion metrics
const MetricSchema = new Schema({
  name: String,
  description: String,
});

module.exports = mongoose.model('Metric', MetricSchema);
