var base = require('../base.js'),
  data = require('../data.js'),
  patientList = require('../panels/patientList.js'),
  indicatorBreakdown = require('../panels/indicatorBreakdown.js'),
  indicatorBenchmark = require('../panels/indicatorBenchmark.js'),
  indicatorTrend = require('../panels/indicatorTrend.js'),
  teamActionPlan = require('../panels/teamActionPlan.js'),
  wrapper = require('../panels/wrapper.js'),
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

      if (!pathwayId) {
        if (layout.pathwayId) pathwayId = layout.pathwayId;
        else pathwayId = Object.keys(data.pathwayNames)[0];
      }

      if (!pathwayStage) {
        if (layout.pathwayStage) pathwayStage = layout.pathwayStage;
        else pathwayStage = "monitoring";
      }

      if (!standard) {
        if (layout.standard) standard = layout.standard;
        else standard = Object.keys(data.text[pathwayId][pathwayStage].standards)[0];
      }

      if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage) {
        //different pathway or stage so title needs updating
        base.updateTitle([{
          title: "Overview",
          url: "#overview"
        }, {
          title: data.text[pathwayId][pathwayStage].text.page.text,
          tooltip: data.text[pathwayId][pathwayStage].text.page.tooltip
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

      wrapper.show(farRightPanel, false, [
        {
          show: indicatorBreakdown.show,
          args: [pathwayId, pathwayStage, standard, patientList.selectSubsection]
        }, {
          show: patientList.show,
          args: [pathwayId, pathwayStage, standard, loadContentFn]
        }
      ], "Scroll down or click for your performance over time", false);
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorTrend.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], "Scroll down or click for your performance benchmark", "Scroll up or click for your patients at risk");
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorBenchmark.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], false, "Scroll up or click for your performance over time");

      base.addFullPage(farRightPanel);

      $('#indicator-pane').show();

      base.wireUpTooltips();

      $('.loading-container').fadeOut(1000);
    }, 0);
  }

};

module.exports = ind;
