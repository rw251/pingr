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

  create: function(loadContentFn) {

    lookup.suggestionModalText="Screen: Overview\n===========\n";

    base.selectTab("overview");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      var practiceName = $('#practice_name').text();

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        //base.switchTo101Layout();
        layout.showMainView();

        $('#mainTitle').show();
        base.updateTitle("Overview of " + practiceName + "'s performance");

        base.removeFullPage(farLeftPanel);
        base.hidePanels(farLeftPanel);

        layout.view = ID;
      }

      data.pathwayId = "htn"; //TODO fudge

      //The two panels we need to show
      //Panels decide whether they need to redraw themselves
      teamActionPlan.show(farRightPanel, "Top 3 suggested actions for " + practiceName);
      indicatorList.show(farLeftPanel, false, loadContentFn);

      $('#overview-pane').show();

      base.wireUpTooltips();

      //farRightPanel.find('div.table-scroll').getNiceScroll().remove();
      farLeftPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });

      base.hideLoading();

      //add state indicator
      farLeftPanel.attr("class", "col-xl-8 col-lg-8 state-overview-rightPanel");

    }, 0);

  }

};

module.exports = overview;
