var lifeline = require('../panels/lifeline'),
  data = require('../data'),
  base = require('../base'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  individualActionPlan = require('../panels/individualActionPlan'),
  qualityStandards = require('../panels/qualityStandards'),
  patientCharacteristics = require('../panels/patientCharacteristics'),
  patientSearch = require('../panels/patientSearch');

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

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        //base.switchTo21Layout();
        layout.showMainView();

        base.removeFullPage(farRightPanel);
        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      base.hidePanels(farLeftPanel);

      if (patientId) {
        lookup.suggestionModalText = "Screen: Patient\nPatient ID: " + patientId + "  - NB this helps us identify the patient but is NOT their NHS number.\n===========\n";

        data.getPatientData(patientId, function(patientData) {

          if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage ||
            layout.standard !== standard || layout.patientId !== patientId) {
            //different pathway or stage or patientId so title needs updating
            $('#mainTitle').show();

            var patid = (data.patLookup && data.patLookup[patientId] ? data.patLookup[patientId] : patientId);
            var sex = patientData.characteristics.sex.toLowerCase() === "m" ?
              "male" : (patientData.characteristics.sex.toLowerCase() === "f" ? "female" : patientData.characteristics.sex.toLowerCase());
            var titleTmpl = require("templates/patient-title");
            base.updateTitle(titleTmpl({
              patid: patid,
              nhs: patid.toString().replace(/ /g, ""),
              age: patientData.characteristics.age,
              sex: sex
            }));
          }

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

          base.wireUpTooltips();
          base.hideLoading();

        });
      } else {
        base.updateTitle("No patient currently selected");
        patientSearch.show(farRightPanel, true, loadContentFn);

        lookup.suggestionModalText = "Screen: Patient\nPatient ID: None selected\n===========\n";

        base.wireUpTooltips();
        base.hideLoading();
      }

    }, 0);

  },

  populate: function() {

  }

};

module.exports = pv;
