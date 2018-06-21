// Each test is the same as the name in the db
// Must contain an init method - which is executed on login
// init can be empty
// Can define other functions as well

module.exports = {
  abTestTest: {
    init: ($) => {
      if ($('#abTestCss').length === 0) {
        $('head').append('<style id="abTestCss" type="text/css"></style>');
      }
      $('#abTestCss').text('.btn.btn-xs.btn-yes.btn-toggle.btn-success{ background-color: blue }');
    },
  },
};

