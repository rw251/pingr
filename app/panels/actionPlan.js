var ap = {

  launchModal: function(data, label, value, reasonText, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var tmpl = require("../templates/modal-why");

    if (data.reasons && data.reasons.length > 0) data.hasReasons = true;

    $('#modal').html(tmpl(data));

    if (reasonText) {
      $('#modal textarea').val(reasonText.trim());
    }
    ap.modalSaved = false;
    ap.modalUndo = false;

    $('#modal .modal').off('shown.bs.modal').on('shown.bs.modal', function (e) {
      $('#modal-why-text').focus();
    });

    $('#modal .modal').off('click', '.undo-plan').on('click', '.undo-plan', function(e) {
      ap.modalUndo = true;
    }).off('submit', 'form').on('submit', 'form', {
      "label": label
    }, function(e) {
      if (!e.data.label) e.data.label = "team";
      var reason = $('input:radio[name=reason]:checked').val();
      var reasonText = $('#modal textarea').val();

      ap.rejectedReason = reason;
      ap.rejectedReasonText = reasonText;

      ap.modalSaved = true;

      e.preventDefault();
      $('#modal .modal').modal('hide');
    }).modal();

    $('#modal').off('hidden.bs.modal').on('hidden.bs.modal', {
      "label": label
    }, function(e) {
      if (ap.modalSaved) {
        ap.modalSaved = false;
        if (callbackOnSave) callbackOnSave();
      } else if (ap.modalUndo) {
        ap.modalUndo = false;
        if (callbackOnUndo) callbackOnUndo();
      } else {
        //uncheck as cancelled. - but not if value is empty as this unchecks everything - or if already checked
        if (callbackOnCancel) callbackOnCancel();
      }
    });
  }

};

module.exports = ap;
