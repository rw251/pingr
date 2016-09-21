var base = require('../base.js'),
  data = require('../data.js'),
  Mustache = require('mustache');

var pc = {

  show: function(panel, isAppend, patientId) {

    var patientData = data.getPatientData(patientId);

    var tempMust = $('#patient-characteristics-panel').html();
    var html = Mustache.render(tempMust, patientData.characteristics);

    if (isAppend) panel.append(html);
    //*b* maintain state
    else {
      base.savePanelState();
      panel.html(html);
    }

  }

};

module.exports = pc;
