var data = require('../data.js'),
  Mustache = require('mustache');

var qs = {

  show: function(panel, isAppend, patientId) {

    var patientData = data.getPatientData(patientId);

    var tempMust = $('#quality-standard-panel').html();
    var html = Mustache.render(tempMust, {
      "standards": patientData.standards
    });

    if (isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = qs;
