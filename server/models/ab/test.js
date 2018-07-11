const mongoose = require('mongoose');
const { statuses, randomisationTypes, trials, outcomes } = require('../../../shared/ab/config');

const { Schema } = mongoose;


// For A/B tests
const TestSchema = new Schema({
  name: { type: String, index: { unique: true } },
  description: String,
  researchQuestion: String,
  startDate: Date,
  days: Number,
  outcomeBaselineValue: Number,
  conversionMinDetectableEffect: Number,
  conversionPower: Number,
  conversionAlpha: Number,
  conversionSampleSize: Number,
  statusId: { type: String, enum: Object.keys(statuses), default: statuses.new.id },
  randomisationTypeId: { type: String, enum: Object.keys(randomisationTypes) },
  outcomeId: { type: String, enum: Object.keys(outcomes) },
  trialId: { type: String, enum: Object.keys(trials) },
});

module.exports = mongoose.model('Test', TestSchema);
