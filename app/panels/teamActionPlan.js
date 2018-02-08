const base = require('../base.js');
const data = require('../data.js');
const state = require('../state.js');
const log = require('../log.js');
const actionPlan = require('./actionPlan.js');
const $ = require('jquery');
const teamActionPlanTemplate = require('../templates/team-action-plan.jade');
const teamTemplate = require('../templates/team.jade');
const actionPlanListTemplate = require('../templates/action-plan-list.jade');

let teamActions = [];
let teamActionsObject;
let actionPanel;
let userActionPanel;
let userDefinedTeamActionsObject;

const tap = {
  create(title) {
    return teamActionPlanTemplate({ title });
  },

  show(panel, title, pathwayId, pathwayStage, standard) {
    panel.html(tap.create(title));
    tap.wireUp(pathwayId, pathwayStage, standard);
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

    tap.updateTeamSapRows();
  },

  wireUp(pathwayId, pathwayStage, standard) {
    actionPanel = $('#team-action-panel');
    userActionPanel = $('#user-action-panel');

    let indicatorId = '';
    if (pathwayId && pathwayStage && standard) {
      indicatorId = [pathwayId, pathwayStage, standard].join('.');
    }

    userActionPanel
      .on('click', '.edit-plan', (e) => {
        const action = userDefinedTeamActionsObject[$(e.currentTarget).closest('tr').data('id')];

        $('#editActionPlanItem').val(action.actionText);

        $('#editPlan')
          .off('hidden.bs.modal')
          .on('hidden.bs.modal', () => {
            tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
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
              log.updateUserDefinedTeamAction(oldActionId, action);
              delete userDefinedTeamActionsObject[oldActionId];
              if (!userDefinedTeamActionsObject[action.actionTextId]) {
                userDefinedTeamActionsObject[action.actionTextId] = action;
              }
              tap.updateAction(action);
            }
            $('#editPlan').modal('hide');
          })
          .off('keyup', '#editActionPlanItem')
          .on('keyup', '#editActionPlanItem', (ee) => {
            if (ee.which === 13) $('#editPlan .save-plan').click();
          })
          .modal();
      })
      .on('click', '.delete-plan', (e) => {
        const action = userDefinedTeamActionsObject[$(e.currentTarget).closest('tr').data('id')];

        $('#modal-delete-item').html(action.actionText);

        $('#deletePlan')
          .off('hidden.bs.modal')
          .on('hidden.bs.modal', () => {
            tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
          })
          .off('click', '.delete-plan')
          .on('click', '.delete-plan', () => {
            log.deleteUserDefinedTeamAction(action.actionTextId);
            delete userDefinedTeamActionsObject[action.actionTextId];

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
        log.recordTeamPlan(
          state.selectedPractice._id,
          actionText,
          indicatorId,
          (err, a) => {
            if (!userDefinedTeamActionsObject[actionTextId]) {
              userDefinedTeamActionsObject[actionTextId] = a;
            }
            tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
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
        // tap.updateTeamSapRows();
      })
      .on('click', '.btn-undo', () => {})
      .on('click', '.btn-yes', (e) => {
        const AGREE_STATUS = $(e.currentTarget)
          .closest('tr')
          .data('agree');
        const action =
          teamActionsObject[
            $(e.currentTarget)
              .closest('tr')
              .data('id')
          ];

        action.agree = AGREE_STATUS ? null : true;
        if (action.agree) {
          if (!action.history) action.history = [];
          action.history.unshift({
            who: $('#user_fullname')
              .text()
              .trim(),
            what: 'agreed with',
            when: new Date(),
          });
        }
        log.updateTeamAction(state.selectedPractice._id, indicatorId, action);
        tap.updateAction(action);

        e.stopPropagation();
        e.preventDefault();
      })
      .on('click', '.btn-no', (e) => {
        const AGREE_STATUS = $(e.currentTarget)
          .closest('tr')
          .data('agree');
        const action =
          teamActionsObject[
            $(e.currentTarget)
              .closest('tr')
              .data('id')
          ];

        if (AGREE_STATUS === false) {
          // editing reason
          tap.launchModal(
            data.selected,
            action.actionText,
            action.rejectedReason,
            action.rejectedReasonText,
            true,
            () => {
              if (!action.history) action.history = [];
              action.history.unshift({
                who: $('#user_fullname')
                  .text()
                  .trim(),
                what: 'disagreed with',
                when: new Date(),
                why: actionPlan.rejectedReasonText,
              });
              action.agree = false;
              action.rejectedReason = actionPlan.rejectedReason;
              action.rejectedReasonText = actionPlan.rejectedReasonText;
              log.updateTeamAction(
                state.selectedPractice._id,
                indicatorId,
                action
              );
              tap.updateAction(action);
            },
            null,
            () => {
              action.agree = null;
              delete action.rejectedReason;
              delete action.rejectedReasonText;
              log.updateTeamAction(
                state.selectedPractice._id,
                indicatorId,
                action
              );
              tap.updateAction(action);
            }
          );
          e.stopPropagation();
          e.preventDefault();
        } else {
          // disagreeing
          tap.launchModal(
            data.selected,
            action.actionText,
            action.rejectedReason,
            action.rejectedReasonText,
            false,
            () => {
              if (!action.history) action.history = [];
              action.history.unshift({
                who: $('#user_fullname')
                  .text()
                  .trim(),
                what: 'disagreed with',
                when: new Date(),
                why: actionPlan.rejectedReasonText,
              });
              action.agree = false;
              action.rejectedReason = actionPlan.rejectedReason;
              action.rejectedReasonText = actionPlan.rejectedReasonText;
              log.updateTeamAction(
                state.selectedPractice._id,
                indicatorId,
                action
              );
              tap.updateAction(action);
            }
          );
          e.stopPropagation();
          e.preventDefault();
        }
      });

    $('#advice-list').off('click', '.show-more-than-3');
    $('#advice-list').on('click', '.show-more-than-3', () => {
      tap.populateTeamSuggestedActions(pathwayId, pathwayStage, standard, true);
    });

    $('#advice-list').off('click', '.show-less-than-3');
    $('#advice-list').on('click', '.show-less-than-3', () => {
      tap.populateTeamSuggestedActions(
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

    tap.loadAndPopulateIndividualSuggestedActions(
      pathwayId,
      pathwayStage,
      standard,
      false
    );
  },

  updateTeamSapRows() {
    // no class - user not yet agreed/disagreed - no background / muted text
    // active - user agrees - green background / normal text
    // success - user completed - green background / strikethrough text
    // danger - user disagrees - red background / strikethrough text

    // TODO *b* inspect and amend danger and success to have more appropriate colours

    $('#advice-list')
      .add('#personalPlanTeam')
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
        self.find('.btn-toggle input[type=checkbox]:checked').each((ii, elInput) => {
          any = true;
          if (elInput.value === 'yes') {
            all.removeClass('danger');
            all.addClass('active');
            // self.find('td').last().children().show();
            if (teamActionsObject[self.data('id')].history) {
              const tool = $(elInput)
                .closest('tr')
                .hasClass('success')
                ? ''
                : `<p>${
                  base.textFromHistory(teamActionsObject[self.data('id')].history[0])
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
            if (teamActionsObject[self.data('id')].history) {
              $(elInput)
                .parent()
                .attr(
                  'title',
                  `<p>${
                    base.textFromHistory(teamActionsObject[self.data('id')].history[0])
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

  displayPersonalisedTeamActionPlan(parentElem) {
    const tmpl = actionPlanListTemplate;
    const userDefinedTeamActions = Object
      .keys(userDefinedTeamActionsObject)
      .map(v => userDefinedTeamActionsObject[v]);
    parentElem.html(tmpl({
      hasSuggestions:
          userDefinedTeamActions && userDefinedTeamActions.length > 0,
      suggestions: userDefinedTeamActions,
    }));

    tap.updateTeamSapRows();
  },

  loadAndPopulateIndividualSuggestedActions(
    pathwayId,
    pathwayStage,
    standard,
    visible
  ) {
    data.getTeamActionData(
      state.selectedPractice._id,
      pathwayId && pathwayStage && standard
        ? [pathwayId, pathwayStage, standard].join('.')
        : '',
      (err, a) => {
        teamActionsObject = {};
        userDefinedTeamActionsObject = {};
        a.userDefinedActions.forEach((v) => {
          userDefinedTeamActionsObject[v.actionTextId] = v;
        });
        teamActions = a.actions.map((v) => {
          const rtn = v;
          rtn.indicatorListText = rtn.indicatorList.map(vv => ({
            id: vv,
            text:
                data.text.pathways[vv.split('.')[0]][vv.split('.')[1]]
                  .standards[vv.split('.')[2]].tabText,
          }));
          if (rtn.agree !== true && rtn.agree !== false) rtn.agree = null;
          teamActionsObject[rtn.actionTextId] = rtn;
          return rtn;
        });
        tap.populateTeamSuggestedActions(
          pathwayId,
          pathwayStage,
          standard,
          visible
        );
      }
    );
  },

  populateTeamSuggestedActions(
    pathwayId,
    pathwayStage,
    standard,
    visible
  ) {
    const localData = { visible };

    if (teamActions.length === 0) {
      localData.noSuggestions = true;
    } else {
      localData.suggestions = teamActions;
    }

    $('#advice').show();

    // base.createPanelShow(teamPanel, $('#advice-list'), localData);
    const tmpl = teamTemplate;
    $('#advice-list').html(tmpl(localData));

    // Wire up any clipboard stuff in the suggestions
    const isVision = state.selectedPractice.ehr === 'Vision';
    $('#advice-list')
      .find('span:contains("[COPY")')
      .each((i, elem) => {
        const html = $(elem).html();
        $(elem).html(html.replace(
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
      .find('span:contains("[")')
      .each((i, elem) => {
        const html = $(elem).html();
        $(elem).html(html.replace(
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
      .each((i, elem) => {
        const html = $(elem).html();
        const { subsection } = $(elem).data();
        const desc =
          data[pathwayId][pathwayStage].standards[
            standard
          ].opportunities.filter(val => val.name === subsection).length > 0
            ? data[pathwayId][pathwayStage].standards[
              standard
            ].opportunities.filter(val => val.name === subsection)[0].desc
            : subsection;
        const tooltip = subsection
          ? `This action is suggested because PINGR classified this indcicator as:'${desc}'`
          : '';
        const newHtml =
          ` <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="${
            tooltip
          }"></i>`;
        $(elem).html(html.replace(/\[INFO\]/g, newHtml));
      });

    $('#advice-list')
      .find('td:contains("Reasoning")')
      .each((ix, elem) => {
        const contents = $(elem).contents();
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
                .replace(/<a.+href=["']([^"']+)["'].*>([^<]+)<\/a>/g, '$2 - $1')}`;
          reasoning.replaceWith(`Reasoning <button type="button" data-clipboard-text="${
            content
          }" data-content="Copied!<br><strong>Use Ctrl + v to paste into ${
            state.selectedPractice.ehr
          }!</strong>" data-toggle="tooltip" data-placement="top" title="Copy reasoning to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>`);
        }
      });

    base.setupClipboard('.btn-copy', true);

    tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
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
        reason: "We've already done this",
        value: 'done',
      },
      {
        reason: "It wouldn't work",
        value: 'nowork',
      },
      {
        reason: 'Other',
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
        placeholder: 'Enter free-text here...',
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

module.exports = tap;
