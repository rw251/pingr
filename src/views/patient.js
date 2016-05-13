var lifeline = require('../panels/lifeline.js'),
  data = require('../data.js'),
  base = require('../base.js'),
  layout = require('../layout.js'),
  individualActionPlan = require('../panels/individualActionPlan.js'),
  qualityStandards = require('../panels/qualityStandards.js'),
  patientCharacteristics = require('../panels/patientCharacteristics.js'),
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
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      data.getPatientData(patientId, function(patientData) {
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

          var patid = (data.patLookup && data.patLookup[patientId] ? data.patLookup[patientId] : patientId);
          var sex = patientData.characteristics.sex.toLowerCase()==="m" ?
            "male" : (patientData.characteristics.sex.toLowerCase()==="f" ? "female" : patientData.characteristics.sex.toLowerCase())
          ;
          base.updateTitle("Patient " + patid +
            " - " + patientData.characteristics.age + " year old " + sex);
        }


        base.hidePanels(farLeftPanel);


        if (patientId) {
          base.updateTab("patients", data.patLookup[patientId] || patientId, patientId);

          layout.patientId = patientId;
          data.patientId = patientId;
          data.pathwayId = pathwayId;

          patientSearch.show($('#title-right'), true, loadContentFn);
          qualityStandards.show(farRightPanel, false, patientId);

          lifeline.show(farRightPanel, true, patientId, patientData);
          individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);

          patientSearch.wireUp();
          $('#patient-pane').show();
        } else {
          base.updateTitle("No patient currently selected");

          patientSearch.show(farRightPanel, true, loadContentFn);
        }

        base.wireUpTooltips();
        base.hideLoading();

      });
    }, 0);

  },

  populate: function() {

  }

};

module.exports = pv;
