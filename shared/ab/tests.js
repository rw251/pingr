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
    description: 'Do people click blue thumbs more than green thumbs?',
    readyToDeploy: 'true',
  },
  'New test': {
    description: 'Another test',
    init: ($) => {
      // INSERT TEST CODE HERE
    },
    pullDown: ($) => {
      // INSERT TEST CODE HERE
    },
    readyToDeploy: 'false',
  },
  "Ben's test": {
    description: 'asdfasdflk jlasdfj',
    init: ($) => {
      // INSERT TEST CODE HERE
    },
    pullDown: ($) => {
      // INSERT TEST CODE HERE
    },
    readyToDeploy: 'false',
  },
  'And one more': {
    description: 'lll',
    init: ($) => {
      // INSERT TEST CODE HERE
    },
    pullDown: ($) => {
      // INSERT TEST CODE HERE
    },
    readyToDeploy: 'false',
  },
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
};
