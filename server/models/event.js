const mongoose = require('mongoose');

const { Schema } = mongoose;

const EventSchema = new Schema({
  sessionId: String,
  date: { type: Date, default: Date.now, index: true },
  user: String,
  type: String,
  data: [{ _id: false, key: String, value: String }],
  url: String,
  xpath: String,
});

EventSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Event', EventSchema);
