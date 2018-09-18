const mongoose = require('mongoose');
const { statuses, randomisationTypes, trials, outcomes } = require('../../../shared/ab/config');
const testConfigs = require('../../../shared/ab/tests');

const { Schema } = mongoose;

const notSet = { id: 'notSet', name: 'Not set', description: 'Not set' };

// For A/B tests
const TestSchema = new Schema({
  name: { type: String, index: { unique: true } },
  description: String,
  researchQuestion: String,
  startDate: Date,
  endDate: Date,
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

TestSchema.virtual('randomisationType').get(function () {
  return this.randomisationTypeId ? randomisationTypes[this.randomisationTypeId] : notSet;
});

TestSchema.virtual('status').get(function () {
  return this.statusId ? statuses[this.statusId] : notSet;
});

TestSchema.virtual('outcome').get(function () {
  return this.outcomeId ? outcomes[this.outcomeId] : notSet;
});

TestSchema.virtual('trial').get(function () {
  return this.trialId ? trials[this.trialId] : notSet;
});

TestSchema.virtual('readyToDeploy').get(function () {
  return testConfigs[this.name] ? testConfigs[this.name].readyToDeploy === 'true' : false;
});

module.exports = mongoose.model('Test', TestSchema);
