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
  lookup = require('../lookup'),
  log = require('../log');

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
  //taken from overview to handle title and control cards, and own suggestions
  //including minor edit for this context
  updateTab: function(dontClearRight) {
    var titleTmpl = require("templates/indicator-title");
    base.updateTitle(titleTmpl({}), dontClearRight);

    teamAdditionTab = $('#tab-plan-team-addition');

    teamAdditionTab.on('click', '.add-plan', function() {
      //var actionText = $(this).parent().parent().find('textarea').val();
      var actionText = $('textarea.form-control').val();
      $('textarea.form-control').val("");
      var actionTextId = actionText.toLowerCase().replace(/[^a-z0-9]/g,"");
      log.recordTeamPlan(actionText, null, function(err, a){
        if(!userDefinedTeamActionsObject[actionTextId]) userDefinedTeamActionsObject[actionTextId]=a;
        //BG-TODO-NOTED below line left in after dev merge
        //we now redraw the panel instead of manually inserting
        teamActionPlan.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      });
    }).on('keyup', 'input[type=text]', function(e) {
      if (e.which === 13) {
        actionPanel.find('.add-plan').click();
      }
    });
  },
  create: function(pathwayId, pathwayStage, standard, tab, loadContentFn) {

    base.selectTab("indicator");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function () {
      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      if (!pathwayId) {
        if (layout.pathwayId) pathwayId = layout.pathwayId;
        else pathwayId = Object.keys(data.text.pathways)[0];
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
      lookup.suggestionModalText = "Screen: Indicator\nIndicator: " + data.text.pathways[pathwayId][pathwayStage].standards[standard].name + "\n===========\n";

      var nothingChanged = layout.pathwayId === pathwayId && layout.pathwayStage === pathwayStage && layout.standard === standard;

      layout.pathwayId = pathwayId;
      layout.pathwayStage = pathwayStage;
      layout.standard = standard;

      //TODO not sure if this needs moving..?
      data.pathwayId = pathwayId;

      //The three panels we need to show
      //Panels decide whether they need to redraw themselves
      // *B* insect this and make sure its not redundant
      teamActionPlan.show(farLeftPanel, "List of suggested actions for " + data.text.pathways[pathwayId][pathwayStage].standards[standard].name, pathwayId, pathwayStage, standard);

      base.updateTab("indicators", data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText, [pathwayId, pathwayStage, standard].join("/"));

      //check state cache (stateMaintainance)
      //RW - added the nothingChanged variable so that this state management
      // is only invoked if the pathway/stage/standard are the same
      // Was leading to a bug where the wrong indicator data was displayed
      var indicatorCachedState = $('#stateM-indicator').children();
      base.savePanelState();
      if (nothingChanged && indicatorCachedState.length > 0) {
        farRightPanel.html(indicatorCachedState);
        patientList.restoreFromState();
      }

      //if not presently loaded
      //RW - added the not selector to prevent a blank page appearing in some edge cases
      if ($('#mainPage-tabs').not('#stateM-indicator #mainPage-tabs').length < 1) {

        var tmpl = require("../templates/indicator-data-card");
        farRightPanel.html(tmpl());
        var card = $('#indicatorDataContainer');

        var tabList = $('<ul id="mainPage-tabs" class="nav nav-tabs"></ul>');
        var tabContent = $('<div id="mainPage-tab-content"><br></div>');
        card.append(tabList);
        card.append(tabContent);

        var cardTitle = $('#cardHeaderSection');


        // *B* 1st tabbed panel *tinman*
        wrapper.show(cardTitle, true, [
          {
            show: indicatorHeadlines.show,
            args: [pathwayId, pathwayStage, standard]
            //args: [pathwayId, pathways, standard]
          }
        ]);

        wrapper.showTab(tabContent, tabList, "Improvement opportunities", "A summary of all the relevant information",  "Overview", [
          // {
          //   show: indicatorHeadlines.show,
          //   args: [pathwayId, pathwayStage, standard]
          //   //args: [pathwayId, pathways, standard]
          // },
          {
            show: indicatorBreakdown.show,
            args: [pathwayId, pathwayStage, standard, patientList.selectSubsection]
          }, {
            show: patientList.show,
            args: [pathwayId, pathwayStage, standard, loadContentFn]
          }
        ], true);

        // *B* 2nd tabbed panel
        wrapper.showTab(tabContent, tabList, "Current and future trend", "A table to show indication information - descrition to be updated", "indicator", [
          {
            show: indicatorTrend.show,
            args: [pathwayId, pathwayStage, standard]
          }
        ], false);

        // *B* 3rd tabbed panel
        wrapper.showTab(tabContent, tabList, "Comparison to other practices", "A graph that illustrates where you are amongst other practicese in Salford", "patient", [
          {
            show: indicatorBenchmark.show,
            args: [pathwayId, pathwayStage, standard]
          }
        ], false);

        /*          wrapper.showTab(tabContent, tabList, "Improvement opportunities",  "Overview", [
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
                 ], true);
        
                  // *B* 2nd tabbed panel
                  wrapper.showTab(tabContent, tabList, "Current and future trend", "indicator", [
                    {
                      show: indicatorTrend.show,
                      args: [pathwayId, pathwayStage, standard]
                    }
                  ], false);
        
                   // *B* 3rd tabbed panel
                  wrapper.showTab(tabContent, tabList, "Comparison to other practices", "patient", [
                    {
                      show: indicatorBenchmark.show,
                      args: [pathwayId, pathwayStage, standard]
                    }
                  ], false);
        */
        //setup tab buttons
        wrapper.wireUp(patientList.restoreFromState);
      }
      else {
        //reload active tab
        $('#mainPage-tabs li.active a').click();
      }

      //base.addFullPage(farRightPanel);
      /*console.log("WINDOW HEIGHT: " + $(window).height());
      console.log("TABLE TOP: " + $('.table-scroll').position().top);
      console.log("CSS: " + Math.floor($(window).height()-$('.table-scroll').position().top-200)+"px");*/
      //var win = $(this);
      //$('#addedCSS').text('.table-scroll {max-height:' + Math.floor(win.height() - $('.table-scroll').position().top - 200) + 'px;}');
      //$('#addedCSS').text('.table-scroll {max-height:' + Math.floor($(window).height() - $('.table-scroll').position().top - 200) + 'px;}');

      //$('#indicator-pane').show();


      //Update the performance bit
      var indicatorData = data.processIndicatorsRemoveExcludedPatients(data.indicators.filter(function (v) {
        return v.id === [pathwayId, pathwayStage, standard].join('.');
      }));
      var iPercentage = $('#iPercentage').text();
      if (indicatorData.length > 0 && indicatorData[0].performance.percentage + '%' !== iPercentage) {
        $('#iPercentage').text(indicatorData[0].performance.percentage + '%');
        $('#iFraction').text(indicatorData[0].performance.fraction);
      }

      $('#mainPage-tabs').show();

      base.wireUpTooltips();


      /*setTimeout($('.fp-controlArrow').each(function(idx, el) {
        if(el.is(":visible"))
      }), 2000);*/

      base.hideLoading();
      ind.updateTab(true);

      //scroll to top
      $("div").scrollTop(0);
      $('.dropdown-toggle').dropdown();
      //add state indicator
      //farRightPanel.attr("class", "col-xl-8 col-lg-8 state-indicator-rightPanel");
      //farRightPanel.attr("class", "col-xl-6 col-lg-6 state-indicator-rightPanel");
      //farLeftPanel.attr("class", "col-xl-6 col-lg-6 state-indicator-leftPanel");
      //base.updateFixedHeightElements([{ selector: '#right-panel', padding: 15, minHeight:300 }, { selector: '.table-scroll', padding: 200, minHeight:170 }, {selector:'#personalPlanTeam',padding:820, minHeight:200},{selector:'#advice-list',padding:430, minHeight:250}]);

    }, 0);
  }

};

module.exports = ind;
