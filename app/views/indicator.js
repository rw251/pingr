var base = require('../base'),
  data = require('../data'),
  patientList = require('../panels/patientList'),
  indicatorBreakdown = require('../panels/indicatorBreakdown'),
  indicatorBenchmark = require('../panels/indicatorBenchmark'),
  indicatorTrend = require('../panels/indicatorTrend'),
  indicatorHeadlines = require('../panels/indicatorHeadlines'),
  teamActionPlan = require('../panels/teamActionPlan'),
  wrapper = require('../panels/wrapper'),
  layout = require('../layout');

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
    base.showLoading();

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
        else pathwayStage = Object.keys(data.text.pathways[pathwayId])[0];
      }

      if (!standard) {
        if (layout.standard) standard = layout.standard;
        else standard = Object.keys(data.text.pathways[pathwayId][pathwayStage].standards)[0];
      }

      //if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage) {
        //different pathway or stage so title needs updating
        base.updateTitle(data.text.pathways[pathwayId][pathwayStage].standards[standard].name);
        /*base.updateTitle([{
          title: "Overview",
          url: "#overview"
        }, {
          title: data.text.pathways[pathwayId][pathwayStage].text.page.text,
          tooltip: data.text.pathways[pathwayId][pathwayStage].text.page.tooltip
        }]);
        $('#mainTitle').show();*/
      //}

      layout.pathwayId = pathwayId;
      layout.pathwayStage = pathwayStage;
      layout.standard = standard;

      //TODO not sure if this needs moving..?
      data.pathwayId = pathwayId;

      //The three panels we need to show
      //Panels decide whether they need to redraw themselves
      teamActionPlan.show(farLeftPanel);

      base.updateTab("indicators", data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText, [pathwayId, pathwayStage, standard].join("/"));

      wrapper.show(farRightPanel, false, [
        {
          show: indicatorHeadlines.show,
          args: [pathwayId, pathwayStage, standard]
        }, {
          show: indicatorBreakdown.show,
          args: [pathwayId, pathwayStage, standard, patientList.selectSubsection]
        }, {
          show: patientList.show,
          args: [pathwayId, pathwayStage, standard, loadContentFn]
        }
      ], "Performance over time", false);
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorTrend.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], "Benchmarking", "Patients at risk");
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorBenchmark.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], false, "Performance over time");

      base.addFullPage(farRightPanel);

      $('#indicator-pane').show();

      base.wireUpTooltips();

      /*setTimeout($('.fp-controlArrow').each(function(idx, el) {
        if(el.is(":visible"))
      }), 2000);*/

      base.hideLoading();
    }, 0);
  }

};

module.exports = ind;
