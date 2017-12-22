const $ = require('jquery');
const modalWhyTemplate = require('../templates/modal-why.jade');

const ap = {
  launchModal(
    data,
    label,
    value,
    reasonText,
    callbackOnSave,
    callbackOnCancel,
    callbackOnUndo
  ) {
    const tmpl = modalWhyTemplate;
    const templateData = data;

    if (data.reasons && data.reasons.length > 0) templateData.hasReasons = true;

    $('#modal').html(tmpl(templateData));

    if (reasonText) {
      $('#modal textarea').val(reasonText.trim());
    }
    ap.modalSaved = false;
    ap.modalUndo = false;

    $('#modal .modal')
      .off('shown.bs.modal')
      .on('shown.bs.modal', () => {
        $('#modal-why-text').focus();
      });

    $('#modal .modal')
      .off('click', '.undo-plan')
      .on('click', '.undo-plan', () => {
        ap.modalUndo = true;
      })
      .off('submit', 'form')
      .on(
        'submit',
        'form',
        {
          label,
        },
        (e) => {
          if (!e.data.label) {
            // e.data.label = 'team';
            console.warn('Hopefyully we dont get here');
          }
          const reason = $('input:radio[name=reason]:checked').val();
          const localReasonText = $('#modal textarea').val();

          ap.rejectedReason = reason;
          ap.rejectedReasonText = localReasonText;

          ap.modalSaved = true;

          e.preventDefault();
          $('#modal .modal').modal('hide');
        }
      )
      .modal();

    $('#modal')
      .off('hidden.bs.modal')
      .on(
        'hidden.bs.modal',
        {
          label,
        },
        () => {
          if (ap.modalSaved) {
            ap.modalSaved = false;
            if (callbackOnSave) callbackOnSave();
          } else if (ap.modalUndo) {
            ap.modalUndo = false;
            if (callbackOnUndo) callbackOnUndo();
          } else if (callbackOnCancel) {
            callbackOnCancel();
            // uncheck as cancelled. - but not if value is empty as
            // this unchecks everything - or if already checked
          }
        }
      );
  },
};

module.exports = ap;
