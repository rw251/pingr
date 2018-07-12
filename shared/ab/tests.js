module.exports = {
  'Blue thumbs': {
    init: ($) => {
      if ($('#blueThumbCss').length === 0) {
        $('head').append('<style id="blueThumbCss" type="text/css"></style>');
      }
      $('#blueThumbCss').text('.btn.btn-xs.btn-yes.btn-toggle.btn-success{ background-color: blue }');
    },
    pullDown: ($) => {
      $('#blueThumbCss').remove();
    },
    description: '',
    readyToDeploy: 'true',
    researchQuestion: 'Do people agree with more actions if the thumbs are blue instead of green?',
  },
  Grey: {
    description: '',
    researchQuestion: 'Are grey thumbs clicked more than red thumbs?',
    init: ($) => {
      if ($('#greyCss').length === 0) {
        $('head').append('<style id="greyCss" type="text/css"></style>');
      }
      $('#greyCss').text('.btn.btn-xs.btn-no.btn-toggle.btn-danger{ background-color: grey }');
    },
    pullDown: ($) => {
      $('#greyCss').remove();
    },
    readyToDeploy: 'false',
  },
};
