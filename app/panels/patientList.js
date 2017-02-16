var Highcharts = require('highcharts/highstock'),
  base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js');

var ID = "PATIENT_LIST";

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
    });
  },

  selectSubsection: function(section) {
    pl.populate(pl.state[0], pl.state[1], pl.state[2], section, pl.state[4], pl.state[5]);
  },

  populate: function(pathwayId, pathwayStage, standard, subsection, sortField, sortAsc) {
    pl.state = [pathwayId, pathwayStage, standard, subsection, sortField, sortAsc];
    patientsPanel = $('#patients');
    //Remove scroll if exists
    /*patientsPanel.find('div.table-scroll').getNiceScroll().remove();*/

    var i, k, prop, header, pList = [];

    //data.getPatientList("P87024", pathwayId, pathwayStage, standard, subsection, function(list) {
    data.getPatientList(data.userDetails.practiceId, pathwayId, pathwayStage, standard, subsection, function(list) {

      if (sortField === undefined) sortField = 2;
      if (sortField !== undefined) {
        list.patients.sort(function(a, b) {
          if (sortField === 0) { //NHS number
            if (a.nhsNumber === b.nhsNumber) {
              return 0;
            }

            if (a.nhsNumber > b.nhsNumber) {
              return sortAsc ? 1 : -1;
            } else if (a.nhsNumber < b.nhsNumber) {
              return sortAsc ? -1 : 1;
            }
          } else {
            if (a.items[sortField - 1] === b.items[sortField - 1]) {
              return 0;
            }

            if (a.items[sortField - 1] == "?") return 1;
            if (b.items[sortField - 1] == "?") return -1;

            var A = Number(a.items[sortField - 1]);
            var B = Number(b.items[sortField - 1]);
            if (isNaN(A) || isNaN(B)) {
              A = a.items[sortField - 1];
              B = b.items[sortField - 1];
            }
            if (A > B) {
              return sortAsc ? 1 : -1;
            } else if (A < B) {
              return sortAsc ? -1 : 1;
            }
          }
        });

        for (i = 0; i < list["header-items"].length; i++) {
          if (i === sortField) {
            list["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
            list["header-items"][i].isAsc = sortAsc;
            list["header-items"][i].isSorted = true;
          } else {
            list["header-items"][i].isSorted = false;
          }
        }
      }

      base.createPanelShow(require('templates/patient-list'), patientsPanel, list);
      /*, {
              "header-item": require('src/templates/partials/_patient-list-header-item')(),
              "item": require('src/templates/partials/_patient-list-item')()
            });*/

      $('#patients-placeholder').hide();

      base.setupClipboard($('.btn-copy'), true);

      base.wireUpTooltips();

      /*patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });*/

      base.hideLoading();

      var updateSizeOnLoad = function() {
        console.log("shall we update?");
        if ($('.table-scroll').length === 0) {
          console.log("no - wait a bit.");
          setTimeout(updateSizeOnLoad, 10);
        } else {
          console.log("yes");
          if ($('#addedCSS').length === 0) {
            console.log("done");
            $('head').append('<style id="addedCSS" type="text/css">.table-scroll {max-height:' + Math.floor($(window).height() - $('.table-scroll').position().top - 200) + 'px;}');
          } else {
            $('#addedCSS').text('.table-scroll {max-height:' + Math.floor($(window).height() - $('.table-scroll').position().top - 200) + 'px;}');
          }
        }
      };
      updateSizeOnLoad();

    });

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard, loadContentFn) {

    //var tempMust = $('#patients-panel-yes').html();
    var tmpl = require('templates/patient-list-wrapper');

    if (isAppend) panel.append(tmpl());
    else panel.html(tmpl());

    pl.wireUp(function(patientId) {
      var url = '#patient/' + patientId;
      if (pathwayId && pathwayStage && standard) url += '/' + [pathwayId, pathwayStage, standard].join("/");
      history.pushState(null, null, url);
      loadContentFn(url);
    });
    pl.populate(pathwayId, pathwayStage, standard, null);
  }

};

module.exports = pl;
