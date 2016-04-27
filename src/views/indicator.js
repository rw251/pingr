var base = require('../base.js'),
  data = require('../data.js'),
  patientList = require('../panels/patientList.js'),
  indicatorBreakdown = require('../panels/indicatorBreakdown.js'),
  indicatorBenchmark = require('../panels/indicatorBenchmark.js'),
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

    base.selectTab("indicator");

    $('.loading-container').show();

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      //base.switchTo21Layout();
      layout.showMainView();

      base.hidePanels(farRightPanel);

      layout.view = ID;
    }

    if(!pathwayId) {
      if(layout.pathwayId) pathwayId = layout.pathwayId;
      else pathwayId = Object.keys(data.pathwayNames)[0];
    }

    if(!pathwayStage){
      if(layout.pathwayStage) pathwayStage = layout.pathwayStage;
      else pathwayStage = "monitoring";
    }

    if(!standard){
      if(layout.standard) standard = layout.standard;
      else standard = Object.keys(data[pathwayId][pathwayStage].standards)[0];
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

    layout.pathwayId = pathwayId;
    layout.pathwayStage = pathwayStage;
    layout.standard = standard;

    //TODO not sure if this needs moving..?
    data.pathwayId = pathwayId;

    //The three panels we need to show
    //Panels decide whether they need to redraw themselves
    teamActionPlan.show(farLeftPanel);

    base.updateTab("indicators", [pathwayId.toUpperCase(), standard.toUpperCase()].join(" "), [pathwayId, pathwayStage, standard].join("/"));

    indicatorBreakdown.show(farRightPanel,false,pathwayId, pathwayStage, standard,patientList.selectSubsection);
    patientList.show(farRightPanel, true, pathwayId, pathwayStage, standard, loadContentFn);
    indicatorTrend.show(farRightPanel, true, pathwayId, pathwayStage, standard);
    indicatorBenchmark.show(farRightPanel, true, pathwayId, pathwayStage, standard);

    $('#indicator-pane').show();

    base.wireUpTooltips();

    $('.loading-container').fadeOut(1000);
  }

};

module.exports = ind;
