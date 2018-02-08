var Highcharts = require('highcharts/highstock'),
  base = require('../base.js'),
  data = require('../data.js'),
  state = require('../state.js'),
  lookup = require('../lookup.js');

require('floatthead');

var ID = "ALL_PATIENT_LIST";
var currentPatients;

var pl = {

  wireUp: function(onPatientSelected) {
    patientsPanel = $('#all-patient-list');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pl.populate(pl.state[0], pl.state[1], pl.state[2], pl.state[3], $(this).index(), sortAsc);
    }).on('click', 'tbody tr.list-item', function(e) { //Select individual patient when row clicked#
      var callback = onPatientSelected.bind(this);
      var patientId = $(this).find('td button').attr('data-patient-id');
      callback(patientId);
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr a', function(e) {
      //don't want row selected if just hyperlink pressed?

      $('.indicatorList').hide();

      if ($(this).hasClass('hideIndicators')) {
        $('.hideIndicators[data-id=' + $(this).data("id") + ']').hide();
        $('.showIndicators').show();
      } else {
        $('.showIndicators').show();
        $('.showIndicators[data-id=' + $(this).data("id") + ']').hide();
        $('.hideIndicators').hide();
        $('.indicatorList[data-id="' + $(this).data("id") + '"]').show();
        $('.hideIndicators[data-id="' + $(this).data("id") + '"]').show();
      }

      e.preventDefault();
      e.stopPropagation();
    }).on('click', '#downloadPatientList', function() {
      writePdf();
    }).on('click', '#downloadAsPdf', function(e) {
      writePdf();
      e.preventDefault();
    }).on('click', '#downloadAsText', function(e) {
      writeToFile(currentPatients.patients.map(function(v) {
        return v.nhs;
      }));
      e.preventDefault();
    });
  },

  populate: function(skip, limit, sortField, sortAsc) {
    pl.state = [skip, limit, sortField, sortAsc];

    var i, k, prop, header, pList = [];

    data.getAllPatientList(state.selectedPractice._id, skip, limit, function(err, list) {

      list = list.map(function(v) {
        v.indicatorNames = v.indicators.map(function(vv) {
          return data.getDisplayTextFromIndicatorId(vv);
        });
        if (v.indicatorsWithAction) {
          v.indicatorsWithActionsNames = v.indicatorsWithAction.map(function(vv) {
            return data.getDisplayTextFromIndicatorId(vv);
          });
        }
        return v;
      });

      var tmpl = require('templates/all-patient-list');
      var html = tmpl({ patients: list, skip: skip, limit: limit, selectedPractice: state.selectedPractice });
      $('#all-patient-list').html(html);

      base.setupClipboard('.btn-copy', true);
      base.wireUpTooltips();

      base.hideLoading();

      var $scrollTable = $('#allPatientTable')

      $scrollTable.floatThead({
        scrollContainer: function($scrollTable){
          return $scrollTable.closest('.wrapper-floatTHead');
        }
      });
    });

  },

  show: function(panel, isAppend, skip, limit, loadContentFn) {
    var html = require('templates/all-patient-list-wrapper')();
    if (isAppend) panel.append(html);
    else panel.html(html);

    pl.wireUp(function(patientId) {
      var url = '#patient/' + patientId;
      history.pushState(null, null, url);
      loadContentFn(url);
    });
    pl.populate(skip, limit);
  }

};

module.exports = pl;
