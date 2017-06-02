var base = require('../base'),
  data = require('../data'),
  state = require('../state'),
  log = require('../log');


var deleteRow = function(row, callback) {
  var row = row.children('td').css({ backgroundColor: "red", color: "white" });
  setTimeout(function () {
    $(row)
      .animate({ paddingTop: 0, paddingBottom: 0 }, 500)
      .wrapInner('<div />')
      .children()
      .slideUp(500, function () { 
          $(this).closest('tr').remove();
          return callback();
      });
  }, 350);
};

var qs = {

  actionPlanRefresh: {},

  create: function (patientId, pathwayId, pathwayStage, standard) {
    var patientData = data.getPatientData(patientId);

    var tmpl = require("templates/quality-standard");
    //RW TEMP fix
    patientData.standards = patientData.standards.map(function (v) {
      if (!v.indicatorId) {
        var iid;
        Object.keys(data.text.pathways).forEach(function (vv) {
          Object.keys(data.text.pathways[vv]).forEach(function (vvv) {
            Object.keys(data.text.pathways[vv][vvv].standards).forEach(function (vvvv) {
              if (data.text.pathways[vv][vvv].standards[vvvv].tabText === v.display) {
                iid = [vv, vvv, vvvv].join(".");
                return;
              }
            });
          });
        });
        if (iid) v.indicatorId = iid;
      }
      if (v.indicatorId) {
        v.excluded = data.isExcluded(patientId, v.indicatorId);
        if (v.excluded) v.excludedTooltip = data.getExcludedTooltip(patientId, v.indicatorId);
        v.indicatorDescription = data.text.pathways[v.indicatorId.split(".")[0]][v.indicatorId.split(".")[1]].standards[v.indicatorId.split(".")[2]].description;
      }
      return v;
    }).sort(function (a, b) {
      if (a.excluded && b.excluded) return 0;
      if (a.excluded === b.excluded) {
        if (a.targetMet === b.targetMet) return 0;
        else if (a.targetMet) return 1;
        return -1;
      } else {
        if (a.excluded) return 1;
        return -1;
      }

    });

    var processStandards = patientData.standards.filter(function (v) {
      return v.type === "process";
    });

    var outcomeStandards = patientData.standards.filter(function (v) {
      return v.type === "outcome";
    });
    //
    var html = tmpl({
      noStandards: patientData.standards.length === 0,
      processStandards: processStandards,
      outcomeStandards: outcomeStandards,
      indicatorId: pathwayId && pathwayStage && standard ? [pathwayId, pathwayStage, standard].join(".") : null,
      patientId: patientId,
      selectedTab: state.getTab('individual'),
    });

    return html;
  },

  show: function (panel, isAppend, patientId, pathwayId, pathwayStage, standard, refreshFn) {

    actionPlanRefresh = refreshFn;

    var html = qs.create(patientId, pathwayId, pathwayStage, standard);

    if (isAppend) panel.append(html);
    //*b* maintain state
    else {
      base.savePanelState();
      panel.html(html);
    }

    panel.off('click', '.reason-link').on('click', '.reason-link', function (e) {
      var action = $(this).html();
      panel.find('.qs-show-more-row').hide();
      panel.find('.reason-link').html('Show more <i class="fa fa-caret-down"></i>');
      if (action.indexOf('Show more') > -1) {
        panel.find('.qs-show-more-row[data-id="' + $(this).data('id') + '"]').show("fast");
        $(this).html('Show less <i class="fa fa-caret-up"></i>');
      }

      e.preventDefault();
    }).off('click', '.exclude').on('click', '.exclude', function () {

      var tmpl = require("templates/modal-exclude");
      var indicatorId = $(this).data('id');
      var bits = indicatorId.split('.');
      var row = $(this).parent().parent();

      $('#modal').html(tmpl({ nhs: data.patLookup ? data.patLookup[patientId] : patientId, indicator: data.text.pathways[bits[0]][bits[1]].standards[bits[2]].tabText }));

      $('#modal .modal').off('submit', 'form').on('submit', 'form', function (e) {

        var freetext = $('#modal textarea').val();

        log.excludePatient(patientId, indicatorId, $('[name="reason"]:checked').val(), freetext);

        // hide row
        deleteRow(row, function(){
          actionPlanRefresh(patientId, indicatorId);
          qs.updateFromId(patientId, indicatorId);
        });

        e.preventDefault();
        $('#modal .modal').modal('hide');
      }).modal();
    }).off('click', '.include').on('click', '.include', function () {
      var indicatorId = $(this).data('id');
      actionPlanRefresh(patientId, indicatorId);
      log.includePatient(patientId, indicatorId);
      qs.updateFromId(patientId, indicatorId);
    });
  },

  updateFromId: function (patientId, indicatorId) {
    var bits = indicatorId.split('.');
    qs.update(patientId, bits[0], bits[1], bits[2]);
  },

  update: function (patientId, pathwayId, pathwayStage, standard) {
    var html = qs.create(patientId, pathwayId, pathwayStage, standard);

    $('#qs').replaceWith(html);

    base.wireUpTooltips();
  }
};

module.exports = qs;
