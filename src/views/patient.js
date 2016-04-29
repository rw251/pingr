var lifeline = require('../panels/lifeline.js'),
  data = require('../data.js'),
  base = require('../base.js'),
  layout = require('../layout.js'),
  individualActionPlan = require('../panels/individualActionPlan.js'),
  qualityStandard = require('../panels/qualityStandard.js'),
  patientSearch = require('../panels/patientSearch.js');

var ID = "PATIENT_VIEW";
/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

var pv = {

  wireUp: function() {

  },

  create: function(pathwayId, pathwayStage, standard, patientId, loadContentFn) {

    base.selectTab("patient");

    if (layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      //base.switchTo21Layout();
      layout.showMainView();

      base.removeFullPage(farRightPanel);
      base.hidePanels(farRightPanel);

      layout.view = ID;
    }

    if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage ||
      layout.standard !== standard || layout.patientId !== patientId) {
      //different pathway or stage or patientId so title needs updating
      $('#mainTitle').show();

      if (pathwayId && pathwayStage && standard) {

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
      } else {
        base.updateTitle([{
          title: "Overview",
          url: "#overview"
                }, {
          title: patientId
              }]);
      }
    }


    base.hidePanels(farLeftPanel);
    patientSearch.show(farRightPanel, false, loadContentFn);

    if (patientId) {
      base.updateTab("patients", patientId, patientId);

      layout.patientId = patientId;
      data.pathwayId = pathwayId;

      data.getPatientData(patientId, function(data) {
        lifeline.show(farRightPanel, true, patientId, data);
      });
      individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);
      //qualityStandard.show($('#patient-pane'), pathwayId, pathwayStage, standard, patientId);

      $('#patient-pane').show();
    } else {
      base.updateTab("patients", "", patientId);
    }

    base.wireUpTooltips();

  },

  populate: function() {

  }

};

module.exports = pv;
