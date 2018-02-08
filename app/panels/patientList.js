const base = require('../base.js');
const data = require('../data.js');
const state = require('../state.js');
const FileSaver = require('file-saver');
const JSPDF = require('jspdf');
const $ = require('jquery');
const patientListTemplate = require('../templates/patient-list.jade');
const patientListWrapperTemplate = require('../templates/patient-list-wrapper.jade');

let table;
let patientsPanel;

const standardAsc = (a, b) => {
  if (a < b) return -1;
  return (a > b ? 1 : 0);
};

const standardDesc = (a, b) => -standardAsc(a, b);

$.extend($.fn.dataTableExt.oSort, {
  'date-uk-pre': (a) => {
    if (a === null || a === '' || a === '?') {
      return 0;
    }
    const ukDatea = a.split('/');
    return (
      (ukDatea[2] +
        (`0${ukDatea[1]}`).substr(ukDatea[1].length - 1) +
        (`0${ukDatea[0]}`).substr(ukDatea[0].length - 1)) *
      1
    );
  },

  'date-uk-asc': standardAsc,
  'date-uk-desc': standardDesc,

  'numeric-?-pre': (a) => {
    if (a === null || a === '' || a === '?') {
      return 0;
    }
    return +a;
  },

  'numeric-?-asc': standardAsc,
  'numeric-?-desc': standardDesc,

  'plan-pre': (a) => {
    if (a === null || a === '' || a === '?') {
      return 0;
    } else if ($(a).hasClass('text-success')) {
      return 1;
    }
    return -1;
  },

  'plan-asc': standardAsc,
  'plan-desc': standardDesc,

  'opps-pre': (a) => {
    if (a === null || a === '' || a === '?') {
      return 0;
    }
    return $(a).length;
  },

  'opps-asc': standardAsc,
  'opps-desc': standardDesc,
});

let currentPatients;

const writeToFile = (list) => {
  const blob = new Blob([list.join('\r\n')], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, 'nhsNumbers.txt');
};

const parseHtml = html => html
  .replace(/<[^>]*>/g, '')
  .replace('&gt;', '>')
  .replace('&gte;', '≥')
  .replace('&lt;', '<')
  .replace('&lte;', '≤');

const writePdf = () => {
  const columns = currentPatients['header-items'].map(v => v.title);
  const rows = currentPatients.patients.map(v => [v.nhs, v.age, v.value, v.opportunities.join('\n')]);

  const extraInfo = data.getIndicatorDataSync(null, currentPatients.indicatorId);

  const doc = new JSPDF('l');
  doc.setFontSize(18);
  let y = 22;
  const mainHeader = doc.splitTextToSize(
    parseHtml(extraInfo.name),
    doc.internal.pageSize.width - 35,
    {}
  );
  doc.text(mainHeader, 14, y);
  doc.setFontSize(11);
  doc.setTextColor(100);
  y += mainHeader.length * 8;
  const tagline = doc.splitTextToSize(
    `${extraInfo.performance.percentage
    }% (${
      extraInfo.performance.fraction
    }) ${
      parseHtml(extraInfo.tagline)}`,
    doc.internal.pageSize.width - 35,
    {}
  );
  doc.text(tagline, 14, y);
  y += tagline.length * 7;
  doc.setFontSize(14);
  doc.setTextColor(0);
  const subHeader = doc.splitTextToSize(
    `${parseHtml(currentPatients.header)
    } (n=${
      currentPatients.patients.length
    })`,
    doc.internal.pageSize.width - 35,
    {}
  );
  doc.text(subHeader, 14, y);
  doc.setFontSize(11);
  doc.setTextColor(100);
  y += subHeader.length * 8;
  doc.autoTable(columns, rows, {
    startY: y,
    showHeader: 'firstPage',
    styles: {
      overflow: 'linebreak',
      columWidth: 'wrap',
    },
  });

  doc.save('patient-list.pdf');
};

