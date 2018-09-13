const base = require('../base');
const data = require('../data');
const layout = require('../layout');
const lookup = require('../lookup');
const state = require('../state');
const indicatorList = require('../panels/indicatorList');
const teamActionPlan = require('../panels/teamActionPlan');

const ID = 'OVERVIEW';
/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
const overview = {
  create(loadContentFn, callback) {
    lookup.suggestionModalText = 'Screen: Overview\n===========\n';

    base.selectTab('overview');
    base.showLoading();

    // use a setTimeout to force the UI to change e.g. show the loading-container
    // before further execution
    setTimeout(() => {
      const practiceName = state.selectedPractice.name;

      if (layout.view !== ID) {
        // Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        $('#mainTitle').show();
        let title = `Overview of ${practiceName}'s performance`;
        if (state.practices && state.practices.length > 1) {
          title = `Performance overview of <select class='practice-picker'>${state.practices.map(v =>
            `<option value="${
              v._id
            }" ${
              v._id === state.selectedPractice._id ? 'selected' : ''
            } >${
              v.name
            }</option>`)}</select>`;
        }
        base.updateTitle(title);

        base.hidePanels(base.farRightPanel);

        layout.view = ID;
      }

      data.pathwayId = 'htn'; // TODO fudge

      // The two panels we need to show
      // Panels decide whether they need to redraw themselves
      teamActionPlan.show(
        base.farLeftPanel,
        `Top 3 suggested actions for ${practiceName}`
      );
      indicatorList.show(base.farRightPanel, false, loadContentFn);

      $('#overview-pane').show();

      base.wireUpTooltips();

      state.rememberTabs('overview');

      base.hideLoading();

      // add state indicator
      base.farRightPanel.attr(
        'class',
        'col-lg-8 state-overview-rightPanel'
      );

      // base.updateFixedHeightElements([
      //   { selector: '#personalPlanTeam', padding: 820, minHeight: 200 },
      //   { selector: '#advice-list', padding: 430, minHeight: 250 },
      // ]); // ,{selector:'.table-scroll',padding:250, minHeight:300}]);

      if (callback) return callback();
    }, 0);
  },
};

module.exports = overview;
