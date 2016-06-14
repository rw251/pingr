var base = require('../base.js'),
log = require('../log.js');

var confirm = {

  wireUp: function(agreeDivSelector, panelSelector, pathwayId, pathwayStage, standard, patientId, item, disagreeText) {
    confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));

    panelSelector.on('change', '.btn-toggle input[type=checkbox]', function() {
      confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
      base.wireUpTooltips();
    }).on('click', '.btn-toggle', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive")) {
        //unselecting
        if (checkbox.val() === "no") {
          confirm.launchStandardModal("Disagree with " + disagreeText, "?", log.getAgreeReason(pathwayId, pathwayStage, standard, patientId, item), true, function() {
            log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, false, log.reason.reasonText);
            confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            base.wireUpTooltips();
          }, null, function() {
            log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, null, "");
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, null);
          other.removeClass("inactive");
        }
      } else if (!$(this).hasClass("active") && other.hasClass("active")) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          confirm.launchStandardModal("Disagree with " + disagreeText, "", "", false, function() {
            log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, false, log.reason.reasonText);
            $(self).removeClass("inactive");
            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });
  },

  wireUpAgreeDisagree: function(selector, agreeObject) {
    if (agreeObject.agree === true) {
      selector.children(':nth(0)').addClass('active');
      selector.children(':nth(1)').addClass('inactive');
      selector.children(':nth(0)').attr("title", confirm.getAgreeTooltip(agreeObject)).attr("data-original-title", confirm.getAgreeTooltip(agreeObject)).tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      selector.parent().addClass('success').removeClass('danger');
    } else if (agreeObject.agree === false) {
      selector.children(':nth(0)').addClass('inactive');
      selector.children(':nth(1)').addClass('active');
      selector.children(':nth(0)').attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title", confirm.getDisgreeTooltip(agreeObject)).attr("data-original-title", confirm.getDisgreeTooltip(agreeObject)).tooltip('fixTitle').tooltip('hide');
      selector.parent().addClass('danger').removeClass('success');
    } else {
      selector.children(':nth(0)').attr("title", "Click to agree").attr("data-original-title", "Click to agree").tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title", "Click to disagree").attr("data-original-title", "Click to disagree").tooltip('fixTitle').tooltip('hide');
      selector.parent().removeClass('success').removeClass('danger');
    }
  },

  getAgreeTooltip: function(agreeObject) {
    return agreeObject.history[agreeObject.history.length - 1];
  },

  getDisgreeTooltip: function(agreeObject) {
    return agreeObject.history[agreeObject.history.length - 1] + " You said: " + agreeObject.reason;
  },

  launchStandardModal: function(header, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    base.launchModal({
      "header": header,
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Provide more information here..."
    }, null, value, reason, callbackOnSave, callbackOnCancel, callbackOnUndo);
  }

};

module.exports = confirm;
