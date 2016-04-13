var base = require('../base.js'),
  data = require('../data.js'),
  layout = require('../layout.js'),
  indicatorList = require('../panels/indicatorList.js'),
  teamActionPlan = require('../panels/teamActionPlan.js');

/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
var overview = {

  create: function(loadContentFn) {

    base.clearBox();
    base.switchTo101Layout();
    layout.showMainView();

    $('#mainTitle').show();
    base.updateTitle("Overview");

    //Show overview panels
    data.pathwayId = "htn";//TODO fudge

    teamActionPlan.show(farRightPanel);
    indicatorList.create(farLeftPanel, loadContentFn);

    base.wireUpTooltips();

  }

};

module.exports = overview;
