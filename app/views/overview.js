var base = require('../base'),
  data = require('../data'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  indicatorList = require('../panels/indicatorList'),
  teamActionPlan = require('../panels/teamActionPlan'),
  log = require('../log');

var ID = "OVERVIEW";
/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
var overview = {
  updateTab: function(dontClearRight) {
    var titleTmpl = require("templates/overview-title");
    base.updateTitle(titleTmpl({}), dontClearRight);

    suggestionCard = $('#teamSuggestionCard');

    suggestionCard.on('click', '.add-plan', function() {
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
        suggestionListCard.find('.add-plan').click();
      }
    });

    //var tabUrl = patientId;
    //if (pathwayId && pathwayStage && standard) tabUrl = [patientId, pathwayId, pathwayStage, standard].join("/");
    //base.updateTab("patients", patid, tabUrl);
  },
  create: function(loadContentFn) {

    lookup.suggestionModalText = "Screen: Overview\n===========\n";

    base.selectTab("overview");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      var practiceName = $('#practice_name').text();

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        $('#mainTitle').show();
        base.updateTitle("Overview of " + practiceName + "'s performance");

        //base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      data.pathwayId = "htn";

      //The two panels we need to show
      //Panels decide whether they need to redraw themselves
      teamActionPlan.show(farLeftPanel, "Top 3 suggested actions for " + practiceName);
      indicatorList.show(farRightPanel, false, loadContentFn);

      $('#overview-pane').show();

      base.wireUpTooltips();

      //farRightPanel.find('div.table-scroll').getNiceScroll().remove();
      /*farRightPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });*/

      base.hideLoading();
      overview.updateTab(true);
      //scroll to top
      $("div").scrollTop(0);
      //add state indicator
      //farRightPanel.attr("class", "col-xl-6 col-lg-6 state-overview-rightPanel");
      //farLeftPanel.attr("class", "col-xl-6 col-lg-6 state-overview-leftPanel");

      //base.updateFixedHeightElements([{selector:'#personalPlanTeam',padding:820, minHeight:200},{selector:'#advice-list',padding:430, minHeight:250},{selector:'.table-scroll',padding:220, minHeight:300}]);
    }, 0);

  }

};

module.exports = overview;
