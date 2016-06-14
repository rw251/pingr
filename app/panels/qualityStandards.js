var data = require('../data.js');

var qs = {

  show: function(panel, isAppend, patientId) {

    var patientData = data.getPatientData(patientId);

    var tmpl = require("templates/quality-standard");
    var html = tmpl({
      "standards": patientData.standards
    });

    if (isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = qs;
