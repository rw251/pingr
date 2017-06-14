var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PatientSchema = new Schema({
  patientId: {
    type: Number
  },
  characteristics: {
    age: Number,
    sex: String,
    nhs: Number,
    practiceId: String
  },
  conditions: [
    {
      _id:false,
      name: String,
      intervals: [
        {
          _id:false,
          from: Number,
          to: Number,
          label: String
        }
      ]
    }
  ],
  events: [
    {
      _id:false,
      name: String,
      time: Number,
      task: Number
    },
  ],
  contacts:[
    {
      _id:false,
      name: String,
      time: Number,
      task: Number
    }
  ],
  measurements: [
    {
      _id:false,
      id: String,
      name: String,
      data: Schema.Types.Mixed
    }
  ],
  standards: [
    {
      _id:false,
      type: { type: String, default: "process"}, //Currently "process" OR "outcome" - same as indicator model
      display: String,
      targetMet: Boolean,
      //missing why ???
      nextReviewDate: Date
    }
  ],
  medications: [

  ],
  actions: [
    {
      _id:false,
      id: String, //needed anymore??
      link: String, //needed anymore??
      indicatorId: String,
      actionCat: String,
      reasonNumber: String,
      pointsPerAction: Number,
      priority: String,
      actionText: String,
      actionTextId: String,
      supportingText: String
    }
  ]
});

module.exports = mongoose.model('Patient', PatientSchema);
