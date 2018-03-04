const events = require('./events');

const JTT = {
  init: () => {
    $(document).on('ready', () => {
      // Wire up global click/hover listener
      events.listen();

      // and tooltips
      $('[data-toggle="tooltip"]').tooltip();

      $('#emailPrefs').validate({
        rules: {
          patientsToInclude: {
            required: true,
            minlength: 1,
          },
        },
        messages: {
          patientsToInclude:
            "Please select at least one. If you don't want to receive emails - change the email frequency above to 'never'",
        },
        errorPlacement: (error) => {
          error.appendTo('#errors');
        },
        invalidHandler() {
          $('#errorAlert').show();
        },
        showErrors(errorMap, errorList) {
          if (errorList.length === 0) $('#errorAlert').hide();
          else $('#errorAlert').show();
          this.defaultShowErrors();
        },
      });

      // and email sample if available
      $('#sampleEmail').on('click', (e) => {
        e.preventDefault();
        $('#modalLoader').show();
        $('#modalContent').hide();
        $.ajax({
          url: '/emailsample',
          success(email) {
            $('#modalLoader').fadeOut(() => {
              $('#modalContent')
                .html(email)
                .show();
            });
          },
          error(err) {
            console.error(err);
          },
        });
      });

      // auto hide alerts
      setTimeout(() => {
        $('.alert-autoclose').slideUp(() => {
          $('.alert-autoclose').remove();
        });
      }, 5000);
    });
  },
};

module.exports = JTT;
