const mongoose = require('mongoose');
const { statuses, randomisationTypes, trials } = require('../../../shared/ab/config');

const { Schema } = mongoose;


// For A/B tests
const TestSchema = new Schema({
  name: { type: String, index: { unique: true } },
  description: String,
  researchQuestion: String,
  status: { type: String, enum: Object.keys(statuses), default: statuses.new.id },
  startDate: Date,
  randomisationType: { type: String, enum: Object.keys(randomisationTypes) },
  days: Number,
  outcomeId: Number,
  outcomeBaselineValue: Number,
  conversionMinDetectableEffect: Number,
  conversionPower: Number,
  conversionAlpha: Number,
  conversionSampleSize: Number,
  trial: { type: String, enum: Object.keys(trials) },
});

module.exports = mongoose.model('Test', TestSchema);
