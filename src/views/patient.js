var lifeline = require('../panels/lifeline.js'),
  data = require('../data.js'),
  base = require('../base.js'),
  layout = require('../layout.js'),
  individualActionPlan = require('../panels/individualActionPlan.js'),
  qualityStandard = require('../panels/qualityStandard.js');

var ID = "PATIENT_VIEW";
/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

var pv = {

  wireUp: function() {

  },

  create: function(pathwayId, pathwayStage, standard, patientId) {

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      base.switchTo21Layout();
      layout.showMainView();

      layout.view = ID;
    }

    if(layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage ||
      layout.standard !== standard || layout.patientId !== patientId) {
      //different pathway or stage or patientId so title needs updating
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
    }

    data.pathwayId = pathwayId;

    individualActionPlan.show(farRightPanel, pathwayId, pathwayStage, standard, patientId);
    qualityStandard.show(topRightPanel, pathwayId, pathwayStage, standard, patientId);
    data.getPatientData(patientId, function(data) {
      lifeline.create('bottom-right-panel', patientId, data);
    });

    base.wireUpTooltips();

  },

  populate: function() {

  }

};

module.exports = pv;
