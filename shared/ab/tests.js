module.exports = {
  'Blue thumbs': {
    init: ($) => {
      if ($('#abTestCss').length === 0) {
        $('head').append('<style id="abTestCss" type="text/css"></style>');
      }
      $('#abTestCss').text('.btn.btn-xs.btn-yes.btn-toggle.btn-success{ background-color: blue }');
    },
    description: 'Do people click blue thumbs more than green thumbs',
  },
  test: {
    init: ($) => {
      // INSERT TEST CODE HERE
    },
    description: 'a fasdfas df',
  },
};
