var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PatientSchema = new Schema({
  patientId: {
    type: Number
  },
  characteristics: {
    age: Number,
    sex: String
  },
  conditions: [
    {
      name: String,
      intervals: [
        {
          from: Number,
          to: Number,
          label: String
        }
      ]
    }
  ],
  events: [
    {
      name: String,
      time: Number,
      task: Number
    },
  ],
  contacts:[
    {
      name: String,
      time: Number,
      task: Number
    }
  ],
  measurements: [
    {
      id: String,
      name: String,
      data: Schema.Types.Mixed
    }
  ],
  standards: [
    {
      display: String,
      targetMet: Boolean
    }
  ],
  medications: [

  ],
  actions: [
    {
      id: String,
      short: String,
      long: String,
      reason: String,
      link: String
    }
  ]
});

module.exports = mongoose.model('Patient', PatientSchema);
