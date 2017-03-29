var base = require('../base'),
  data = require('../data'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  indicatorList = require('../panels/indicatorList'),
  teamActionPlan = require('../panels/teamActionPlan');

var ID = "OVERVIEW";
/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
var overview = {
  updateTabAndTitle: function(dontClearRight) {
    var titleTmpl = require("templates/overview-title");
    base.updateTitle(titleTmpl({}), dontClearRight);

    //var tabUrl = patientId;
    //if (pathwayId && pathwayStage && standard) tabUrl = [patientId, pathwayId, pathwayStage, standard].join("/");
    //base.updateTab("patients", patid, tabUrl);
  },
  create: function(loadContentFn) {

    lookup.suggestionModalText = "Screen: Overview\n===========\n";

    base.selectTab("overview");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      var practiceName = $('#practice_name').text();

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        $('#mainTitle').show();
        base.updateTitle("Overview of " + practiceName + "'s performance");

        //base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      data.pathwayId = "htn";

      //The two panels we need to show
      //Panels decide whether they need to redraw themselves
      teamActionPlan.show(farLeftPanel, "Top 3 suggested actions for " + practiceName);
      indicatorList.show(farRightPanel, false, loadContentFn);

      $('#overview-pane').show();

      base.wireUpTooltips();

      //farRightPanel.find('div.table-scroll').getNiceScroll().remove();
      /*farRightPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });*/

      base.hideLoading();
      overview.updateTabAndTitle(true);
      //add state indicator
      //farRightPanel.attr("class", "col-xl-6 col-lg-6 state-overview-rightPanel");
      //farLeftPanel.attr("class", "col-xl-6 col-lg-6 state-overview-leftPanel");

      //base.updateFixedHeightElements([{selector:'#personalPlanTeam',padding:820, minHeight:200},{selector:'#advice-list',padding:430, minHeight:250},{selector:'.table-scroll',padding:220, minHeight:300}]);
    }, 0);

  }

};

module.exports = overview;
