const mongoose = require('mongoose');

const { Schema } = mongoose;

const statuses = {
  new: 'new',
  configured: 'configured',
  running: 'running',
  paused: 'paused',
  complete: 'complete',
  archived: 'archived',
};

const randomisationTypes = {
  perSession: 'perSession',
  perUser: 'perUser',
  perPractice: 'perPractice',
};


// For A/B tests
const TestSchema = new Schema({
  _id: Number,
  name: String,
  description: String,
  status: { type: String, enum: Object.keys(statuses), default: statuses.new },
  startDate: Date,
  randomisationType: { type: String, enum: Object.keys(randomisationTypes) },
  benchmarkId: Number,
});

module.exports = {
  statuses,
  randomisationTypes,
  Test: mongoose.model('Test', TestSchema),
};
