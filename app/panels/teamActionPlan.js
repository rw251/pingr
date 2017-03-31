var base = require('../base.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  actionPlan = require('./actionPlan.js');

var teamActions = [];

var tap = {

  create: function(title) {
    return require("templates/team-action-plan")({ title: title });
  },

  show: function(panel, title, pathwayId, pathwayStage, standard) {
    panel.html(tap.create(title));
    tap.wireUp(pathwayId, pathwayStage, standard);
    $('.ps-child').perfectScrollbar();
  },

  updateAction: function(action) {
    buttonContainer = $('#advice-header');
    //Use actionTextId to find the right row
    //var yesbox = teamTab.find('tr[data-id="' + action.actionTextId + '"] label.btn-yes input');
    //var nobox = teamTab.find('tr[data-id="' + action.actionTextId + '"] label.btn-no input');
    var yesbox = buttonContainer.find('li[data-id="' + action.actionTextId + '"] label.btn-yes input');
    var nobox = buttonContainer.find('li[data-id="' + action.actionTextId + '"] label.btn-no input');

    //checked action inactive
    if (action.agree === true) {
      yesbox.each(function() { this.checked = true; });
      yesbox.parent().removeClass("inactive").addClass("active");
      nobox.each(function() { this.checked = false; });
      nobox.parent().removeClass("active").addClass("inactive");
    } else if (action.agree === false) {
      nobox.each(function() { this.checked = true; });
      nobox.parent().removeClass("inactive").addClass("active");
      yesbox.each(function() { this.checked = false; });
      yesbox.parent().removeClass("active").addClass("inactive");
    } else {
      yesbox.each(function() { this.checked = false; });
      yesbox.parent().removeClass("active inactive");
      nobox.each(function() { this.checked = false; });
      nobox.parent().removeClass("active inactive");
    }

    yesbox.closest('li').data('agree', action.agree);

    tap.updateTeamSapRows();
  },

  wireUp: function(pathwayId, pathwayStage, standard) {
    //BG-TODO-NEO hotfix implemented needs to be tided into one OR two cards (personalPlanTeam -> team-action-panel | user-action-panel)
    // actionPanel = $('#team-action-panel');
    // userActionPanel = $('#user-action-panel');

    //actionPanelTeam = $('#personalPlanTeam');
    //userActionPanelTeam = $('#left-panel');

    actionCard = $('#teamActionCard');
    suggestionCard = $('#teamSuggestionCard');
    suggestionListCard = $('#teamSuggestionListCard');

    var indicatorId = "";
    if (pathwayId && pathwayStage && standard) indicatorId = [pathwayId, pathwayStage, standard].join(".");

    //suggestion list controls
    suggestionListCard.on('click', '.edit-plan', function() {
      var action = userDefinedTeamActionsObject[$(this).closest('tr').data("id")];

      $('#editActionPlanItem').val(action.actionText);

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {
        var oldActionId = action.actionTextId;
        action.actionText = $('#editActionPlanItem').val();
        action.actionTextId = action.actionText.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (action.actionTextId !== oldActionId) {
          log.updateUserDefinedTeamAction(oldActionId, action);
          delete userDefinedTeamActionsObject[oldActionId];
          if (!userDefinedTeamActionsObject[action.actionTextId]) userDefinedTeamActionsObject[action.actionTextId] = action;
          tap.updateAction(action);
        }
        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var action = userDefinedTeamActionsObject[$(this).closest('tr').data("id")];

      $('#modal-delete-item').html(action.actionText);

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        log.deleteUserDefinedTeamAction(action.actionTextId);
        delete userDefinedTeamActionsObject[action.actionTextId];

        $('#deletePlan').modal('hide');
      }).modal();
    });

    // //suggestion addition control
    // suggestionCard.on('click', '.add-plan', function() {
    //   //var actionText = $(this).parent().parent().find('textarea').val();
    //   var actionText = $('textarea.form-control').val();
    //   $('textarea.form-control').val("");
    //   var actionTextId = actionText.toLowerCase().replace(/[^a-z0-9]/g,"");
    //   log.recordTeamPlan(actionText, indicatorId, function(err, a){
    //     if(!userDefinedTeamActionsObject[actionTextId]) userDefinedTeamActionsObject[actionTextId]=a;
    //     //BG-TODO-NOTED below line left in after dev merge
    //     //we now redraw the panel instead of manually inserting
    //     tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
    //   });
    // }).on('keyup', 'input[type=text]', function(e) {
    //   if (e.which === 13) {
    //     suggestionListCard.find('.add-plan').click();
    //   }
    // }).on('change', '.btn-toggle input[type=checkbox]', function() {
    //   //tap.updateTeamSapRows();
    // }).on('click', '.btn-undo', function(e) {
    //
    // });

    //action buttons
    actionCard.on('click', '.btn-yes', function(e) {
      //var AGREE_STATUS = $(this).closest('tr').data('agree');
      //var action = teamActionsObject[$(this).closest('tr').data('id')];
      var AGREE_STATUS = $(this).closest('li').data('agree');
      var action = teamActionsObject[$(this).closest('li').data('id')];

      action.agree = AGREE_STATUS ? null : true;
      if (action.agree) {
        if (!action.history) action.history = [];
        action.history.unshift({ who: $('#user_fullname').text().trim(), what: "agreed with", when: new Date() });
      }
      log.updateTeamAction(indicatorId, action);
      tap.updateAction(action);

      e.stopPropagation();
      e.preventDefault();
    }).on('click', '.btn-no', function(e) {
      //var AGREE_STATUS = $(this).closest('tr').data('agree');
      //var action = teamActionsObject[$(this).closest('tr').data('id')];

      var AGREE_STATUS = $(this).closest('li').data('agree');
      var action = teamActionsObject[$(this).closest('li').data('id')];

      if (AGREE_STATUS === false) {
        //editing reason
        tap.launchModal(data.selected, action.actionText, action.rejectedReason, action.rejectedReasonText, true, function() {
          if (!action.history) action.history = [];
          action.history.unshift({ who: $('#user_fullname').text().trim(), what: "disagreed with", when: new Date(), why: actionPlan.rejectedReasonText });
          action.agree = false;
          action.rejectedReason = actionPlan.rejectedReason;
          action.rejectedReasonText = actionPlan.rejectedReasonText;
          log.updateTeamAction(indicatorId, action);
          tap.updateAction(action);
        }, null, function() {
          action.agree = null;
          delete action.rejectedReason;
          delete action.rejectedReasonText;
          log.updateTeamAction(indicatorId, action);
          tap.updateAction(action);
        });
        e.stopPropagation();
        e.preventDefault();
      } else {
        //disagreeing
        tap.launchModal(data.selected, action.actionText, action.rejectedReason, action.rejectedReasonText, false, function() {
          if (!action.history) action.history = [];
          action.history.unshift({ who: $('#user_fullname').text().trim(), what: "disagreed with", when: new Date(), why: actionPlan.rejectedReasonText });
          action.agree = false;
          action.rejectedReason = actionPlan.rejectedReason;
          action.rejectedReasonText = actionPlan.rejectedReasonText;
          log.updateTeamAction(indicatorId, action);
          tap.updateAction(action);
        });
        e.stopPropagation();
        e.preventDefault();
      }
    });

    $('#advice-list').off('click', '.show-more-than-3');
    $('#advice-list').on('click', '.show-more-than-3', function(e) {
      tap.populateTeamSuggestedActions(pathwayId, pathwayStage, standard, true);
    });

    $('#advice-list').off('click', '.show-less-than-3');
    $('#advice-list').on('click', '.show-less-than-3', function(e) {
      tap.populateTeamSuggestedActions(pathwayId, pathwayStage, standard, false);
    });

    $('#advice-list').off('click', '.show-more');
    $('#advice-list').on('click', '.show-more', function(e) {
      var id = $(this).data("id");
      var elem = $('.show-more-row[data-id="' + id + '"]');
      if (elem.is(':visible')) {
        $('.show-more[data-id="' + id + '"]:first').show();
        elem.hide();
      } else {
        $('.show-more-row').hide();
        $('.show-more').show();
        $(this).hide();
        elem.show('fast');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    //*B* ??edit this to handle the show more or less actions
    $('#advice-list').off('click', 'tr.show-more-row a:not(.show-more)');
    $('#advice-list').on('click', 'tr.show-more-row a:not(.show-more)', function(e) {
      log.event("nice-link-clicked", window.location.hash, [{ key: "link", value: e.currentTarget.href }]);
      e.stopPropagation();
    });

    tap.loadAndPopulateIndividualSuggestedActions(pathwayId, pathwayStage, standard, false);
  },

  updateTeamSapRows: function() {
    //FUNCTION OBJECTIVE
    //indicate the confirmation, indifference or declination of the user towards this action
    //
    //user agrees - agree button highlights, disagree button lowlight
    //user indifferent - both buttons visible but faded
    //user disagree - agree button highlights, disagree button lowlight

    $('#advice-list').add('#personalPlanTeam').find('li.suggestion').each(function() {
      var self = $(this);
      var id = self.data("id");
      var all = $('.show-more-row[data-id="' + id + '"],.suggestion[data-id="' + id + '"]');
      var any = false;
      //if any button is selected...
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        //set the tooltip
        any = true;

        //if there is a history - display appropriate title
        if (teamActionsObject[self.data("id")].history != "") {
          var tooltipInfo = "<p>" + base.textFromHistory(teamActionsObject[self.data("id")].history[0]) + "</p><p>Click again to cancel</p>";
          $(this).closest('label').attr("title", tooltipInfo).attr("data-original-title", tooltipInfo).attr("data-html", "true").tooltip('fixTitle').tooltip('hide');
        }
        //if no history but selected is affirmative
        else if (this.value === "yes") {
          $(this).closest('label').attr("title", "You agreed with this - click again to cancel").tooltip('fixTitle').tooltip('hide');
        }
        //if no history but selected is negative
        else {
          $(this).closest('label').attr("title", "You disagreed with this - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
//BG-TODO-DONE incorporate the base.textFromHistory to populate tooltip

// =======
//         if (this.value === "yes") {
//           all.removeClass('danger');
//           all.addClass('active');
//           //self.find('td').last().children().show();
//           if (teamActionsObject[self.data("id")].history) {
//             var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + base.textFromHistory(teamActionsObject[self.data("id")].history[0]) + "</p><p>Click again to cancel</p>";
//             $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
//           } else {
//             $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
//           }
//         } else {
//           all.removeClass('active');
//           all.addClass('danger');
//           all.removeClass('success');
//           if (teamActionsObject[self.data("id")].history) {
//             $(this).parent().attr("title", "<p>" + base.textFromHistory(teamActionsObject[self.data("id")].history[0]) + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
//           } else {
//             $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
//           }
// >>>>>>> dev
        }
      });
      //if only one button is selected
      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        //demote the non-selected button
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive btn-simple indifferent-select").attr("title", "").attr("data-original-title", "").attr("data-html", "true").tooltip('fixTitle').tooltip('hide');
        //promote the selected button
        self.find('.btn-toggle input[type=checkbox]:checked').parent().removeClass("btn-simple indifferent-select");
      }
      else {
        //if both buttons are not selected make sure they are set to appropriate presentation
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().removeClass("btn-simple inactive").addClass("indifferent-select");
      }
      //   //if there is a history - display appropriate title
      //   if (this.value === "yes") {
      //     all.removeClass('danger');
      //     all.addClass('active');
      //     //self.find('td').last().children().show();
      //
      //     //*b*original didn't appear to appropriately discriminate
      //     //if (teamActionsObject[self.data("id")].history) {
      //     if (teamActionsObject[self.data("id")].history != "") {
      //       var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + teamActionsObject[self.data("id")].history[0].replace($('#user_fullname').text().trim(),"You") + "</p><p>Click again to cancel</p>";
      //       $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
      //     } else {
      //       $(this).parent().attr("title", "You agreed with this - click again to cancel").tooltip('fixTitle').tooltip('hide');
      //     }
      //   } else {
      //     all.removeClass('active');
      //     all.addClass('danger');
      //     all.removeClass('success');
      //     if (teamActionsObject[self.data("id")].history != "") {
      //       $(this).parent().attr("title", "<p>" + teamActionsObject[self.data("id")].history[0].replace($('#user_fullname').text().trim(),"You") + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
      //     } else {
      //       $(this).parent().attr("title", "You disagreed with this - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
      //     }
      //   }
      // });
      // if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
      //   self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      // }
      if (!any) {
        // all.removeClass('danger');
        // all.removeClass('active');
        // all.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      //base.wireUpTooltips();
    });
    base.wireUpTooltips();
  },

  displayPersonalisedTeamActionPlan: function(parentElem) {
    var tmpl = require('templates/action-plan-list');
    var userDefinedTeamActions = Object.keys(userDefinedTeamActionsObject).map(function(v) { return userDefinedTeamActionsObject[v]; });
    parentElem.html(tmpl({
      "hasSuggestions": userDefinedTeamActions && userDefinedTeamActions.length > 0,
      "suggestions": userDefinedTeamActions
    }));

    tap.updateTeamSapRows();
  },

  loadAndPopulateIndividualSuggestedActions: function(pathwayId, pathwayStage, standard, visible) {
    data.getTeamActionData(pathwayId && pathwayStage && standard ? [pathwayId, pathwayStage, standard].join(".") : "", function(err, a) {
      teamActionsObject = {};
      userDefinedTeamActionsObject = {};
      a.userDefinedActions.forEach(function(v) {
        userDefinedTeamActionsObject[v.actionTextId] = v;
      });
      teamActions = a.actions.map(function(v) {
        v.indicatorListText = v.indicatorList.map(function(vv) {
          return { id: vv, text: data.text.pathways[vv.split(".")[0]][vv.split(".")[1]].standards[vv.split(".")[2]].tabText };
        });
        if (v.agree !== true && v.agree !== false) v.agree = null;
        teamActionsObject[v.actionTextId] = v;

        //save a clean version that removes all html from injected text
        var tmp = v.actionText.search("<");
        var tmpStr = v.actionText;
        while(tmp >= 0)
        {
          var openIndex = tmp;
          var closeIndex = tmpStr.search(">")
          tmpStr = tmpStr.replace(tmpStr.substring(openIndex, closeIndex+1), "");
          var tmp = tmpStr.search("<");
        }
        v.actionTextClean = tmpStr;

        return v;
      });
      tap.populateTeamSuggestedActions(pathwayId, pathwayStage, standard, visible);
    });
  },

  populateTeamSuggestedActions: function(pathwayId, pathwayStage, standard, visible) {
    var localData = {
      visible: visible
    };
    var fn = function(val) {
      return {
        "id": val,
        "subsection": subsection
      };
    };

    if (teamActions.length === 0) {
      localData.noSuggestions = true;
    } else {
      localData.suggestions = teamActions;
    }

    $('#advice').show();

    //base.createPanelShow(teamPanel, $('#advice-list'), localData);
    var tmpl = require("templates/team");
    $('#advice-list').html(tmpl(localData));

    //Wire up any clipboard stuff in the suggestions
    var isVision = $('#practice_system').text() === "Vision";
    $('#advice-list').find('span:contains("[COPY")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[COPY:([^\]\.]*)(\.*)\]/g, (isVision ? '#$1$2' : '$1') + ' <button type="button" data-clipboard-text="' + (isVision ? '#$1$2' : '$1') + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + $('#practice_system').text() + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ' + (isVision ? '#$1$2' : '$1') + ' to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });
    $('#advice-list').find('span:contains("[")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[([^\]\.]*)(\.*)\]/g, ' <button type="button" data-clipboard-text="' + (isVision ? '#$1$2' : '$1') + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + $('#practice_system').text() + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ' + (isVision ? '#$1$2' : '$1') + ' to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });
    $('#advice-list').find('li:contains("[")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[([^\]\.]*)(\.*)\]/g, ' <button type="button" data-clipboard-text="' + (isVision ? '#$1$2' : '$1') + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + $('#practice_system').text() + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ' + (isVision ? '#$1$2' : '$1') + ' to clipboard." class="btn btn-xs btn-round btn-default btn-copy"><span class="material-icons">content_copy</span></button>'));
    });

    $('#advice-list').find('span:contains("[INFO")').each(function() {
      var html = $(this).html();
      var subsection = $(this).data().subsection;
      var desc = data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
          return val.name === subsection;
        }).length > 0 ?
        data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].desc : subsection;
      var tooltip = subsection ? "This action is suggested because PINGR classified this indcicator as:'" + desc + "'" : '';
      var newHtml = ' <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="' + tooltip + '"></i>';
      $(this).html(html.replace(/\[INFO\]/g, newHtml));
    });
    //*b* I presume this can go?? - seemingly suggsting random cardiac medication?!
    $('#advice-list').find('span:contains("[MED-SUGGESTION")').each(function() {
      var html = $(this).html();
      var suggestion = Math.random() < 0.33 ? "Increase Ramipril to 10mg per day" : (Math.random() < 0.5 ? "Consider adding an ACE inhibior" : "Consider adding a thiazide-like diuretic");
      $(this).html(html.replace(/\[MED\-SUGGESTION\]/g, suggestion));
    });

    $('#advice-list').find('li:contains("Reasoning")').each(function() {
      var contents = $(this).contents();
      var i = 0;
      while ($(contents[i]).text() !== "Reasoning" && i < contents.length) {
        i++;
      }
      if (i < contents.length - 1) {
        var reasoning = $(contents[i]);
        var content = "Reasoning\r\n" + $(contents[i + 1]).html()
          .replace(/ +/g, " ")
          .replace(/<li>/g, "  - ")
          .replace(/<\/li>/g, "\r\n")
          .replace(/<\/?strong>/g, "")
          .replace(/&gte;/g, "≥")
          .replace(/&lte;/g, "≤")
          .replace(/&gt;/g, ">")
          .replace(/&lt;/g, "<")
          .replace(/<a.+href=["']([^"']+)["'].*>([^<]+)<\/a>/g, "$2 - $1");
        reasoning.replaceWith('Reasoning <button type="button" data-clipboard-text="' + content + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + $('#practice_system').text() + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy reasoning to clipboard." class="btn btn-xs btn-round btn-default btn-copy"><span class="material-icons">content_copy</span></button>');
      }
    });

    base.setupClipboard($('.btn-copy'), true);

    tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));

    $('.ps-child').perfectScrollbar();
  },

  launchModal: function(label, value, rejectedReason, rejectedReasonText, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var reasons = [{
      "reason": "We've already done this",
      "value": "done"
    }, {
      "reason": "It wouldn't work",
      "value": "nowork"
    }, {
      "reason": "Other",
      "value": "else"
    }];
    if (rejectedReason) {
      for (var i = 0; i < reasons.length; i++) {
        if (reasons[i].reason === rejectedReason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    actionPlan.launchModal({
      "header": "Disagree with a suggested action",
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Enter free-text here...",
      "reasons": reasons
    }, label, value, rejectedReasonText || null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  }

};

module.exports = tap;
