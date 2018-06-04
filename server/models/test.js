const mongoose = require('mongoose');

const { Schema } = mongoose;

// For A/B tests
const TestSchema = new Schema({
  _id: String,
  name: String,
  description: String,
  startDate: { type: Date, default: Date.now },
  typeOfRandomisation: { type: String, enum: ['perSession', 'perUser', 'perPractice'] },
  isRunning: { type: Boolean, default: false },
});

module.exports = mongoose.model('Test', TestSchema);
