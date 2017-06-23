var Highcharts = require('highcharts/highstock'),
  base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  FileSaver = require('file-saver'),
  jsPDF = require('jspdf'),
  jspdfAutoTable = require('jspdf-autotable');

// var $ = require('jquery');
// require('datatables.net-bs')(window, $);
// require('datatables.net-buttons-bs')(window, $);
// require('datatables.net-buttons/js/buttons.colVis.js')(window, $);
// require('datatables.net-buttons/js/buttons.html5.js')(window, $);

var table;

var standardAsc = function (a, b) {
  return ((a < b) ? -1 : ((a > b) ? 1 : 0));
};

var standardDesc = function (a, b) {
  return ((a < b) ? 1 : ((a > b) ? -1 : 0));
};

$.extend($.fn.dataTableExt.oSort, {

  "date-uk-pre": function (a) {
    if (a == null || a == "" || a === "?") {
      return 0;
    }
    var ukDatea = a.split('/');
    return (ukDatea[2] + ("0" + ukDatea[1]).substr(ukDatea[1].length - 1) + ("0" + ukDatea[0]).substr(ukDatea[0].length - 1)) * 1;
  },

  "date-uk-asc": standardAsc,
  "date-uk-desc": standardDesc,

  "numeric-?-pre": function (a) {
    if (a == null || a == "" || a === "?") {
      return 0;
    }
    return +a;
  },

  "numeric-?-asc": standardAsc,
  "numeric-?-desc": standardDesc,

  "plan-pre": function (a) {
    if (a == null || a == "" || a === "?") {
      return 0;
    } else if ($(a).hasClass('text-success')) {
      return 1;
    } else {
      return -1;
    }
  },

  "plan-asc": standardAsc,
  "plan-desc": standardDesc,

  "opps-pre": function (a) {
    if (a == null || a == "" || a === "?") {
      return 0;
    }
    return $(a).length;
  },

  "opps-asc": standardAsc,
  "opps-desc": standardDesc,
});

var ID = "PATIENT_LIST";
var currentPatients;

var writeToFile = function (list) {
  var blob = new Blob([list.join("\r\n")], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "nhsNumbers.txt");
};

var parseHtml = function (html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace("&gt;", ">")
    .replace("&gte;", "≥")
    .replace("&lt;", "<")
    .replace("&lte;", "≤");
};

