var base = require('../base'),
  data = require('../data'),
  patientList = require('../panels/patientList'),
  indicatorBreakdown = require('../panels/indicatorBreakdown'),
  indicatorBenchmark = require('../panels/indicatorBenchmark'),
  indicatorTrend = require('../panels/indicatorTrend'),
  indicatorHeadlines = require('../panels/indicatorHeadlines'),
  teamActionPlan = require('../panels/teamActionPlan'),
  wrapper = require('../panels/wrapper'),
  layout = require('../layout'),
  lookup = require('../lookup');

var ID = "INDICATORBE";
/*
 * The indicator page consists of the panels:
 *   Tabbed panel
 *     - performance trend
 *     - performance benchmark
 *   Patient groups
 *   Patient list
 *   Team action plan
 */

var ind_be = {

  create: function(pathwayId, pathwayStage, standard, tab, loadContentFn) {

    base.selectTab("indicatorBE");
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
      lookup.suggestionModalText="Screen: Indicator\nIndicator: " + data.text.pathways[pathwayId][pathwayStage].standards[standard].name + "\n===========\n";
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

      base.updateTab("indicatorsBe", data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText, [pathwayId, pathwayStage, standard].join("/"));

	  // *B* 1st section in right panel
      wrapper.show(farRightPanel, false, [
        {
          show: indicatorHeadlines.show,
          args: [pathwayId, pathwayStage, standard]
          //args: [pathwayId, pathways, standard]
        }, {
          show: indicatorBreakdown.show,
          args: [pathwayId, pathwayStage, standard, patientList.selectSubsection]
        }, {
          show: patientList.show,
          args: [pathwayId, pathwayStage, standard, loadContentFn]
        }
      ], "Performance over time", false);

	  // *B* 2nd section in right panel
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorTrend.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], "Benchmarking", "Patients at risk");

	  // *B* 3rd section in right panel
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorBenchmark.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], false, "Performance over time");

      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css">.table-scroll {max-height:170px;}');
      }

      base.addFullPage(farRightPanel);
      /*console.log("WINDOW HEIGHT: " + $(window).height());
      console.log("TABLE TOP: " + $('.table-scroll').position().top);
      console.log("CSS: " + Math.floor($(window).height()-$('.table-scroll').position().top-200)+"px");*/
      $('#addedCSS').text('.table-scroll {max-height:' + Math.floor($(window).height() - $('.table-scroll').position().top - 200) + 'px;}');

      $(window).off('resize').on('resize', function() {
        var win = $(this); //this = window
        $('#addedCSS').text('.table-scroll {max-height:' + Math.floor(win.height() - $('.table-scroll').position().top - 200) + 'px;}');
      });

      $('#indicatorBe-pane').show();


      base.wireUpTooltips();

      /*setTimeout($('.fp-controlArrow').each(function(idx, el) {
        if(el.is(":visible"))
      }), 2000);*/

      base.hideLoading();
    }, 0);
  }

};

module.exports = ind_be;
