const base = require('../base.js');
const log = require('../log.js');
const data = require('../data.js');
const state = require('../state');
const overviewTableTemplate = require('../templates/overview-table.jade');
require('jquery-sparkline');

let tableProcessIndicators;
let tableOutcomeIndicators;
const format = description => (`${
  '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
    '<tr>' +
      '<td>'}${description}</td>` +
    '</tr>' +
  '</table>'
);

const indicatorList = {
  show(panel, isAppend, loadContentFn) {
    data.getAllIndicatorData(null, false, (indicators) => {
      indicators.sort((a, b) => {
        if (a.performance.percentage === b.performance.percentage) return 0;
        if (
          Number.isNaN(a.performance.percentage) ||
          a.name.toLowerCase().indexOf('beta test') > -1
        ) { return 1; }
        if (
          Number.isNaN(b.performance.percentage) ||
          b.name.toLowerCase().indexOf('beta test') > -1
        ) { return -1; }
        return a.performance.percentage - b.performance.percentage;
      });
      const tmpl = overviewTableTemplate;
      const processIndicators = indicators.filter(v => v.type === 'process');
      const outcomeIndicators = indicators.filter(v => v.type === 'outcome');
      const html = tmpl({
        processIndicators,
        outcomeIndicators,
        selectedTab: state.getTab('overview'),
      });
      if (isAppend) {
        panel.append(html);
      } else {
        //* b* maintain state
        // - state maintainance causes a bug in this place
        // TODO build a version of state maintainance that doesnt reload if tab is pressed
        base.savePanelState();
        panel.html(html);
      }

      $('#processIndicators .inlinesparkline').sparkline('html', {
        tooltipFormatter(sparkline, options, fields) {
          const dts =
            processIndicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return `${dts[fields.x]}: ${fields.y}%`;
        },
        width: '100%',
      });

      $('#outcomeIndicators .inlinesparkline').sparkline('html', {
        tooltipFormatter(sparkline, options, fields) {
          const dts =
            outcomeIndicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return `${dts[fields.x]}: ${fields.y}%`;
        },
        width: '100%',
      });

      tableOutcomeIndicators = $('#overview-table-outcomes').DataTable({
        searching: true, // we want a search box
        paging: false, // always want all indicators
        stateSave: true, // let's remember which page/sorting etc
        dom: '<"pull-right small-pad-top-right"f><"pull-right small-pad-top-right"B>rt<"clear">',
        scrollY: '50vh',
        scrollCollapse: true,
        buttons: ['colvis'],
      });

      tableProcessIndicators = $('#overview-table-process').DataTable({
        searching: true, // we want a search box
        paging: false, // always want all indicators
        stateSave: true, // let's remember which page/sorting etc
        dom: '<"pull-right small-pad-top-right"f><"pull-right small-pad-top-right"B>rt<"clear">',
        columnDefs: [{ width: '90px', targets: 6 }],
        order: [[1, 'desc']],
        scrollY: '50vh',
        scrollCollapse: true,
        buttons: ['colvis'],
      });

      // $('#overview-table-process, #overview-table-outcomes').floatThead({
      //   position: 'absolute',
      //   scrollContainer: true,
      //   zIndex:50
      // });

      setTimeout(() => {
        tableProcessIndicators.columns.adjust().draw(false);
        tableOutcomeIndicators.columns.adjust().draw(false);

        base.setupClipboard('.btn-copy', true);
        base.wireUpTooltips();
      }, 100);

      indicatorList.wireUp(panel, loadContentFn);
    });
  },

  populate() {},

  wireUp(panel, loadContentFn) {
    panel.off('click', 'tr.show-more-row a');
    panel.on('click', 'tr.show-more-row a', (e) => {
      log.event('nice-link-clicked', window.location.hash, [
        { key: 'link', value: e.currentTarget.href },
      ]);
      e.stopPropagation();
    });
    panel.off('click', 'tr.standard-row,tr.show-more-row');
    panel.on('click', 'tr.standard-row,tr.show-more-row', (e) => {
      const url = $(e.currentTarget)
        .data('id')
        .replace(/\./g, '/');
      window.history.pushState(null, null, `#indicators/${url}`);
      loadContentFn(`#indicators/${url}`);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    panel.off('mouseenter', '.show-more-row,.standard-row');
    panel.off('mouseleave', '.show-more-row,.standard-row');
    panel.on('mouseenter', '.show-more-row,.standard-row', (e) => {
      const id = $(e.currentTarget).data('id');
      $(`.show-more-row[data-id="${
        id
      }"],.standard-row[data-id="${
        id
      }"]`).addClass('hover');
    });
    panel.on('mouseleave', '.show-more-row,.standard-row', (e) => {
      const id = $(e.currentTarget).data('id');
      $(`.show-more-row[data-id="${
        id
      }"],.standard-row[data-id="${
        id
      }"]`).removeClass('hover');
    });

    panel.off('click', '#overview-table-process .show-more');
    panel.on('click', '#overview-table-process .show-more', (e) => {
      const tr = $(e.currentTarget).closest('tr');
      const row = tableProcessIndicators.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(format(tr.data('description'))).show();
        tr.addClass('shown');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    panel.off('click', '#overview-table-outcomes .show-more');
    panel.on('click', '#overview-table-outcomes .show-more', (e) => {
      const tr = $(e.currentTarget).closest('tr');
      const row = tableOutcomeIndicators.row(tr);
      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        row.child(format(tr.data('description'))).show();
        tr.addClass('shown');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', () => {
      $.sparkline_display_visible(); // ensure sparklines on hidden tabs display
      // setTimeout(function(){
      tableProcessIndicators.columns.adjust().draw('page'); // ensure column headers are correct
      // },200);
      tableOutcomeIndicators.columns.adjust().draw(false); // ensure column headers are correct
      // e.target // newly activated tab
      // e.relatedTarget // previous active tab
    });

    $('#overview-table-outcomes').on('draw.dt', () => {
      $.sparkline_display_visible(); // ensure sparklines on hidden tabs display
      // tableOutcomeIndicators.columns.adjust().draw(false); //ensure column headers are correct
      // console.log(`Redraw occurred at: ${new Date().getTime()}`);
    });

    $('#overview-table-process').on('draw.dt', () => {
      $.sparkline_display_visible(); // ensure sparklines on hidden tabs display
      // tableProcessIndicators.columns.adjust().draw(false); //ensure column headers are correct
      // console.log(`Redraw occurred at: ${new Date().getTime()}`);
    });

    $('#overview-table-process, #overview-table-outcomes').floatThead('reflow');
  },
};

module.exports = indicatorList;
