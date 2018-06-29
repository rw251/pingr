const mongoose = require('mongoose');
const { statuses, randomisationTypes, hitCounters } = require('../../../shared/ab/config');

const { Schema } = mongoose;


// For A/B tests
const TestSchema = new Schema({
  name: { type: String, index: { unique: true } },
  description: String,
  status: { type: String, enum: Object.keys(statuses), default: statuses.new },
  startDate: Date,
  randomisationType: { type: String, enum: Object.keys(randomisationTypes) },
  conversionMetricId: Number,
  conversionMetricBaselineValue: Number,
  conversionMinDetectableEffect: Number,
  conversionPower: Number,
  conversionAlpha: Number,
  conversionSampleSize: Number,
  hitCounter: { type: String, enum: Object.keys(hitCounters) },
});

module.exports = mongoose.model('Test', TestSchema);
