var base = require('../base.js'),
  data = require('../data.js'),
  layout = require('../layout.js'),
  indicatorList = require('../panels/indicatorList.js'),
  teamActionPlan = require('../panels/teamActionPlan.js');

var ID = "OVERVIEW";
/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
var overview = {

  create: function(loadContentFn) {

    base.selectTab("overview");

    if (layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      //base.switchTo101Layout();
      layout.showMainView();

      $('#mainTitle').show();
      base.updateTitle("Overview");

      base.hidePanels(farRightPanel);

      layout.view = ID;
    }

    data.pathwayId = "htn"; //TODO fudge

    //The two panels we need to show
    //Panels decide whether they need to redraw themselves
    teamActionPlan.show(farLeftPanel);
    indicatorList.show(farRightPanel, false, loadContentFn);

    $('#overview-pane').show();

    base.wireUpTooltips();

  }

};

module.exports = overview;
