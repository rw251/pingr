const base = require('../base.js');
const data = require('../data.js');
const lookup = require('../lookup');
const state = require('../state.js');
const log = require('../log.js');
const actionPlan = require('./actionPlan.js');
const qualityStandards = require('./qualityStandards');
const $ = require('jquery');
const individualActionPlanTemplate = require('../templates/individual-action-plan.jade');
const actionPlanListTemplate = require('../templates/action-plan-list.jade');
const individualTemplate = require('../templates/individual.jade');

let patientActions = [];
let actionPanel;
let userActionPanel;
let userDefinedPatientActionsObject;
let patientActionsObject;

const iap = {
  create(nhs, pathwayId, pathwayStage, standard) {
    const dataObj = { nhs };
    if (
      data.text.pathways[pathwayId] &&
      data.text.pathways[pathwayId][pathwayStage] &&
      data.text.pathways[pathwayId][pathwayStage].standards[standard]
    ) {
      dataObj.indicator =
        data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText;
    } else {
      dataObj.indicator = null;
    }
    return individualActionPlanTemplate(dataObj);
  },

  show(panel, pathwayId, pathwayStage, standard, patientId) {
    panel.html(iap.create(
      data.getNHS(state.selectedPractice._id, patientId),
      pathwayId,
      pathwayStage,
      standard
    ));
    iap.wireUp(pathwayId, pathwayStage, standard, patientId);
  },

  updateAction(action) {
    // Use actionTextId to find the right row
    const yesbox = actionPanel.find(`tr[data-id="${action.actionTextId}"] label.btn-yes input`);
    const nobox = actionPanel.find(`tr[data-id="${action.actionTextId}"] label.btn-no input`);
    // checked action inactive
    if (action.agree === true) {
      yesbox.each((i, v) => {
        v.checked = true;
      });
      yesbox
        .parent()
        .removeClass('inactive')
        .addClass('active');
      nobox.each((i, v) => {
        v.checked = false;
      });
      nobox
        .parent()
        .removeClass('active')
        .addClass('inactive');
    } else if (action.agree === false) {
      nobox.each((i, v) => {
        v.checked = true;
      });
      nobox
        .parent()
        .removeClass('inactive')
        .addClass('active');
      yesbox.each((i, v) => {
        v.checked = false;
      });
      yesbox
        .parent()
        .removeClass('active')
        .addClass('inactive');
    } else {
      yesbox.each((i, v) => {
        v.checked = false;
      });
      yesbox.parent().removeClass('active inactive');
      nobox.each((i, v) => {
        v.checked = false;
      });
      nobox.parent().removeClass('active inactive');
    }

    yesbox.closest('tr').data('agree', action.agree);

    iap.updateIndividualSapRows();
  },

  wireUp(pathwayId, pathwayStage, standard, patientId) {
    actionPanel = $('#individual-action-panel');
    userActionPanel = $('#user-action-panel');

    userActionPanel
      .on('click', '.edit-plan', (e) => {
        const action =
          userDefinedPatientActionsObject[
            $(e.currentTarget)
              .closest('tr')
              .data('id')
          ];

        $('#editActionPlanItem').val(action.actionText);

        $('#editPlan')
          .off('hidden.bs.modal')
          .on('hidden.bs.modal', () => {
            iap.displayPersonalisedIndividualActionPlan(
              $('#personalPlanIndividual'),
              pathwayId,
              pathwayStage,
              standard
            );
          })
          .off('shown.bs.modal')
          .on('shown.bs.modal', () => {
            $('#editActionPlanItem').focus();
          })
          .off('click', '.save-plan')
          .on('click', '.save-plan', () => {
            const oldActionId = action.actionTextId;
            action.actionText = $('#editActionPlanItem').val();
            action.actionTextId = action.actionText
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
            if (action.actionTextId !== oldActionId) {
              log.updateUserDefinedPatientAction(
                patientId,
                oldActionId,
                action
              );
              delete userDefinedPatientActionsObject[oldActionId];
              if (!userDefinedPatientActionsObject[action.actionTextId]) {
                userDefinedPatientActionsObject[action.actionTextId] = action;
              }
              iap.updateAction(action);
            }
            $('#editPlan').modal('hide');
          })
          .off('keyup', '#editActionPlanItem')
          .on('keyup', '#editActionPlanItem', (eKeyup) => {
            if (eKeyup.which === 13) $('#editPlan .save-plan').click();
          })
          .modal();
      })
      .on('click', '.delete-plan', (e) => {
        const action =
          userDefinedPatientActionsObject[
            $(e.currentTarget)
              .closest('tr')
              .data('id')
          ];

        $('#modal-delete-item').html(action.actionText);

        $('#deletePlan')
          .off('hidden.bs.modal')
          .on('hidden.bs.modal', () => {
            iap.displayPersonalisedIndividualActionPlan(
              $('#personalPlanIndividual'),
              pathwayId,
              pathwayStage,
              standard
            );
          })
          .off('click', '.delete-plan')
          .on('click', '.delete-plan', () => {
            log.deleteUserDefinedPatientAction(
              patientId,
              action.actionTextId,
              () => {
                qualityStandards.update(
                  patientId,
                  pathwayId,
                  pathwayStage,
                  standard
                );
              }
            );
            delete userDefinedPatientActionsObject[action.actionTextId];

            $('#deletePlan').modal('hide');
          })
          .modal();
      })
      .on('click', '.add-plan', (e) => {
        const actionText = $(e.currentTarget)
          .parent()
          .parent()
          .find('textarea')
          .val();
        $(e.currentTarget)
          .parent()
          .parent()
          .find('textarea')
          .val('');
        const actionTextId = actionText.toLowerCase().replace(/[^a-z0-9]/g, '');
        let indicatorList = [];
        if (pathwayId && pathwayStage && standard) {
          indicatorList.push([pathwayId, pathwayStage, standard].join('.'));
        } else {
          indicatorList = patientActions.reduce((prev, curr) => {
            const union = prev.concat(curr.indicatorList);
            return union.filter((item, pos) => union.indexOf(item) === pos);
          }, []);
        }
        log.recordIndividualPlan(
          actionText,
          state.selectedPractice._id,
          patientId,
          indicatorList,
          (err, a) => {
            if (!userDefinedPatientActionsObject[actionTextId]) {
              userDefinedPatientActionsObject[actionTextId] = a;
            }
            iap.displayPersonalisedIndividualActionPlan(
              $('#personalPlanIndividual'),
              pathwayId,
              pathwayStage,
              standard
            );
            qualityStandards.update(
              patientId,
              pathwayId,
              pathwayStage,
              standard
            );
          }
        );
      })
      .on('keyup', 'input[type=text]', (e) => {
        if (e.which === 13) {
          actionPanel.find('.add-plan').click();
        }
      });
    actionPanel
      .on('change', '.btn-toggle input[type=checkbox]', () => {
        /* iap.updateIndividualSapRows(); */
      })
      .on('click', '.btn-undo', () => {})
      .on('click', '.btn-yes', (e) => {
        const AGREE_STATUS = $(e.currentTarget)
          .closest('tr')
          .data('agree');
        const action =
          patientActionsObject[
            $(e.currentTarget)
              .closest('tr')
              .data('id')
          ];

        action.agree = AGREE_STATUS ? null : true;
        if (action.agree) {
          if (!action.history) action.history = [];
          action.history.unshift({
            who: lookup.userName,
            what: 'agreed with',
            when: new Date(),
          });
        }
        log.updateIndividualAction(
          state.selectedPractice._id,
          patientId,
          action,
          () => {
            qualityStandards.update(
              patientId,
              pathwayId,
              pathwayStage,
              standard
            );
          }
        );
        iap.updateAction(action);

        e.stopPropagation();
        e.preventDefault();
      })
      .on('click', '.btn-no', (e) => {
        const AGREE_STATUS = $(e.currentTarget)
          .closest('tr')
          .data('agree');
        const action =
          patientActionsObject[
            $(e.currentTarget)
              .closest('tr')
              .data('id')
          ];

        if (AGREE_STATUS === false) {
          // editing reason
          iap.launchModal(
            data.selected,
            action.actionText,
            action.rejectedReason,
            action.rejectedReasonText,
            true,
            () => {
              if (!action.history) action.history = [];
              action.history.unshift({
                who: lookup.userName,
                what: 'disagreed with',
                when: new Date(),
                why: actionPlan.rejectedReasonText,
              });
              action.agree = false;
              action.rejectedReason = actionPlan.rejectedReason;
              action.rejectedReasonText = actionPlan.rejectedReasonText;
              log.updateIndividualAction(
                state.selectedPractice._id,
                patientId,
                action,
                () => {
                  qualityStandards.update(
                    patientId,
                    pathwayId,
                    pathwayStage,
                    standard
                  );
                }
              );
              iap.updateAction(action);
            },
            null,
            () => {
              action.agree = null;
              delete action.rejectedReason;
              delete action.rejectedReasonText;
              log.updateIndividualAction(
                state.selectedPractice._id,
                patientId,
                action,
                () => {
                  qualityStandards.update(
                    patientId,
                    pathwayId,
                    pathwayStage,
                    standard
                  );
                }
              );
              iap.updateAction(action);
            }
          );
          e.stopPropagation();
          e.preventDefault();
        } else {
          // disagreeing
          iap.launchModal(
            data.selected,
            action.actionText,
            action.rejectedReason,
            action.rejectedReasonText,
            false,
            () => {
              if (!action.history) action.history = [];
              action.history.unshift({
                who: lookup.userName,
                what: 'disagreed with',
                when: new Date(),
                why: actionPlan.rejectedReasonText,
              });
              action.agree = false;
              action.rejectedReason = actionPlan.rejectedReason;
              action.rejectedReasonText = actionPlan.rejectedReasonText;
              log.updateIndividualAction(
                state.selectedPractice._id,
                patientId,
                action,
                () => {
                  qualityStandards.update(
                    patientId,
                    pathwayId,
                    pathwayStage,
                    standard
                  );
                }
              );
              iap.updateAction(action);
            }
          );
          e.stopPropagation();
          e.preventDefault();
        }
      });

    $('#advice-list').off('click', '.show-more-than-3');
    $('#advice-list').on('click', '.show-more-than-3', () => {
      iap.populateIndividualSuggestedActions(
        patientId,
        pathwayId,
        pathwayStage,
        standard,
        true
      );
    });

    $('#advice-list').off('click', '.show-less-than-3');
    $('#advice-list').on('click', '.show-less-than-3', () => {
      iap.populateIndividualSuggestedActions(
        patientId,
        pathwayId,
        pathwayStage,
        standard,
        false
      );
    });

    $('#advice-list').off('click', '.show-more');
    $('#advice-list').on('click', '.show-more', (e) => {
      const id = $(e.currentTarget).data('id');
      const elem = $(`.show-more-row[data-id="${id}"]`);
      if (elem.is(':visible')) {
        $(`.show-more[data-id="${id}"]:first`).show();
        elem.hide();
      } else {
        $('.show-more-row').hide();
        $('.show-more').show();
        $(e.currentTarget).hide();
        elem.show('fast');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    $('#advice-list').off('click', 'tr.show-more-row a:not(.show-more)');
    $('#advice-list').on(
      'click',
      'tr.show-more-row a:not(.show-more)',
      (e) => {
        log.event('nice-link-clicked', window.location.hash, [
          { key: 'link', value: e.currentTarget.href },
        ]);
        e.stopPropagation();
      }
    );

    iap.loadAndPopulateIndividualSuggestedActions(
      patientId,
      pathwayId,
      pathwayStage,
      standard,
      false
    );
  },

  updateIndividualSapRows() {
    // no class - user not yet agreed/disagreed - no background / muted text
    // active - user agrees - green background / normal text
    // success - user completed - green background / strikethrough text
    // danger - user disagrees - red background / strikethrough text

    // TODO *b* inspect and amend danger and success to have more appropriate colours

    $('#advice-list')
      .add('#personalPlanIndividual')
      .find('tr.suggestion')
      .each((i, elRow) => {
        const self = $(elRow);
        const id = self.data('id');
        const all = $(`.show-more-row[data-id="${
          id
        }"],.suggestion[data-id="${
          id
        }"]`);
        let any = false;
        self.find('.btn-toggle input[type=checkbox]:checked').each((ix, elInput) => {
          any = true;
          if (elInput.value === 'yes') {
            all.removeClass('danger');
            all.addClass('active');
            // self.find('td').last().children().show();
            if (patientActionsObject[self.data('id')].history) {
              const tool = $(elInput)
                .closest('tr')
                .hasClass('success')
                ? ''
                : `<p>${
                  base.textFromHistory(patientActionsObject[self.data('id')].history[0])
                }</p><p>Click again to cancel</p>`;
              $(elInput)
                .parent()
                .attr('title', tool)
                .attr('data-original-title', tool)
                .tooltip('fixTitle')
                .tooltip('hide');
            } else {
              $(elInput)
                .parent()
                .attr('title', 'You agreed - click again to cancel')
                .tooltip('fixTitle')
                .tooltip('hide');
            }
          } else {
            all.removeClass('active');
            all.addClass('danger');
            all.removeClass('success');
            if (patientActionsObject[self.data('id')].history) {
              $(elInput)
                .parent()
                .attr(
                  'title',
                  `<p>${
                    base.textFromHistory(patientActionsObject[self.data('id')].history[0])
                  }</p><p>Click again to edit/cancel</p>`
                )
                .tooltip('fixTitle')
                .tooltip('hide');
            } else {
              $(elInput)
                .parent()
                .attr('title', 'You disagreed - click again to edit/cancel')
                .tooltip('fixTitle')
                .tooltip('hide');
            }
          }
        });
        if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length === 1) {
          self
            .find('.btn-toggle input[type=checkbox]:not(:checked)')
            .parent()
            .addClass('inactive')
            .attr('title', '')
            .attr('data-original-title', '')
            .tooltip('fixTitle')
            .tooltip('hide');
        }
        if (!any) {
          all.removeClass('danger');
          all.removeClass('active');
          all.removeClass('success');

          self
            .find('.btn-toggle.btn-yes')
            .attr(
              'title',
              'Click to agree with this action and save it in your agreed actions list  '
            )
            .tooltip('fixTitle')
            .tooltip('hide');
          self
            .find('.btn-toggle.btn-no')
            .attr(
              'title',
              'Click to disagree with this action and remove it from your suggested actions list '
            )
            .tooltip('fixTitle')
            .tooltip('hide');
        }

        // base.wireUpTooltips();
      });
    base.wireUpTooltips();
  },

  displayPersonalisedIndividualActionPlan(
    parentElem,
    pathwayId,
    pathwayStage,
    standard
  ) {
    let indicatorId = null;
    if (pathwayId && pathwayStage && standard) { indicatorId = [pathwayId, pathwayStage, standard].join('.'); }
    const tmpl = actionPlanListTemplate;
    const userDefinedActions = Object.keys(userDefinedPatientActionsObject)
      .map(v => userDefinedPatientActionsObject[v])
      .filter(v => (
        !v.indicatorList ||
          !indicatorId ||
          v.indicatorList.indexOf(indicatorId) > -1
      ));
    parentElem.html(tmpl({
      hasSuggestions: userDefinedActions && userDefinedActions.length > 0,
      suggestions: userDefinedActions,
    }));

    iap.updateIndividualSapRows();
  },

  loadAndPopulateIndividualSuggestedActions(
    patientId,
    pathwayId,
    pathwayStage,
    standard,
    visible
  ) {
    data.getPatientActionData(state.selectedPractice._id, patientId, (
      err,
      a
    ) => {
      patientActionsObject = {};
      userDefinedPatientActionsObject = {};
      a.userDefinedActions.forEach((v) => {
        userDefinedPatientActionsObject[v.actionTextId] = v;
      });
      patientActions = a.actions.map((v) => {
        const rtn = v;
        rtn.indicatorListText = v.indicatorList.map(vv => ({
          id: vv,
          text:
              data.text.pathways[vv.split('.')[0]][vv.split('.')[1]].standards[
                vv.split('.')[2]
              ].tabText,
        }));
        if (v.agree !== true && v.agree !== false) rtn.agree = null;
        patientActionsObject[v.actionTextId] = rtn;
        return rtn;
      });
      iap.populateIndividualSuggestedActions(
        patientId,
        pathwayId,
        pathwayStage,
        standard,
        visible
      );
    });
  },

  refresh(patientId, indicator) {
    const b = indicator.split('.');
    iap.populateIndividualSuggestedActions(patientId, b[0], b[1], b[2], false);
  },

  populateIndividualSuggestedActions(
    patientId,
    pathwayId,
    pathwayStage,
    standard,
    visible
  ) {
    const localData = {
      nhsNumber: data.getNHS(state.selectedPractice._id, patientId),
      patientId,
      visible,
    };

    const suggestions = patientActions.filter(v => (
      v.indicatorList.filter(vv => !data.isExcluded(patientId, vv)).length > 0
    ));

    if (
      suggestions.length === 0 ||
      (pathwayId &&
        pathwayStage &&
        standard &&
        suggestions.filter(v => (
          v.indicatorList.indexOf([pathwayId, pathwayStage, standard].join('.')) > -1
        )).length === 0)
    ) {
      localData.noSuggestions = true;
    } else {
      localData.suggestions = suggestions;

      localData.suggestions = localData.suggestions.filter((v) => {
        if (!pathwayId || !pathwayStage || !standard) return true;
        return (
          v.indicatorList.indexOf([pathwayId, pathwayStage, standard].join('.')) > -1
        );
      });
    }

    $('#advice').show();

    // base.createPanelShow(individualPanel, $('#advice-list'), localData);
    const tmpl = individualTemplate;
    $('#advice-list').html(tmpl(localData));

    // Wire up any clipboard stuff in the suggestions
    const isVision = state.selectedPractice.ehr === 'Vision';
    $('#advice-list')
      .find('span:contains("[COPY")')
      .each((i, el) => {
        const html = $(el).html();
        $(el).html(html.replace(
          /\[COPY:([^\].]*)(\.*)\]/g,
          `${isVision ? '#$1$2' : '$1'
          } <button type="button" data-clipboard-text="${
            isVision ? '#$1$2' : '$1'
          }" data-content="Copied!<br><strong>Use Ctrl + v to paste into ${
            state.selectedPractice.ehr
          }!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ${
            isVision ? '#$1$2' : '$1'
          } to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>`
        ));
      });
    $('#advice-list')
      .find('td:contains("[")')
      .each((i, el) => {
        const html = $(el).html();
        $(el).html(html.replace(
          /\[([^\].]*)(\.*)\]/g,
          ` <button type="button" data-clipboard-text="${
            isVision ? '#$1$2' : '$1'
          }" data-content="Copied!<br><strong>Use Ctrl + v to paste into ${
            state.selectedPractice.ehr
          }!</strong>" data-toggle="tooltip" data-placement="top" title="Copy ${
            isVision ? '#$1$2' : '$1'
          } to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>`
        ));
      });

    $('#advice-list')
      .find('span:contains("[INFO")')
      .each((i, el) => {
        const html = $(el).html();
        const { subsection } = $(el).data();
        const desc =
          data[pathwayId][pathwayStage].standards[
            standard
          ].opportunities.filter(val => val.name === subsection).length > 0
            ? data[pathwayId][pathwayStage].standards[
              standard
            ].opportunities.filter(val => val.name === subsection)[0].desc
            : subsection;
        const tooltip = subsection
          ? `This action is suggested because PINGR classified this patient as:'${
            desc
          }'`
          : '';
        const newHtml =
          ` <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="${
            tooltip
          }"></i>`;
        $(el).html(html.replace(/\[INFO\]/g, newHtml));
      });

    $('#advice-list')
      .find('td:contains("Reasoning")')
      .each((ix, el) => {
        const contents = $(el).contents();
        let i = 0;
        while ($(contents[i]).text() !== 'Reasoning' && i < contents.length) {
          i += 1;
        }
        if (i < contents.length - 1) {
          const reasoning = $(contents[i]);
          const content =
            `Reasoning\r\n${
              $(contents[i + 1])
                .html()
                .replace(/ +/g, ' ')
                .replace(/<li>/g, '  - ')
                .replace(/<\/li>/g, '\r\n')
                .replace(/<\/?strong>/g, '')
                .replace(/&gte;/g, '≥')
                .replace(/&lte;/g, '≤')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/<a.+href=["']([^"']+)["'].*>([^<]+)<\/a>/g, '$2 - $1')
                .replace(/ ?<button.+<\/button>/g, '')}`;
          reasoning.replaceWith(`Reasoning <button type="button" data-clipboard-text="${
            content
          }" data-content="Copied!<br><strong>Use Ctrl + v to paste into ${
            state.selectedPractice.ehr
          }!</strong>" data-toggle="tooltip" data-placement="top" title="Copy reasoning to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>`);
        }
      });

    base.setupClipboard('.btn-copy', true);

    iap.displayPersonalisedIndividualActionPlan(
      $('#personalPlanIndividual'),
      pathwayId,
      pathwayStage,
      standard
    );
  },

  launchModal(
    label,
    value,
    rejectedReason,
    rejectedReasonText,
    isUndo,
    callbackOnSave,
    callbackOnCancel,
    callbackOnUndo
  ) {
    const reasons = [
      {
        reason: 'Already done this',
        value: 'done',
      },
      {
        reason: "Wouldn't work",
        value: 'nowork',
      },
      {
        reason: 'Something else',
        value: 'else',
      },
    ];
    if (rejectedReason) {
      for (let i = 0; i < reasons.length; i += 1) {
        if (reasons[i].reason === rejectedReason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    actionPlan.launchModal(
      {
        header: 'Disagree with a suggested action',
        isUndo,
        item: value,
        placeholder: 'Provide more information here...',
        reasons,
      },
      label,
      value,
      rejectedReasonText || null,
      callbackOnSave,
      callbackOnCancel,
      callbackOnUndo
    );
  },
};

module.exports = iap;
