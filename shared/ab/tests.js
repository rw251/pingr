module.exports = {
  doesit: {
    researchQuestion: 'Does this new thing happen more?',
    init: ($) => {
      if ($('#blueThumbCss').length === 0) {
        $('head').append('<style id="blueThumbCss" type="text/css"></style>');
      }
      $('#blueThumbCss').text('.btn.btn-xs.btn-yes.btn-toggle.btn-success{ background-color: blue }');
    },
    pullDown: ($) => {
      $('#blueThumbCss').remove();
    },
    readyToDeploy: 'true',
  },
  green_Test: {
    researchQuestion: 'Do light green..?',
    init: ($) => {
      if ($('#blueThumbCss').length === 0) {
        $('head').append('<style id="lightGreenCss" type="text/css"></style>');
      }
      $('#lightGreenCss').text('.btn.btn-xs.btn-yes.btn-toggle.btn-success{ background-color: lightgreen }');
    },
    pullDown: ($) => {
      $('#lightGreenCss').remove();
    },
    readyToDeploy: 'true',
  },
};
