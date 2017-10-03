var base = require('../base.js'),
  data = require('../data.js'),
  state = require('../state.js'),
  log = require('../log.js'),
  actionPlan = require('./actionPlan.js'),
  qualityStandards = require('./qualityStandards');

var patientActions = [];

var iap = {

  create: function(nhs, pathwayId, pathwayStage, standard) {
    var dataObj = { nhs: nhs };
    if (data.text.pathways[pathwayId] && data.text.pathways[pathwayId][pathwayStage] && data.text.pathways[pathwayId][pathwayStage].standards[standard]) {
      dataObj.indicator = data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText;
    } else {
      dataObj.indicator = null;
    }
    return require("templates/individual-action-plan")(dataObj);
  },

  show: function(panel, pathwayId, pathwayStage, standard, patientId) {
    panel.html(iap.create(data.getNHS(state.selectedPractice._id, patientId), pathwayId, pathwayStage, standard));
    iap.wireUp(pathwayId, pathwayStage, standard, patientId);
  },

  updateAction: function(action) {
    //Use actionTextId to find the right row
    var yesbox = actionPanel.find('tr[data-id="' + action.actionTextId + '"] label.btn-yes input');
    var nobox = actionPanel.find('tr[data-id="' + action.actionTextId + '"] label.btn-no input');
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

    yesbox.closest('tr').data('agree', action.agree);

    iap.updateIndividualSapRows();
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    actionPanel = $('#individual-action-panel');
    userActionPanel = $('#user-action-panel');

    userActionPanel.on('click', '.edit-plan', function() {
      var action = userDefinedPatientActionsObject[$(this).closest('tr').data("id")];

      $('#editActionPlanItem').val(action.actionText);

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        iap.displayPersonalisedIndividualActionPlan($('#personalPlanIndividual'), pathwayId, pathwayStage, standard);
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {
        var oldActionId = action.actionTextId;
        action.actionText = $('#editActionPlanItem').val();
        action.actionTextId = action.actionText.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (action.actionTextId !== oldActionId) {
          log.updateUserDefinedPatientAction(patientId, oldActionId, action);
          delete userDefinedPatientActionsObject[oldActionId];
          if (!userDefinedPatientActionsObject[action.actionTextId]) userDefinedPatientActionsObject[action.actionTextId] = action;
          iap.updateAction(action);
        }
        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var action = userDefinedPatientActionsObject[$(this).closest('tr').data("id")];

      $('#modal-delete-item').html(action.actionText);

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        iap.displayPersonalisedIndividualActionPlan($('#personalPlanIndividual'), pathwayId, pathwayStage, standard);
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        log.deleteUserDefinedPatientAction(patientId, action.actionTextId, function(err) {
          qualityStandards.update(patientId, pathwayId, pathwayStage, standard);
        });
        delete userDefinedPatientActionsObject[action.actionTextId];

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.add-plan', function() {
      var actionText = $(this).parent().parent().find('textarea').val();
      $(this).parent().parent().find('textarea').val("");
      var actionTextId = actionText.toLowerCase().replace(/[^a-z0-9]/g, "");
      var indicatorList = [];
      if (pathwayId && pathwayStage && standard) {
        indicatorList.push([pathwayId, pathwayStage, standard].join("."));
      } else {
        indicatorList = patientActions.reduce(function(prev, curr) {
          var union = prev.concat(curr.indicatorList);
          return union.filter(function(item, pos) {
            return union.indexOf(item) == pos;
          });
        }, []);
      }
      log.recordIndividualPlan(actionText, state.selectedPractice._id, patientId, indicatorList, function(err, a) {
        if (!userDefinedPatientActionsObject[actionTextId]) userDefinedPatientActionsObject[actionTextId] = a;
        iap.displayPersonalisedIndividualActionPlan($('#personalPlanIndividual'), pathwayId, pathwayStage, standard);
        qualityStandards.update(patientId, pathwayId, pathwayStage, standard);
      });

    }).on('keyup', 'input[type=text]', function(e) {
      if (e.which === 13) {
        actionPanel.find('.add-plan').click();
      }
    });
    actionPanel.on('change', '.btn-toggle input[type=checkbox]', function() {
      /*iap.updateIndividualSapRows();*/
    }).on('click', '.btn-undo', function(e) {

    }).on('click', '.btn-yes', function(e) {
      var AGREE_STATUS = $(this).closest('tr').data('agree');
      var action = patientActionsObject[$(this).closest('tr').data('id')];

      action.agree = AGREE_STATUS ? null : true;
      if (action.agree) {
        if (!action.history) action.history = [];
        action.history.unshift({ who: $('#user_fullname').text().trim(), what: "agreed with", when: new Date() });
      }
      log.updateIndividualAction(state.selectedPractice._id, patientId, action, function(err) {
        qualityStandards.update(patientId, pathwayId, pathwayStage, standard);
      });
      iap.updateAction(action);

      e.stopPropagation();
      e.preventDefault();
    }).on('click', '.btn-no', function(e) {
      var AGREE_STATUS = $(this).closest('tr').data('agree');
      var action = patientActionsObject[$(this).closest('tr').data('id')];

      if (AGREE_STATUS === false) {
        //editing reason
        iap.launchModal(data.selected, action.actionText, action.rejectedReason, action.rejectedReasonText, true, function() {
          if (!action.history) action.history = [];
          action.history.unshift({ who: $('#user_fullname').text().trim(), what: "disagreed with", when: new Date(), why: actionPlan.rejectedReasonText });
          action.agree = false;
          action.rejectedReason = actionPlan.rejectedReason;
          action.rejectedReasonText = actionPlan.rejectedReasonText;
          log.updateIndividualAction(state.selectedPractice._id, patientId, action, function(err) {
            qualityStandards.update(patientId, pathwayId, pathwayStage, standard);
          });
          iap.updateAction(action);
        }, null, function() {
          action.agree = null;
          delete action.rejectedReason;
          delete action.rejectedReasonText;
          log.updateIndividualAction(state.selectedPractice._id, patientId, action, function(err) {
            qualityStandards.update(patientId, pathwayId, pathwayStage, standard);
          });
          iap.updateAction(action);
        });
        e.stopPropagation();
        e.preventDefault();
      } else {
        //disagreeing
        iap.launchModal(data.selected, action.actionText, action.rejectedReason, action.rejectedReasonText, false, function() {
          if (!action.history) action.history = [];
          action.history.unshift({ who: $('#user_fullname').text().trim(), what: "disagreed with", when: new Date(), why: actionPlan.rejectedReasonText });
          action.agree = false;
          action.rejectedReason = actionPlan.rejectedReason;
          action.rejectedReasonText = actionPlan.rejectedReasonText;
          log.updateIndividualAction(state.selectedPractice._id, patientId, action, function(err) {
            qualityStandards.update(patientId, pathwayId, pathwayStage, standard);
          });
          iap.updateAction(action);
        });
        e.stopPropagation();
        e.preventDefault();
      }
    });

    $('#advice-list').off('click', '.show-more-than-3');
    $('#advice-list').on('click', '.show-more-than-3', function(e) {
      iap.populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard, true);
    });

    $('#advice-list').off('click', '.show-less-than-3');
    $('#advice-list').on('click', '.show-less-than-3', function(e) {
      iap.populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard, false);
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

    $('#advice-list').off('click', 'tr.show-more-row a:not(.show-more)');
    $('#advice-list').on('click', 'tr.show-more-row a:not(.show-more)', function(e) {
      log.event("nice-link-clicked", window.location.hash, [{ key: "link", value: e.currentTarget.href }]);
      e.stopPropagation();
    });

    iap.loadAndPopulateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard, false);
  },

  updateIndividualSapRows: function() {
    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text

    //TODO *b* inspect and amend danger and success to have more appropriate colours

    $('#advice-list').add('#personalPlanIndividual').find('tr.suggestion').each(function() {
      var self = $(this);
      var id = self.data("id");
      var all = $('.show-more-row[data-id="' + id + '"],.suggestion[data-id="' + id + '"]');
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          all.removeClass('danger');
          all.addClass('active');
          //self.find('td').last().children().show();
          if (patientActionsObject[self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + base.textFromHistory(patientActionsObject[self.data("id")].history[0]) + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          all.removeClass('active');
          all.addClass('danger');
          all.removeClass('success');
          if (patientActionsObject[self.data("id")].history) {
            $(this).parent().attr("title", "<p>" + base.textFromHistory(patientActionsObject[self.data("id")].history[0]) + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });
      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if (!any) {
        all.removeClass('danger');
        all.removeClass('active');
        all.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      //base.wireUpTooltips();
    });
    base.wireUpTooltips();
  },

  displayPersonalisedIndividualActionPlan: function(parentElem, pathwayId, pathwayStage, standard) {
    var indicatorId = null;
    if (pathwayId && pathwayStage && standard) indicatorId = [pathwayId, pathwayStage, standard].join(".");
    var tmpl = require('templates/action-plan-list');
    var userDefinedActions = Object.keys(userDefinedPatientActionsObject).map(function(v) { return userDefinedPatientActionsObject[v]; }).filter(function(v) { return !v.indicatorList || !indicatorId || v.indicatorList.indexOf(indicatorId) > -1; });
    parentElem.html(tmpl({
      "hasSuggestions": userDefinedActions && userDefinedActions.length > 0,
      "suggestions": userDefinedActions
    }));

    iap.updateIndividualSapRows();
  },

  loadAndPopulateIndividualSuggestedActions: function(patientId, pathwayId, pathwayStage, standard, visible) {
    data.getPatientActionData(state.selectedPractice._id, patientId, function(err, a) {
      patientActionsObject = {};
      userDefinedPatientActionsObject = {};
      a.userDefinedActions.forEach(function(v) {
        userDefinedPatientActionsObject[v.actionTextId] = v;
      });
      patientActions = a.actions.map(function(v) {
        v.indicatorListText = v.indicatorList.map(function(vv) {
          return { id: vv, text: data.text.pathways[vv.split(".")[0]][vv.split(".")[1]].standards[vv.split(".")[2]].tabText };
        });
        if (v.agree !== true && v.agree !== false) v.agree = null;
        patientActionsObject[v.actionTextId] = v;
        return v;
      });
      iap.populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard, visible);
    });
  },

  refresh: function(patientId, indicator){
    var b = indicator.split('.');
    iap.populateIndividualSuggestedActions(patientId, b[0], b[1], b[2], false);
  },

  populateIndividualSuggestedActions: function(patientId, pathwayId, pathwayStage, standard, visible) {
    var localData = {
      "nhsNumber": data.getNHS(state.selectedPractice._id, patientId),
      "patientId": patientId,
      visible: visible
    };

    var suggestions = patientActions.filter(function(v){
      return v.indicatorList.filter(function(vv){
        return !data.isExcluded(patientId, vv);
      }).length > 0;
    });

    if (suggestions.length === 0 || (pathwayId && pathwayStage && standard && suggestions.filter(function(v) {
        return v.indicatorList.indexOf([pathwayId, pathwayStage, standard].join(".")) > -1;
      }).length === 0)) {
      localData.noSuggestions = true;
    } else {

      localData.suggestions = suggestions;

      localData.suggestions = localData.suggestions.filter(function(v) {
        if (!pathwayId || !pathwayStage || !standard) return true;
        return v.indicatorList.indexOf([pathwayId, pathwayStage, standard].join(".")) > -1;
      });
    }

    $('#advice').show();

    //base.createPanelShow(individualPanel, $('#advice-list'), localData);
    var tmpl = require("templates/individual");
    $('#advice-list').html(tmpl(localData));

    //Wire up any clipboard stuff in the suggestions
    var isVision = state.selectedPractice.ehr === "Vision";
    $('#advice-list').find('span:contains("[COPY")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[COPY:([^\]\.]*)(\.*)\]/g, (isVision ? '#$1$2' : '$1') + ' <button type="button" data-clipboard-text="' + (isVision ? '#$1$2' : '$1') + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + state.selectedPractice.ehr + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ' + (isVision ? '#$1$2' : '$1') + ' to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });
    $('#advice-list').find('td:contains("[")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[([^\]\.]*)(\.*)\]/g, ' <button type="button" data-clipboard-text="' + (isVision ? '#$1$2' : '$1') + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + state.selectedPractice.ehr + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ' + (isVision ? '#$1$2' : '$1') + ' to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
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
      var tooltip = subsection ? "This action is suggested because PINGR classified this patient as:'" + desc + "'" : '';
      var newHtml = ' <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="' + tooltip + '"></i>';
      $(this).html(html.replace(/\[INFO\]/g, newHtml));
    });

    $('#advice-list').find('span:contains("[MED-SUGGESTION")').each(function() {
      var html = $(this).html();
      var suggestion = Math.random() < 0.33 ? "Increase Ramipril to 10mg per day" : (Math.random() < 0.5 ? "Consider adding an ACE inhibior" : "Consider adding a thiazide-like diuretic");
      $(this).html(html.replace(/\[MED\-SUGGESTION\]/g, suggestion));
    });

    $('#advice-list').find('td:contains("Reasoning")').each(function() {
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
          .replace(/<a.+href=["']([^"']+)["'].*>([^<]+)<\/a>/g, "$2 - $1")
          .replace(/ ?<button.+<\/button>/g, "");
        reasoning.replaceWith('Reasoning <button type="button" data-clipboard-text="' + content + '" data-content="Copied!<br><strong>Use Ctrl + v to paste into ' + state.selectedPractice.ehr + '!</strong>" data-toggle="tooltip" data-placement="top" title="Copy reasoning to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>');
      }
    });

    base.setupClipboard('.btn-copy', true);

    iap.displayPersonalisedIndividualActionPlan($('#personalPlanIndividual'), pathwayId, pathwayStage, standard);
  },

  launchModal: function(label, value, rejectedReason, rejectedReasonText, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var reasons = [{
      "reason": "Already done this",
      "value": "done"
    }, {
      "reason": "Wouldn't work",
      "value": "nowork"
    }, {
      "reason": "Something else",
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
      "placeholder": "Provide more information here...",
      "reasons": reasons
    }, label, value, rejectedReasonText || null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  }

};

module.exports = iap;
