var base = require('../base.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  confirm = require('./confirm.js');

var ID = "QUALITYSTANDARD";

var qs = {

  create: function(pathwayId, pathwayStage, standard, patientId) {

    var localData = {
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    };
    localData.standard = data.pathwayNames[pathwayId] + ' - ' + pathwayStage;
    if (data.patients[patientId].standards && data.patients[patientId].standards[pathwayId] &&
      data.patients[patientId].standards[pathwayId][pathwayStage] &&
      data.patients[patientId].standards[pathwayId][pathwayStage][standard]) {
      localData.standard = data.patients[patientId].standards[pathwayId][pathwayStage][standard];
    }

    localData.tooltip = data[pathwayId][pathwayStage].standards[standard]["standard-met-tooltip"];

    switch (data.getPatientStatus(patientId, pathwayId, pathwayStage, standard)) {
      case "ok":
        ////farRightPanel.removeClass('standard-missed-page').addClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        localData.achieved = true;
        localData.relevant = true;
        break;
      case "missed":
        ////farRightPanel.addClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        localData.relevant = true;
        localData.achieved = false;
        break;
      case "not":
        ////farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').addClass('standard-not-relevant-page');
        localData.relevant = false;
        break;
    }

    var agObj = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "standard");
    if (agObj && agObj.agree) localData.agree = true;
    else if (agObj && agObj.agree === false) localData.disagree = true;

    return base.createPanel($('#qual-standard'), localData);
  },

  show: function(panel, pathwayId, pathwayStage, standard, patientId){

    var panelId = panel.attr("id");

    if (base.panels[panelId] &&
      base.panels[panelId].id === ID &&
      base.panels[panelId].patientId === patientId) {
        //Already showing the right thing
        return;
    }

    base.panels[panelId] = {
      id: ID,
      patientId: patientId
    };

    panel.html(qs.create(pathwayId, pathwayStage, standard, patientId));
    qs.wireUp(pathwayId, pathwayStage, standard, patientId);
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#qual-agree-disagree'), $('#individual-panel-classification'), pathwayId, pathwayStage, standard, patientId, "standard", "quality standard");
  },

  update: function() {
    $('#individual-panel-classification').find('div').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        var isClassification = $(this).closest("div").data("isClassification") !== undefined;
        any = true;
        var item = log.getAgrees()[data.patientId].filter(function(i) {
          return isClassification ? i.item === "section" : i.item !== "section";
        });
        var tool;
        if (this.value === "yes") {
          if (item && item[0].history) {
            tool = "<p>" + item[0].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          if (item && item[0].history) {
            tool = "<p>" + item[0].history[0] + "</p><p>Click again to edit/cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });

      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }

      if (!any) {
        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      base.wireUpTooltips();
    });

    base.wireUpTooltips();
  }

};

module.exports = qs;
