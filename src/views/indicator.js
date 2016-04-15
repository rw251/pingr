var base = require('../base.js'),
  data = require('../data.js'),
  patientList = require('../panels/patientList.js'),
  indicatorBreakdown = require('../panels/indicatorBreakdown.js'),
  indicatorTrend = require('../panels/indicatorTrend.js'),
  teamActionPlan = require('../panels/teamActionPlan.js'),
  layout = require('../layout.js');

var ID = "INDICATOR";
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

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      base.switchTo21Layout();
      layout.showMainView();

      layout.view = ID;
    }

    if(layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage) {
      //different pathway or stage so title needs updating
      base.updateTitle([{
        title: "Overview",
        url: "#overview"
      }, {
        title: data[pathwayId][pathwayStage].text.page.text,
        tooltip: data[pathwayId][pathwayStage].text.page.tooltip
      }]);
      $('#mainTitle').show();
    }

    //TODO not sure if this needs moving..?
    data.pathwayId = pathwayId;

    //The three panels we need to show
    //Panels decide whether they need to redraw themselves
    teamActionPlan.show(farRightPanel);
    patientList.create(bottomRightPanel, pathwayId, pathwayStage, standard, loadContentFn);
    indicatorTrend.create(topRightPanel, pathwayId, pathwayStage, standard, tab, patientList.selectSubsection);

    base.wireUpTooltips();

  }

};

module.exports = ind;