const pl = {
  wireUp(onPatientSelected) {
    let buttonClicked = false;

    patientsPanel = $('#patients');

    patientsPanel
      .on('click', 'tbody tr', (e) => {
        // Select individual patient when row clicked#
        if (!buttonClicked) {
          const callback = onPatientSelected.bind(e.currentTarget);
          const patientId = $(e.currentTarget)
            .find('td button')
            .attr('data-patient-id');
          const type = $(e.currentTarget)
            .find('td button')
            .attr('data-type');
          callback(patientId, type);
          e.preventDefault();
          e.stopPropagation();
        }
        buttonClicked = false;
      })
      .on('click', 'tbody tr button', () => {
        // don't want row selected if just button pressed?
        // but can't use:
        // e.preventDefault();
        // e.stopPropagation();
        // as it seems the clipboard event is triggered last
        buttonClicked = true;
      })
      .on('click', '#downloadPatientList', () => {
        writePdf();
      })
      .on('click', '#downloadAsPdf', (e) => {
        writePdf();
        e.preventDefault();
      })
      .on('click', '#downloadAsText', (e) => {
        writeToFile(currentPatients.patients.map(v => v.nhs));
        e.preventDefault();
      });
  },

  selectSubsection(section) {
    pl.populate(
      pl.state[0],
      pl.state[1],
      pl.state[2],
      section,
      pl.state[4],
      pl.state[5]
    );
  },

  restoreFromState() {
    pl.populate.apply(this, pl.state);
  },

  populate(
    pathwayId,
    pathwayStage,
    standard,
    subsection,
    sortField,
    sortAsc
  ) {
    pl.state = [
      pathwayId,
      pathwayStage,
      standard,
      subsection,
      sortField,
      sortAsc,
    ];
    patientsPanel = $('#patients');
    base.showLocalLoading(patientsPanel, 'Loading patient list...');
    // Remove scroll if exists
    /* patientsPanel.find('div.table-scroll').getNiceScroll().remove(); */

    // data.getPatientList("P87024", pathwayId, pathwayStage, standard, subsection, (list) => {
    data.getPatientList(
      state.selectedPractice._id,
      pathwayId,
      pathwayStage,
      standard,
      subsection,
      (listOfPatients) => {
        const list = listOfPatients;
        list.indicatorId = [pathwayId, pathwayStage, standard].join('.');
        list.selectedPractice = state.selectedPractice;
        currentPatients = list;
        base.createPanelShow(
          patientListTemplate,
          patientsPanel,
          list
        );

        $('#patients-placeholder').hide();

        $('#patient-list').on('init.dt', () => {
          // console.log(`Init occurred at: ${new Date().getTime()}`);
        });

        $('#patient-list').on('preInit.dt', () => {
          // console.log(`PreInit occurred at: ${new Date().getTime()}`);
        });

        $('#patient-list').on('processing.dt', () => {
          // console.log(`processing occurred at: ${new Date().getTime()}`);
        });

        const numColumns = list['header-items'].length;
        table = $('#patient-list').DataTable({
          searching: false, // we don't want a search box
          stateSave: true, // let's remember which page/sorting etc
          dom:
            '<"row"<"col-sm-7 toolbar"i><"col-sm-5"B>>rt<"row"<"col-sm-5"l><"col-sm-7"p>><"clear">',
          columnDefs: list['header-items'].map((v, i) => {
            const thing = {
              type: v.type,
              orderSequence: v.orderSequence,
              targets: i,
              name: 'shown',
            };
            if (v.hidden) {
              thing.visible = false;
              thing.name = 'not';
            } else if (i < numColumns - 2) {
              // everything sorted by exclusion first except exclusion column
              thing.orderData = [[numColumns - 1, 'asc'], i];
            }
            return thing;
          }),
          scrollY: '50vh',
          scrollCollapse: true,
          buttons: [
            {
              extend: 'colvis',
              columns: 'shown:name',
            },
            {
              text: 'Pdf',
              className: 'download-button',
              action: () => {
                // props e, dt, node, config
                // writePdf();
              },
            },
          ],
          infoCallback: (settings, start, end, max, total) => (
            `showing ${
              start
            } to ${
              end
            } of ${
              total
            } patients${
              list.numExcluded > 0
                ? ` [including ${list.numExcluded} exclusions]`
                : ''}`
          ),
        });

        $('#patient-list').on('draw.dt', () => {
          base.setupClipboard('.btn-copy', true);
          base.wireUpTooltips();
        });

        $('#overviewPaneTab').on('shown.bs.tab', () => {
          table.columns.adjust().draw(false); // ensure sparklines on hidden tabs display
        });

        setTimeout(() => {
          table.columns.adjust().draw(false);

          base.setupClipboard('.btn-copy', true);
          base.wireUpTooltips();
        }, 100);

        const updateInfo = () => {
          $('#patient-list_info')
            .html(`<span class="h4">${
              list.header
            }</span><span> (${
              $('#patient-list_info')
                .text()
                .toLowerCase()
            })</span>`)
            .css('white-space', 'normal');
        };

        $('.download-button').replaceWith($('<div class="btn-group"><button id="downloadPatientList" class="btn btn-danger">Download patient list</button><button data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn btn-danger dropdown-toggle"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul class="dropdown-menu"><li><a id="downloadAsPdf" href="#">Full list (pdf)</a></li><li><a id="downloadAsText" href="#">Nhs numbers (text file)</a></li></ul></div>'));

        updateInfo();

        // Must update after every redraw
        $('#patient-list').on('draw.dt', () => {
          updateInfo();
          // console.log(`Redraw occurred at: ${new Date().getTime()}`);
        });

        $('.dt-buttons').addClass('pull-right');

        /* $('#patient-list').floatThead({
        position: 'absolute',
        scrollContainer: true,
        zIndex: 50
      });

      $('#patient-list').floatThead('reflow'); */

        base.hideLoading();

        base.updateFixedHeightElements([
          { selector: '#right-panel', padding: 15, minHeight: 300 },
          /* { selector: '.table-scroll', padding: 340, minHeight: 170 }, */ {
            selector: '#personalPlanTeam',
            padding: 820,
            minHeight: 200,
          },
          { selector: '#advice-list', padding: 430, minHeight: 250 },
        ]);
      }
    );
  },

  show(
    panel,
    isAppend,
    pathwayId,
    pathwayStage,
    standard,
    loadContentFn
  ) {
    // var tempMust = $('#patients-panel-yes').html();
    const tmpl = patientListWrapperTemplate;

    if (isAppend) panel.append(tmpl());
    else panel.html(tmpl());

    pl.wireUp((patientId, type) => {
      let url = `#patient/${patientId}`;
      if (type && type === 'process' && pathwayId && pathwayStage && standard) { url += `/${[pathwayId, pathwayStage, standard].join('/')}`; }
      window.history.pushState(null, null, url);
      loadContentFn(url);
    });
    pl.populate(pathwayId, pathwayStage, standard, null);
  },
};

module.exports = pl;
