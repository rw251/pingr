const base = require('../base');
const layout = require('../layout');
const lookup = require('../lookup');
const actionList = require('../panels/actionList');
//  actionFilter = require('../panels/actionFilter');

const ID = 'ACTION_PLAN_VIEW';

const ap = {
  create() {
    base.selectTab('actions');
    base.showLoading();

    // use a setTimeout to force the UI to change e.g. show the loading-container
    // before further execution
    setTimeout(() => {
      if (layout.view !== ID) {
        // Not already in this view so we need to rejig a few things - boilerplate
        base.clearBox();
        base.switchToSingleColumn();
        layout.showMainView();

        base.hidePanels(base.farRightPanel);

        layout.view = ID;
      }

      base.updateTitle('Action plans');

      lookup.suggestionModalText = 'Screen: Action plan\n===========\n';
      // actionFilter.show(centrePanel);
      actionList.show(base.centrePanel);
      // individualActionPlan.show(farRightPanel, null, null, null, 4359);

      base.wireUpTooltips();
      base.hideLoading();

      $('#suggested-actions-table-wrapper').css('overflow-y', 'auto');
      $('#suggested-actions-table-wrapper').css('overflow-x', 'hidden');

      base.updateFixedHeightElements([
        {
          selector: '#suggested-actions-table-wrapper',
          padding: 250,
          minHeight: 300,
        },
      ]);
    }, 0);
  },
};

module.exports = ap;
