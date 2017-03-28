var lifeline = require('../panels/lifeline'),
  data = require('../data'),
  base = require('../base'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  individualActionPlan = require('../panels/individualActionPlan'),
  qualityStandards = require('../panels/qualityStandards'),
  patientSearch = require('../panels/patientSearch'),
  allPatientList = require('../panels/allPatientList');

var ID = "PATIENT_VIEW";
/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

var updateTabAndTitle = function(patientId, pathwayId, pathwayStage, standard, patientData, dontClearRight) {
  var patid = (data.patLookup && data.patLookup[patientId] ? data.patLookup[patientId] : patientId);
  var sex = patientData.characteristics.sex.toLowerCase() === "m" ?
    "♂" : (patientData.characteristics.sex.toLowerCase() === "f" ? "♀" : patientData.characteristics.sex.toLowerCase());
  var titleTmpl = require("templates/patient-title");
  base.updateTitle(titleTmpl({
    patid: patid,
    nhs: patid.toString().replace(/ /g, ""),
    age: patientData.characteristics.age,
    sex: sex
  }), dontClearRight);

  var tabUrl = patientId;
  if (pathwayId && pathwayStage && standard) tabUrl = [patientId, pathwayId, pathwayStage, standard].join("/");
  base.updateTab("patients", patid, tabUrl);
};

var pv = {

  wireUp: function() {

  },

  create: function(pathwayId, pathwayStage, standard, patientId, loadContentFn) {

    var skip=0, limit=10;

    if(pathwayId && patientId && !isNaN(pathwayId) && !isNaN(patientId)){
      //we're actually in the all patient view so capture the skip/limit values
      skip = +patientId;
      limit = +pathwayId;
      pathwayId=null;
      patientId=null;
    }

    if(layout.view === ID && !patientId && layout.allPatientView) {
      //just changed the pagination
      if(layout.allPatientView.skip === skip && layout.allPatientView.limit === limit) return; //no change
      layout.allPatientView = {skip: skip, limit: limit};
      layout.patientId = "";
      allPatientList.populate(skip, limit);

      base.wireUpTooltips();
      base.hideLoading();

      return;
    } else {
        layout.allPatientView = null;
    }

    if (layout.view === ID && patientId === layout.patientId) {
      //the view is the same just need to update the actions
      individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);
      qualityStandards.update(patientId, pathwayId, pathwayStage, standard);

      var tabUrl = patientId;
      if (pathwayId && pathwayStage && standard) tabUrl = [patientId, pathwayId, pathwayStage, standard].join("/");
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

        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      base.hidePanels(farLeftPanel);

      if (patientId) {
        base.switchTo2Column1Narrow1Wide();
        lookup.suggestionModalText = "Screen: Patient\nPatient ID: " + patientId + "  - NB this helps us identify the patient but is NOT their NHS number.\n===========\n";

        data.getPatientData(patientId, function(patientData) {

          if (!data.patLookup) {
            //we're too early to get nhs number so let's repeat until it's there
            var updatePatientIds = function() {
              if (!data.patLookup) {
                setTimeout(function() {
                  updatePatientIds();
                }, 500);
              } else {
                updateTabAndTitle(patientId, pathwayId, pathwayStage, standard, patientData, true);
              }
            };

            setTimeout(function() {
              updatePatientIds();
            }, 500);
          }

          //title needs updating
          $('#mainTitle').show();

          updateTabAndTitle(patientId, pathwayId, pathwayStage, standard, patientData);

          layout.patientId = patientId;
          data.patientId = patientId;
          data.pathwayId = pathwayId;

          patientSearch.show($('#title-right'), true, true, loadContentFn);

          $('#patient-Search .card-title').html("<div class='col-sm-6'><p>Find another patient</p></div><div class='col-sm-2'><a class='btn btn-sm' href='/#patients'>reset</a></div>");

          qualityStandards.show(farRightPanel, false, patientId, pathwayId, pathwayStage, standard);

          //this shows the charts
          if (patientData.conditions.length +
            patientData.contacts.length +
            patientData.events.length +
            patientData.medications.length +
            patientData.measurements.length !== 0) {
            lifeline.show(farRightPanel, true, patientId, patientData);
          }

          individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);

          patientSearch.wireUp();
          $('#patient-pane').show();

          base.wireUpTooltips();
          base.hideLoading();

          //add state indicator
          farRightPanel.attr("class", "col-xl-6 col-lg-6 ps-child state-patient-rightPanel"); //ps-child col-xl-4 col-lg-4
          farLeftPanel.attr("class", "col-xl-6 col-lg-6 ps-child");

          //update the search container to ask...
          //$('#patient-Search .card-title').html("Find another patient");

          // BG-TODO might need re inserting - probably not.
          //$('#right-panel').css("overflow-y","auto");
          //$('#right-panel').css("overflow-x","hidden");
          //$('#left-panel').css("overflow-y","auto");
          //$('#left-panel').css("overflow-x","hidden");
          //base.updateFixedHeightElements([{ selector: '#right-panel', padding: 15,minHeight:300 },{selector:'#personalPlanIndividual',padding:820},{selector:'#advice-list',padding:430, minHeight:250}]);
        });
      } else {
        //scroll to top
        $("div").scrollTop(0);
        //base.updateTitle("No patient currently selected");
        base.updateTitle("");
        base.switchToSingleColumn();
        base.savePanelState();
        patientSearch.show(centrePanel, false, false, loadContentFn);

        $('#patient-Search .card-title').html("<p>Find a patient</p>");

        allPatientList.show(centrePanel, true, skip, limit, loadContentFn);

        layout.allPatientView = {skip: skip, limit: limit};

        layout.patientId = "";

        lookup.suggestionModalText = "Screen: Patient\nPatient ID: None selected\n===========\n";

        base.wireUpTooltips();
        base.hideLoading();

        //add state indicator

        // BG-TODO should this be on the centre panel now?
        farLeftPanel.attr("class", "col-xl-4 col-lg-4 state-patient-leftPanel");
        farRightPanel.attr("class", "col-xl-4 col-lg-4 state-patient-rightPanel");
        //update the search container to ask...
        //$('#patient-Search .card-title').html("Find a patient");

        //BG-TODO RW - don't think this is needed anymore??
        //$('#right-panel').css("overflow","visible");

        //BG-TODO - from RW dev branch - might not be needed
        base.updateTab("patients", "", "");
        //base.updateFixedHeightElements([{ selector: '#centre-panel', padding: 15,minHeight:300 }, { selector: '.table-scroll', padding: 220,minHeight:300 }]);

      }



    }, 0);

  },

  populate: function() {

  }

};

module.exports = pv;
