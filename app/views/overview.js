var base = require('../base'),
  data = require('../data'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  state = require('../state'),
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

      var practiceName = state.selectedPractice.name;

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        $('#mainTitle').show();
        let title = `Overview of ${practiceName}'s performance`;
        if(state.practices && state.practices.length>1) {
          title = `Performance overview of <select class='practice-picker'>${state.practices.map(v=>'<option value="' + v._id + '" ' + (v._id===state.selectedPractice._id ? 'selected' : '') + ' >' + v.name + '</option>')}</select>`;
        }
        base.updateTitle(title);

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

      state.rememberTabs('overview');

      base.hideLoading();
      overview.updateTab(true);
      //scroll to top
      $("div").scrollTop(0);

      $('.dropdown-toggle').dropdown();
      //add state indicator
      //farRightPanel.attr("class", "col-xl-6 col-lg-6 state-overview-rightPanel");
      //farLeftPanel.attr("class", "col-xl-6 col-lg-6 state-overview-leftPanel");

      //base.updateFixedHeightElements([{selector:'#personalPlanTeam',padding:820, minHeight:200},{selector:'#advice-list',padding:430, minHeight:250}]);//,{selector:'.table-scroll',padding:250, minHeight:300}]);
    }, 0);

  }

};

module.exports = overview;
