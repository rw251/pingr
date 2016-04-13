var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var med = {

  create: function(pathwayId, pathwayStage, standard, patientId) {
    var medications = data.patients[patientId].medications || [];
    var agree = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "medication");
    return base.createPanel(medicationPanel, {
      "areMedications": medications.length > 0,
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "pathway": data.pathwayNames[pathwayId],
      "medications": medications,
      "pathwayStage": pathwayStage
    }, {
      "medicationRow": $('#medication-row').html()
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#medication-agree-disagree'), $('#medication-panel'), pathwayId, pathwayStage, standard, patientId, "medication", "medication data");
  }

};

module.exports = med;