var writePdf = function () {
  var columns = currentPatients["header-items"].map(function (v) { return v.title; });
  var rows = currentPatients.patients.map(function (v) {
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

  wireUp: function (onPatientSelected) {
    patientsPanel = $('#patients');

    patientsPanel
      /*.on('click', 'thead tr th.sortable', function () { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pl.populate(pl.state[0], pl.state[1], pl.state[2], pl.state[3], $(this).index(), sortAsc);
    })*/
      .on('click', 'tbody tr', function (e) { //Select individual patient when row clicked#
        var callback = onPatientSelected.bind(this);
        var patientId = $(this).find('td button').attr('data-patient-id');
        var type = $(this).find('td button').attr('data-type');
        callback(patientId, type);
        e.preventDefault();
        e.stopPropagation();
      }).on('click', 'tbody tr button', function (e) {
        //don't want row selected if just button pressed?
        e.preventDefault();
        e.stopPropagation();
      }).on('click', '#downloadPatientList', function () {
        writePdf();
      }).on('click', '#downloadAsPdf', function (e) {
        writePdf();
        e.preventDefault();
      }).on('click', '#downloadAsText', function (e) {
        writeToFile(currentPatients.patients.map(function (v) {
          return v.nhs;
        }));
        e.preventDefault();
      });
  },

  selectSubsection: function (section) {
    pl.populate(pl.state[0], pl.state[1], pl.state[2], section, pl.state[4], pl.state[5]);
  },

  restoreFromState: function () {
    pl.populate.apply(this, pl.state);
  },

  populate: function (pathwayId, pathwayStage, standard, subsection, sortField, sortAsc) {
    pl.state = [pathwayId, pathwayStage, standard, subsection, sortField, sortAsc];
    patientsPanel = $('#patients');
    base.showLocalLoading(patientsPanel, "Loading patient list...");
    //Remove scroll if exists
    /*patientsPanel.find('div.table-scroll').getNiceScroll().remove();*/

    var i, k, prop, header, pList = [];

    //data.getPatientList("P87024", pathwayId, pathwayStage, standard, subsection, function(list) {
    data.getPatientList(data.userDetails.practiceId, pathwayId, pathwayStage, standard, subsection, function (list) {

      list.indicatorId = [pathwayId, pathwayStage, standard].join(".");
      currentPatients = list;
      base.createPanelShow(require('templates/patient-list'), patientsPanel, list);

      $('#patients-placeholder').hide();

      $('#patient-list').on('init.dt', function () {
        console.log('Init occurred at: ' + new Date().getTime());
      });

      $('#patient-list').on('preInit.dt', function () {
        console.log('PreInit occurred at: ' + new Date().getTime());
      });

      $('#patient-list').on('processing.dt', function () {
        console.log('processing occurred at: ' + new Date().getTime());
      });

      var numColumns = list["header-items"].length;
      table = $('#patient-list').DataTable({
        searching: false, //we don't want a search box
        stateSave: true, // let's remember which page/sorting etc
        dom: '<"row"<"col-sm-7 toolbar"i><"col-sm-5"B>>rt<"row"<"col-sm-5"l><"col-sm-7"p>><"clear">',
        columnDefs: list["header-items"].map(function (v, i) {
          var thing = { type: v.type, orderSequence: v.orderSequence, targets: i, name:"shown" };
          if(v.hidden) {
            thing.visible=false;
            thing.name="not";
          } else if(i<numColumns-2){
            //everything sorted by exclusion first except exclusion column
            thing.orderData = [[numColumns-1,"asc"], i];
          }
          return thing;
        }),
        scrollY: '50vh',
        scrollCollapse: true,
        buttons: [
          {
            extend: 'colvis',
            columns: 'shown:name'
          },
          {
            text: 'Pdf',
            className: 'download-button',
            action: function (e, dt, node, config) {
              //writePdf();
            }
          }
        ],
        infoCallback: function (settings, start, end, max, total, pre) {
          return "showing " + start + " to " + end + " of " + total + " patients" + (list.numExcluded>0 ? " [including " + list.numExcluded + " exclusions]" : "");
        }
      });

      $('#overviewPaneTab').on('shown.bs.tab', function (e) {
        table.columns.adjust().draw(false); //ensure sparklines on hidden tabs display
      });

      setTimeout(function () {
        table.columns.adjust().draw(false);

        base.setupClipboard($('.btn-copy'), true);
        base.wireUpTooltips();
      }, 100);


      var updateInfo = function () {
        $("#patient-list_info")
          .html('<span class="h4">' + list.header + '</span><span> (' + $("#patient-list_info").text().toLowerCase() + ')</span>')
          .css('white-space', 'normal');
      };

      $('.download-button').replaceWith($('<div class="btn-group"><button id="downloadPatientList" class="btn btn-danger">Download patient list</button><button data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-danger dropdown-toggle"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul class="dropdown-menu"><li><a id="downloadAsPdf" href="#">Full list (pdf)</a></li><li><a id="downloadAsText" href="#">Nhs numbers (text file)</a></li></ul></div>'));

      updateInfo();

      // Must update after every redraw
      $('#patient-list').on('draw.dt', function () {
        updateInfo();
        console.log('Redraw occurred at: ' + new Date().getTime());
      });

      $('.dt-buttons').addClass('pull-right');

      /*$('#patient-list').floatThead({
        position: 'absolute',
        scrollContainer: true,
        zIndex: 50
      });
      
      $('#patient-list').floatThead('reflow');*/

      base.hideLoading();

      base.updateFixedHeightElements([{ selector: '#right-panel', padding: 15, minHeight: 300 }, /*{ selector: '.table-scroll', padding: 340, minHeight: 170 }, */{ selector: '#personalPlanTeam', padding: 820, minHeight: 200 }, { selector: '#advice-list', padding: 430, minHeight: 250 }]);

    });

  },

  show: function (panel, isAppend, pathwayId, pathwayStage, standard, loadContentFn) {

    //var tempMust = $('#patients-panel-yes').html();
    var tmpl = require('templates/patient-list-wrapper');

    if (isAppend) panel.append(tmpl());
    else panel.html(tmpl());

    pl.wireUp(function (patientId, type) {
      var url = '#patient/' + patientId;
      if (type && type === "process" && pathwayId && pathwayStage && standard) url += '/' + [pathwayId, pathwayStage, standard].join("/");
      history.pushState(null, null, url);
      loadContentFn(url);
    });
    pl.populate(pathwayId, pathwayStage, standard, null);
  }

};

module.exports = pl;
