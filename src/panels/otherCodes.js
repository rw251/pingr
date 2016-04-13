var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var other = {

  create: function(pathwayId, pathwayStage, standard, patientId) {
    var codes = (data.patients[patientId].codes || []).map(function(val) {
      val.description = data.codes[val.code];
      return val;
    });
    var agree = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "codes");
    return base.createPanel($('#other-codes-panel'), {
      "areCodes": codes.length > 0,
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "pathway": data.pathwayNames[pathwayId],
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "codes": codes,
      "pathwayStage": pathwayStage
    }, {
      "codeRow": $('#other-codes-row').html()
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#other-codes-agree-disagree'), $('#other-codes-panel'), pathwayId, pathwayStage, standard, patientId, "codes", "other codes");
  }

};

module.exports = other;
