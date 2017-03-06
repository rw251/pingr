var Highcharts = require('highcharts/highstock'),
  base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js');

var ID = "ALL_PATIENT_LIST";
var currentPatients;

var pl = {

  wireUp: function(onPatientSelected) {
    patientsPanel = $('#patients');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pl.populate(pl.state[0], pl.state[1], pl.state[2], pl.state[3], $(this).index(), sortAsc);
    }).on('click', 'tbody tr', function(e) { //Select individual patient when row clicked#
      var callback = onPatientSelected.bind(this);
      var patientId = $(this).find('td button').attr('data-patient-id');
      callback(patientId);
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
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

  populate: function(panel, sortField, sortAsc) {
    pl.state = [sortField, sortAsc];

    var i, k, prop, header, pList = [];

    data.getAllPatientList(0, 10, function(err, list) {
      var tmpl = require('templates/all-patient-list');
      var html = tmpl({patients: list});
      panel.append(html);

      base.setupClipboard($('.btn-copy'), true);
      base.wireUpTooltips();

      base.hideLoading();

    });

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard, loadContentFn) {

    pl.wireUp(function(patientId) {
      var url = '#patient/' + patientId;
      if (pathwayId && pathwayStage && standard) url += '/' + [pathwayId, pathwayStage, standard].join("/");
      history.pushState(null, null, url);
      loadContentFn(url);
    });
    pl.populate(panel);
  }

};

module.exports = pl;
