var base = require('../base'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  actionList = require('../panels/actionList');
//  actionFilter = require('../panels/actionFilter');

var ID = "ACTION_PLAN_VIEW";

var ap = {

  create: function() {

    base.selectTab("actions");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {
      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things - boilerplate
        base.clearBox();
        //base.switchTo21Layout();
        base.switchToSingleColumn();
        layout.showMainView();

        base.removeFullPage(farRightPanel);
        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      //base.updateTitle("Action plans");
      base.updateTitle("");

      lookup.suggestionModalText = "Screen: Action plan\n===========\n";
      //actionFilter.show(centrePanel);
      actionList.show(centrePanel);
      //individualActionPlan.show(farRightPanel, null, null, null, 4359);


      base.wireUpTooltips();
      base.hideLoading();

      //$('#suggested-actions-table-wrapper').css("overflow-y","auto");
      //$('#suggested-actions-table-wrapper').css("overflow-x","hidden");

      base.updateFixedHeightElements([{selector:'#suggested-actions-table-wrapper',padding:250}]);

    }, 0);

  }

};

module.exports = ap;
