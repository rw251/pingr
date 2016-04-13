var base = require('../base.js'),
  data = require('../data.js'),
  patientList = require('../panels/patientList.js'),
  indicator = require('../panels/indicator.js'),
  teamActionPlan = require('../panels/teamActionPlan.js'),
  layout = require('../layout.js');

/*
 * The indicator page consists of the panels:
 *   Tabbed panel
 *     - performance trend
 *     - performance benchmark
 *   Patient groups
 *   Patient list
 *   Team action plan
 */

var ind = {

  create: function(pathwayId, pathwayStage, standard, tab, loadContentFn) {

    base.clearBox();
    base.switchTo21Layout();
    layout.showMainView();

    $('#mainTitle').show();

    data.pathwayId = pathwayId;

    teamActionPlan.show(farRightPanel);
    indicator.create(topRightPanel, pathwayId, pathwayStage, standard, tab, loadContentFn);

    base.wireUpTooltips();

  }

};

module.exports = ind;
