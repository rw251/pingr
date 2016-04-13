var lifeline = require('../panels/lifeline.js'),
  data = require('../data.js'),
  base = require('../base.js'),
  layout = require('../layout.js'),
  individualActionPlan = require('../panels/individualActionPlan.js');

/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

var pv = {

  wireUp: function() {

  },

  create: function(pathwayId, pathwayStage, standard, patientId) {

    base.clearBox();
    base.switchTo21Layout();
    layout.showMainView();

    $('#mainTitle').show();
    base.updateTitle([{
      title: "Overview",
      url: "#overview"
    }, {
      title: data[pathwayId][pathwayStage].text.page.text,
      tooltip: data[pathwayId][pathwayStage].text.page.tooltip,
      url: ["#overview", pathwayId, pathwayStage, standard].join("/")
    }, {
      title: patientId
    }]);

    data.pathwayId = pathwayId;

    individualActionPlan.show(farRightPanel, pathwayId, pathwayStage, standard, patientId);
    data.getPatientData(patientId, function(data) {
      lifeline.create('top-right-panel', data);
    });

    base.wireUpTooltips();

  },

  populate: function() {

  }

};

module.exports = pv;
