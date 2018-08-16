const base = require('../base');
const data = require('../data');
const state = require('../state');
const patientList = require('../panels/patientList');
const indicatorBreakdown = require('../panels/indicatorBreakdown');
const indicatorBenchmark = require('../panels/indicatorBenchmark');
const indicatorTrend = require('../panels/indicatorTrend');
const indicatorHeadlines = require('../panels/indicatorHeadlines');
const teamActionPlan = require('../panels/teamActionPlan');
const wrapper = require('../panels/wrapper');
const layout = require('../layout');
const lookup = require('../lookup');

const ID = 'INDICATOR';
/*
 * The indicator page consists of the panels:
 *   Tabbed panel
 *     - performance trend
 *     - performance benchmark
 *   Patient groups
 *   Patient list
 *   Team action plan
 */

const dflt = {
  pathwayId() {
    return layout.pathwayId || Object.keys(data.text.pathways)[0];
  },
  pathwayStage(pathwayId) {
    return layout.pathwayStage || Object.keys(data.text.pathways[pathwayId])[0];
  },
  standard(pathwayId, pathwayStage) {
    return layout.standard || Object.keys(data.text.pathways[pathwayId][pathwayStage].standards)[0];
  },
};

const ind = {
  create(
    pathwayId = dflt.pathwayId(),
    pathwayStage = dflt.pathwayStage(pathwayId),
    standard = dflt.standard(pathwayId, pathwayStage),
    tab,
    loadContentFn
  ) {
    base.selectTab('indicator');
    base.showLoading();

    // use a setTimeout to force the UI to change e.g. show the loading-container
    // before further execution
    setTimeout(() => {
      if (layout.view !== ID) {
        // Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        base.hidePanels(base.farRightPanel);

        layout.view = ID;
      }

      // if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage) {
      // different pathway or stage so title needs updating
      base.updateTitle(data.text.pathways[pathwayId][pathwayStage].standards[standard].name);
      lookup.suggestionModalText =
        `Screen: Indicator\nIndicator: ${
          data.text.pathways[pathwayId][pathwayStage].standards[standard].name
        }\n===========\n`;

      const nothingChanged =
        layout.pathwayId === pathwayId &&
        layout.pathwayStage === pathwayStage &&
        layout.standard === standard &&
        layout.practiceId === state.selectedPractice._id;

      layout.pathwayId = pathwayId;
      layout.pathwayStage = pathwayStage;
      layout.standard = standard;
      layout.practiceId = state.selectedPractice._id;

      // TODO not sure if this needs moving..?
      data.pathwayId = pathwayId;

      // The three panels we need to show
      // Panels decide whether they need to redraw themselves
      // *B* insect this and make sure its not redundant
      teamActionPlan.show(
        base.farLeftPanel,
        `Top 3 suggested actions for ${
          data.text.pathways[pathwayId][pathwayStage].standards[standard].name}`,
        pathwayId,
        pathwayStage,
        standard
      );

      base.updateTab(
        'indicators',
        data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText,
        [pathwayId, pathwayStage, standard].join('/')
      );

      // check state cache (stateMaintainance)
      // RW - added the nothingChanged variable so that this state management
      // is only invoked if the pathway/stage/standard are the same
      // Was leading to a bug where the wrong indicator data was displayed
      const indicatorCachedState = $('#stateM-indicator').children();
      base.savePanelState();
      if (nothingChanged && indicatorCachedState.length > 0) {
        base.farRightPanel.html(indicatorCachedState);
        patientList.restoreFromState();
      }

      // if not presently loaded
      // RW - added the not selector to prevent a blank page appearing in some edge cases
      if (
        $('#mainPage-tabs').not('#stateM-indicator #mainPage-tabs').length < 1
      ) {
        const tabList = $('<ul id="mainPage-tabs" class="nav nav-tabs"></ul>');
        const tabContent = $('<div id="mainPage-tab-content"></div>');
        base.farRightPanel.append(tabList);
        base.farRightPanel.append(tabContent);

        // *B* 1st tabbed panel
        wrapper.showTab(
          tabContent,
          tabList,
          'Improvement opportunities',
          'A summary of all the relevant information',
          'Overview',
          [
            {
              show: indicatorHeadlines.show,
              args: [pathwayId, pathwayStage, standard],
              // args: [pathwayId, pathways, standard]
            },
            {
              show: indicatorBreakdown.show,
              args: [
                pathwayId,
                pathwayStage,
                standard,
                patientList.selectSubsection,
              ],
            },
            {
              show: patientList.show,
              args: [pathwayId, pathwayStage, standard, loadContentFn],
            },
          ],
          true
        );

        // *B* 2nd tabbed panel
        wrapper.showTab(
          tabContent,
          tabList,
          'Current and future trend',
          'A table to show indication information - descrition to be updated',
          'indicator',
          [
            {
              show: indicatorTrend.show,
              args: [pathwayId, pathwayStage, standard],
            },
          ],
          false
        );

        // *B* 3rd tabbed panel
        wrapper.showTab(
          tabContent,
          tabList,
          'Comparison to other practices',
          'A graph that illustrates where you are amongst other practicese in Salford',
          'patient',
          [
            {
              show: indicatorBenchmark.show,
              args: [pathwayId, pathwayStage, standard],
            },
          ],
          false
        );

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
        // setup tab buttons
        wrapper.wireUp(patientList.restoreFromState);
      } else {
        // reload active tab
        $('#mainPage-tabs li.active a').click();
      }

      // Update the performance bit
      const indicatorData = data.processIndicatorsRemoveExcludedPatients(data.indicators.filter(v => v.id === [pathwayId, pathwayStage, standard].join('.')));
      const iPercentage = $('#iPercentage').text();
      if (
        indicatorData.length > 0 &&
        `${indicatorData[0].performance.percentage}%` !== iPercentage
      ) {
        $('#iPercentage').text(`${indicatorData[0].performance.percentage}%`);
        $('#iFraction').text(indicatorData[0].performance.fraction);
      }

      $('#mainPage-tabs').show();

      base.wireUpTooltips();

      /* setTimeout($('.fp-controlArrow').each(function(idx, el) {
        if(el.is(":visible"))
      }), 2000); */

      base.hideLoading();

      // add state indicator
      base.farRightPanel.attr(
        'class',
        'col-xl-8 col-lg-8 state-indicator-rightPanel'
      );

      base.updateFixedHeightElements([
        { selector: '#right-panel', padding: 15, minHeight: 300 },
        /* { selector: '.table-scroll', padding: 200, minHeight:170 }, */ {
          selector: '#personalPlanTeam',
          padding: 820,
          minHeight: 200,
        },
        { selector: '#advice-list', padding: 430, minHeight: 250 },
      ]);
    }, 0);
  },
};

module.exports = ind;
