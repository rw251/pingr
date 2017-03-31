var Highcharts = require('highcharts/highstock'),
  base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  FileSaver = require('file-saver'),
  jsPDF = require('jspdf'),
  jspdfAutoTable = require('jspdf-autotable');

var ID = "PATIENT_LIST";
var currentPatients;

var writeToFile = function(list) {
  var blob = new Blob([list.join("\r\n")], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "nhsNumbers.txt");
};

var parseHtml = function(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace("&gt;",">")
    .replace("&gte;","≥")
    .replace("&lt;","<")
    .replace("&lte;","≤");
};

var writePdf = function() {
  var columns = currentPatients["header-items"].map(function(v) { return v.title; });
  var rows = currentPatients.patients.map(function(v) {
    return [
      v.nhs,
      v.age,
      v.value,
      v.opportunities.join("\n")
    ];
  });

  var extraInfo = data.getIndicatorDataSync(null, currentPatients.indicatorId);

  var doc = new jsPDF('l');
  doc.setFontSize(18);
  var y = 22;
  var mainHeader = doc.splitTextToSize(parseHtml(extraInfo.name), doc.internal.pageSize.width - 35, {});
  doc.text(mainHeader, 14, y);
  doc.setFontSize(11);
  doc.setTextColor(100);
  y += mainHeader.length * 8;
  var tagline = doc.splitTextToSize(extraInfo.performance.percentage + "% (" + extraInfo.performance.fraction + ") " + parseHtml(extraInfo.tagline), doc.internal.pageSize.width - 35, {});
  doc.text(tagline, 14, y);
  y += tagline.length * 7;
  doc.setFontSize(14);
  doc.setTextColor(0);
  var subHeader = doc.splitTextToSize(parseHtml(currentPatients.header) + " (n=" + currentPatients.patients.length + ")", doc.internal.pageSize.width - 35, {});
  doc.text(subHeader, 14, y);
  doc.setFontSize(11);
  doc.setTextColor(100);
  y += subHeader.length * 8;
  doc.autoTable(columns, rows, {
    startY: y,
    showHeader: 'firstPage',
    styles: {
      overflow: "linebreak",
      columWidth: "wrap"
    }
  });

  doc.save('patient-list.pdf');
};

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

  selectSubsection: function(section) {
    pl.populate(pl.state[0], pl.state[1], pl.state[2], section, pl.state[4], pl.state[5]);
  },

  restoreFromState: function() {
    pl.populate.apply(this, pl.state);
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

      list.indicatorId = [pathwayId, pathwayStage, standard].join(".");
      currentPatients = list;
      base.createPanelShow(require('templates/patient-list'), patientsPanel, list);
      /*, {
              "header-item": require('src/templates/partials/_patient-list-header-item')(),
              "item": require('src/templates/partials/_patient-list-item')()
            });*/

      $('#patients-placeholder').hide();

      base.setupClipboard($('.btn-copy'), true);

      base.wireUpTooltips();
      //
      // $('#patient-list').floatThead({
      //   position: 'absolute',
      //   scrollContainer: true,
      //   zIndex:50
      // });

      var $scrollTable = $('#patient-list-table');

      $scrollTable.floatThead({
          scrollContainer: function($scrollTable){
            return $scrollTable.closest('.wrapper-floatTHead');
        }
      });

      $('#patient-list-table').floatThead('reflow');

      $('.ps-child').perfectScrollbar();
      
      base.hideLoading();

      //base.updateFixedHeightElements([{ selector: '#right-panel', padding: 15, minHeight:300 }, { selector: '.table-scroll', padding: 440, minHeight:170 }, {selector:'#personalPlanTeam',padding:820, minHeight:200},{selector:'#advice-list',padding:430, minHeight:250}]);

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
