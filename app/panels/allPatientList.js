const base = require('../base.js');
const data = require('../data.js');
const state = require('../state.js');
const allPatientListTemplate = require('../templates/all-patient-list.jade');
const allPatientListWrapperTemplate = require('../templates/all-patient-list-wrapper.jade');

require('floatthead');

let patientsPanel;

const pl = {
  wireUp(onPatientSelected) {
    patientsPanel = $('#all-patient-list');

    patientsPanel
      .on('click', 'thead tr th.sortable', (e) => {
        // Sort columns when column header clicked
        const sortAsc = !$(e.currentTarget).hasClass('sort-asc');
        if (sortAsc) {
          $(e.currentTarget)
            .removeClass('sort-desc')
            .addClass('sort-asc');
        } else {
          $(e.currentTarget)
            .removeClass('sort-asc')
            .addClass('sort-desc');
        }
        pl.populate(
          pl.state[0],
          pl.state[1],
          pl.state[2],
          pl.state[3],
          $(e.currentTarget).index(),
          sortAsc
        );
      })
      .on('click', 'tbody tr.list-item', (e) => {
        // Select individual patient when row clicked#
        const callback = onPatientSelected.bind(e.currentTarget);
        const patientId = $(e.currentTarget)
          .find('td button')
          .attr('data-patient-id');
        callback(patientId);
        e.preventDefault();
        e.stopPropagation();
      })
      .on('click', 'tbody tr button', (e) => {
        // don't want row selected if just button pressed?
        e.preventDefault();
        e.stopPropagation();
      })
      .on('click', 'tbody tr a', (e) => {
        // don't want row selected if just hyperlink pressed?

        $('.indicatorList').hide();

        if ($(e.currentTarget).hasClass('hideIndicators')) {
          $(`.hideIndicators[data-id=${$(e.currentTarget).data('id')}]`).hide();
          $('.showIndicators').show();
        } else {
          $('.showIndicators').show();
          $(`.showIndicators[data-id=${$(e.currentTarget).data('id')}]`).hide();
          $('.hideIndicators').hide();
          $(`.indicatorList[data-id="${$(e.currentTarget).data('id')}"]`).show();
          $(`.hideIndicators[data-id="${$(e.currentTarget).data('id')}"]`).show();
        }

        e.preventDefault();
        e.stopPropagation();
      })
      .on('click', '#downloadPatientList', () => {
        // writePdf();
      })
      .on('click', '#downloadAsPdf', (e) => {
        // writePdf();
        e.preventDefault();
      })
      .on('click', '#downloadAsText', (e) => {
        // writeToFile(currentPatients.patients.map(v => v.nhs));
        e.preventDefault();
      });
  },

  populate(skip, limit, sortField, sortAsc) {
    pl.state = [skip, limit, sortField, sortAsc];

    data.getAllPatientList(state.selectedPractice._id, skip, limit, (
      err,
      list
    ) => {
      const patients = list.map((v) => {
        const rtn = v;
        rtn.indicatorNames = v.indicators.map(vv => data.getDisplayTextFromIndicatorId(vv));
        if (v.indicatorsWithAction) {
          rtn.indicatorsWithActionsNames = v.indicatorsWithAction
            .map(vv => data.getDisplayTextFromIndicatorId(vv));
        }
        return rtn;
      });

      const tmpl = allPatientListTemplate;
      const html = tmpl({
        patients,
        skip,
        limit,
        selectedPractice: state.selectedPractice,
      });
      $('#all-patient-list').html(html);

      base.setupClipboard('.btn-copy', true);
      base.wireUpTooltips();

      base.hideLoading();
      $('#allPatientTable').floatThead({
        position: 'absolute',
        scrollContainer: true,
        zIndex: 50,
      });
    });
  },

  show(panel, isAppend, skip, limit, loadContentFn) {
    const html = allPatientListWrapperTemplate();
    if (isAppend) panel.append(html);
    else panel.html(html);

    pl.wireUp((patientId) => {
      const url = `#patient/${patientId}`;
      window.history.pushState(null, null, url);
      loadContentFn(url);
    });
    pl.populate(skip, limit);
  },
};

module.exports = pl;
