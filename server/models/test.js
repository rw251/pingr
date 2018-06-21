const mongoose = require('mongoose');
const { statuses, randomisationTypes } = require('../../shared/ab/config');

const { Schema } = mongoose;


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

module.exports = mongoose.model('Test', TestSchema);
