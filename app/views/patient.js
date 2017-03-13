var lifeline = require('../panels/lifeline'),
  data = require('../data'),
  base = require('../base'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  individualActionPlan = require('../panels/individualActionPlan'),
  qualityStandards = require('../panels/qualityStandards'),
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

    if(layout.view === ID && patientId === layout.patientId) {
      //the view is the same just need to update the actions
      individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);
      qualityStandards.update(patientId, pathwayId, pathwayStage, standard);

      var tabUrl = patientId;
      if(pathwayId && pathwayStage && standard) tabUrl = [patientId, pathwayId, pathwayStage, standard].join("/");
      base.updateTab("patients", data.patLookup[patientId] || patientId, tabUrl);

      return;
    }

    base.selectTab("patient");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        base.removeFullPage(farRightPanel);
        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      base.hidePanels(farLeftPanel);

      if (patientId) {
        lookup.suggestionModalText = "Screen: Patient\nPatient ID: " + patientId + "  - NB this helps us identify the patient but is NOT their NHS number.\n===========\n";

        data.getPatientData(patientId, function(patientData) {

          //title needs updating
          $('#mainTitle').show();

          var patid = (data.patLookup && data.patLookup[patientId] ? data.patLookup[patientId] : patientId);
          var sex = patientData.characteristics.sex.toLowerCase() === "m" ?
            "♂" : (patientData.characteristics.sex.toLowerCase() === "f" ? "♀" : patientData.characteristics.sex.toLowerCase());
          var titleTmpl = require("templates/patient-title");
          base.updateTitle(titleTmpl({
            patid: patid,
            nhs: patid.toString().replace(/ /g, ""),
            age: patientData.characteristics.age,
            sex: sex
          }));

          var tabUrl = patientId;
          if(pathwayId && pathwayStage && standard) tabUrl = [patientId, pathwayId, pathwayStage, standard].join("/");
          base.updateTab("patients", data.patLookup[patientId] || patientId, tabUrl);

          layout.patientId = patientId;
          data.patientId = patientId;
          data.pathwayId = pathwayId;

          patientSearch.show($('#title-right'), false, loadContentFn);
          qualityStandards.show(farRightPanel, false, patientId, pathwayId, pathwayStage, standard);

          //this shows the charts
          lifeline.show(farRightPanel, true, patientId, patientData);
          individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);

          patientSearch.wireUp();
          $('#patient-pane').show();

          base.wireUpTooltips();
          base.hideLoading();

          //add state indicator
          farRightPanel.attr("class", "col-xl-6 col-lg-6 ps-child state-patient-rightPanel"); //ps-child col-xl-4 col-lg-4
          farLeftPanel.attr("class", "col-xl-6 col-lg-6 ps-child");

          //update the search container to ask...
          $('#patient-Search .card-title').html("Find another patient")

          $('#right-panel').css("overflow-y","auto");
          $('#right-panel').css("overflow-x","hidden");
          $('#left-panel').css("overflow-y","auto");
          $('#left-panel').css("overflow-x","hidden");
          base.updateFixedHeightElements([{selector:'#right-panel',padding:15},{selector:'.fit-to-screen-height',padding:200}]);
        });
      } else {
        //scroll to top
        $("div").scrollTop(0);
        //base.updateTitle("No patient currently selected");
        base.updateTitle("");

        base.savePanelState();
        patientSearch.show(farRightPanel, false, loadContentFn);

        lookup.suggestionModalText = "Screen: Patient\nPatient ID: None selected\n===========\n";

        base.wireUpTooltips();
        base.hideLoading();

        //add state indicator
        farLeftPanel.attr("class", "col-xl-4 col-lg-4 state-patient-leftPanel");
        farRightPanel.attr("class", "col-xl-4 col-lg-4 state-patient-rightPanel");
        //update the search container to ask...
        $('#patient-Search .card-title').html("Find a patient")
        $('#right-panel').css("overflow","visible");
      }

    }, 0);

  },

  populate: function() {

  }

};

module.exports = pv;
