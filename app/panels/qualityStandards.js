const base = require('../base');
const data = require('../data');
const state = require('../state');
const log = require('../log');
const $ = require('jquery');
const qualityStandardTemplate = require('../templates/quality-standard.jade');
const modalExcludeTemplate = require('../templates/modal-exclude.jade');

const deleteRow = (row, callback) => {
  const $rowToAnimate = $(row.children('td').css({ backgroundColor: 'red', color: 'white' }));
  setTimeout(() => {
    $rowToAnimate
      .animate({ paddingTop: 0, paddingBottom: 0 }, 500)
      .wrapInner('<div />')
      .children()
      .slideUp(500, () => {
        $rowToAnimate
          .closest('tr')
          .remove();
        return callback();
      });
  }, 350);
};

const qs = {
  actionPlanRefresh: {},

  create(patientId, pathwayId, pathwayStage, standard) {
    const patientData = data.getPatientData(patientId);

    const tmpl = qualityStandardTemplate;
    // RW TEMP fix
    patientData.standards = patientData.standards
      .map((v) => {
        if (!v.indicatorId) {
          let iid;
          Object.keys(data.text.pathways).forEach((vv) => {
            Object.keys(data.text.pathways[vv]).forEach((vvv) => {
              Object.keys(data.text.pathways[vv][vvv].standards).forEach((vvvv) => {
                if (
                  data.text.pathways[vv][vvv].standards[vvvv].tabText ===
                    v.display
                ) {
                  iid = [vv, vvv, vvvv].join('.');
                }
              });
            });
          });
          if (iid) v.indicatorId = iid;
        }
        if (v.indicatorId) {
          v.excluded = data.isExcluded(patientId, v.indicatorId);
          if (v.excluded) {
            v.excludedTooltip = data.getExcludedTooltip(
              patientId,
              v.indicatorId
            );
          }
          v.indicatorDescription =
            data.text.pathways[v.indicatorId.split('.')[0]][
              v.indicatorId.split('.')[1]
            ].standards[v.indicatorId.split('.')[2]].description;
        }
        return v;
      })
      .sort((a, b) => {
        if (a.excluded && b.excluded) return 0;
        if (a.excluded === b.excluded) {
          if (a.targetMet === b.targetMet) return 0;
          else if (a.targetMet) return 1;
          return -1;
        }
        if (a.excluded) return 1;
        return -1;
      });

    const processStandards = patientData.standards.filter(v => v.type === 'process');

    const outcomeStandards = patientData.standards.filter(v => v.type === 'outcome');
    //
    const html = tmpl({
      noStandards: patientData.standards.length === 0,
      processStandards,
      outcomeStandards,
      indicatorId:
        pathwayId && pathwayStage && standard
          ? [pathwayId, pathwayStage, standard].join('.')
          : null,
      patientId,
      selectedTab: state.getTab('individual'),
    });

    return html;
  },

  show(
    panel,
    isAppend,
    patientId,
    pathwayId,
    pathwayStage,
    standard,
    refreshFn
  ) {
    qs.actionPlanRefresh = refreshFn;

    const html = qs.create(patientId, pathwayId, pathwayStage, standard);

    if (isAppend) panel.append(html);
    else {
      //* b* maintain state
      base.savePanelState();
      panel.html(html);
    }

    panel
      .off('click', '.reason-link')
      .on('click', '.reason-link', (e) => {
        const action = $(e.currentTarget).html();
        panel.find('.qs-show-more-row').hide();
        panel
          .find('.reason-link')
          .html('Show more <i class="fa fa-caret-down"></i>');
        if (action.indexOf('Show more') > -1) {
          panel
            .find(`.qs-show-more-row[data-id="${$(e.currentTarget).data('id')}"]`)
            .show('fast');
          $(e.currentTarget).html('Show less <i class="fa fa-caret-up"></i>');
        }

        e.preventDefault();
      })
      .off('click', '.exclude')
      .on('click', '.exclude', (e) => {
        const tmpl = modalExcludeTemplate;
        const indicatorId = $(e.currentTarget).data('id');
        const bits = indicatorId.split('.');
        const row = $(e.currentTarget)
          .parent()
          .parent();

        $('#modal').html(tmpl({
          nhs: data.getNHS(state.selectedPractice._id, patientId),
          indicator:
              data.text.pathways[bits[0]][bits[1]].standards[bits[2]].tabText,
        }));

        $('#modal .modal')
          .off('submit', 'form')
          .on('submit', 'form', (e) => {
            const freetext = $('#modal textarea').val();

            log.excludePatient(
              state.selectedPractice._id,
              patientId,
              indicatorId,
              $('[name="reason"]:checked').val(),
              freetext
            );

            // hide row
            deleteRow(row, () => {
              qs.actionPlanRefresh(patientId, indicatorId);
              qs.updateFromId(patientId, indicatorId);
            });

            e.preventDefault();
            $('#modal .modal').modal('hide');
          })
          .modal();
      })
      .off('click', '.include')
      .on('click', '.include', (e) => {
        const indicatorId = $(e.currentTarget).data('id');
        qs.actionPlanRefresh(patientId, indicatorId);
        log.includePatient(state.selectedPractice._id, patientId, indicatorId);
        qs.updateFromId(patientId, indicatorId);
      });
  },

  updateFromId(patientId, indicatorId) {
    const bits = indicatorId.split('.');
    qs.update(patientId, bits[0], bits[1], bits[2]);
  },

  update(patientId, pathwayId, pathwayStage, standard) {
    const html = qs.create(patientId, pathwayId, pathwayStage, standard);

    $('#qs').replaceWith(html);

    base.wireUpTooltips();
  },
};

module.exports = qs;
