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
    $('.loading-container').show();

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

      if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage ||
        layout.standard !== standard || layout.patientId !== patientId) {
        //different pathway or stage or patientId so title needs updating
        $('#mainTitle').show();

        if (pathwayId && pathwayStage && standard) {

          base.updateTitle([{
            title: "Overview",
            url: "#overview"
                }, {
            title: data.text[pathwayId][pathwayStage].text.page.text,
            tooltip: data.text[pathwayId][pathwayStage].text.page.tooltip,
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


      if (patientId) {
        base.updateTab("patients", data.patLookup[patientId] || patientId, patientId);

        layout.patientId = patientId;
        data.pathwayId = pathwayId;

        var elWrap = $('<div class="row"></div>');

        var el1 = $('<div class="col-md-4"></div>');
        var el2 = $('<div class="col-md-8"></div>');

        patientSearch.show(el1, false, loadContentFn);
        patientCharacteristics.show(el1,true, patientId);
        qualityStandards.show(el2, true, patientId);
        elWrap.html(el1);
        elWrap.append(el2);
        farRightPanel.html(elWrap);
        data.getPatientData(patientId, function(data) {
          lifeline.show(farRightPanel, true, patientId, data);
        });
        individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);

        patientSearch.wireUp();
        $('#patient-pane').show();
      } else {
        base.updateTab("patients", "", patientId);

        patientSearch.show(farRightPanel, false, loadContentFn);
      }

      base.wireUpTooltips();
      $('.loading-container').fadeOut(1000);
    }, 0);

  },

  populate: function() {

  }

};

module.exports = pv;
