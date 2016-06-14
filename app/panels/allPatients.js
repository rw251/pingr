var base = require('../base.js'),
  data = require('../data.js'),
  qualityStandard = require('./qualityStandard.js'),
  otherCodes = require('./otherCodes.js'),
  medication = require('./medication.js'),
  trend = require('./trend.js'),
  individualActionPlan = require('./individualActionPlan.js'),
  layout = require('../layout.js'),
  chart = require('../chart.js'),
  Mustache = require('mustache');

var all = {

  populate: function() {
    var patients = data.getAllPatients();

    var localData = {
      "patients": patients,
      "n": patients.length,
      "header-items": [{
        "title": "NHS no.",
        "isUnSortable": true
      }, {
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isUnSortable": true,
        "tooltip": "Total number of improvement opportunities available across all conditions"
      }]
    };

    localData.patients.sort(function(a, b) {
      if (a.items[0] === b.items[0]) {
        return 0;
      }
      var A = Number(a.items[0]);
      var B = Number(b.items[0]);
      if (isNaN(A) || isNaN(B)) {
        A = a.items[0];
        B = b.items[0];
      }
      if (A > B) {
        return -1;
      } else if (A < B) {
        return 1;
      }
    });

    base.createPanelShow(patientList, patientsPanel, localData, {
      "header-item": $("#patient-list-header-item").html(),
      "item": $('#patient-list-item').html()
    });

    $('#patients-placeholder').hide();

    base.setupClipboard($('.btn-copy'), true);

    base.wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if (c && c.length > 0) {
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });
    }
  },

  //Show patient view from the all patient screen
  showIndividualPatientView: function(pathwayId, pathwayStage, standard, patientId) {
    data.patientId = patientId;

    data.options.sort(function(a, b) {
      a = data.getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = data.getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if (a === b) return 0;
      if (a === "not") return 1;
      if (b === "not") return -1;
      if (a === "ok") return 1;
      if (b === "ok") return -1;
      alert("!!!!!!!");
    });

    if (pathwayId === null) {
      //Show patient but don't select
      var p = base.createPanel($('#patient-panel'), {
        "options": data.options,
        "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
        "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
        "patientId": patientId
      }, {
        "option": $('#patient-panel-drop-down-options').html()
      });
      farRightPanel.html(p).show();
      farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');

      $('select').select2({
        templateResult: base.formatStandard,
        minimumResultsForSearch: Infinity,
        placeholder: "Please select an improvement opportunity area..."
      });
      $('span.select2-selection__rendered').attr("title", "");
      $('select').on('change', function() {
        var localData = $(this).find(':selected').data();
        all.showIndividualPatientView(localData.pathwayId, localData.pathwayStage, localData.standard, data.patientId);
      }).on("select2:open", function(e) {
        base.wireUpTooltips();
      });
      return;
    }

    var panel = base.createPanel($('#patient-panel'), {
      "options": data.options,
      "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "pathwayStage": pathwayStage,
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    }, {
      "option": $('#patient-panel-drop-down-options').html()
    });

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = individualActionPlan.create(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = qualityStandard.create(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = trend.create(pathwayId, pathwayStage, standard, patientId);
    var medPanel = medication.create(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = otherCodes.create(pathwayId, pathwayStage, standard, patientId);
    var medCodeWrapperPanel = base.createPanel($('#other-codes-and-meds-wrapper-panel'));
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medCodeWrapperPanel);
    $('#temp-hidden #medCodeWrapperPanel').append(medPanel).append(codesPanel);

    if (farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(100, function() {
        $(this).html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        individualActionPlan.wireUp(pathwayId, pathwayStage, standard, patientId);
        qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
        base.wireUpStandardDropDown(pathwayId, pathwayStage, standard, all.showIndividualPatientView);
        trend.wireUp(pathwayId, pathwayStage, standard, patientId);
        medication.wireUp(pathwayId, pathwayStage, standard, patientId);
        otherCodes.wireUp(pathwayId, pathwayStage, standard, patientId);
        chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        $(this).fadeIn(100, function() {});
      });
    } else {
      farRightPanel.html($('#temp-hidden').html());
      $('#temp-hidden').html("");
      individualActionPlan.wireUp(pathwayId, pathwayStage, standard, patientId);
      qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
      base.wireUpStandardDropDown(pathwayId, pathwayStage, standard, all.showIndividualPatientView);
      trend.wireUp(pathwayId, pathwayStage, standard, patientId);
      medication.wireUp(pathwayId, pathwayStage, standard, patientId);
      otherCodes.wireUp(pathwayId, pathwayStage, standard, patientId);
      chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
      farRightPanel.fadeIn(100, function() {});
    }
  },

  show: function(location) {
    base.createPanelShow($('#all-patients-panel'), location, {
      "n": data.getAllPatients().length
    });

    patientsPanel = $('#patients');

    patientsPanel.on('click', 'tbody tr', function(e) { //Select individual patient when row clicked
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      all.showIndividualPatientView(null, null, null, patientId);

      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });
  },

  showView: function(patientId, reload) {
    $('#mainTitle').hide();
    base.updateTitle("List of all patients at your practice");

    if (!patientId) data.pathwayId = "";
    if (!patientId || reload) {

      layout.showMainView(data.diseases.length);

      base.switchTo110Layout();
      base.hideAllPanels();

      all.show(farLeftPanel);
      all.populate();
    }

    if (patientId) {
      all.showIndividualPatientView(null, null, null, patientId);
    } else {
      var tempMust = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(tempMust)).show();
    }
  }

};

module.exports = all;
