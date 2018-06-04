const groups = {
  baseline: 'baseline',
  feature: 'feature',
};

// this should be in db
const userCache = {};

module.exports = {
  abTestTest: {
    name: 'abTestTest',
    description: 'This is what we\'re going to do.. make the thumbs up colour blue and see if it effects the number of times it is clicked.',
    featureCode: ($) => {
      // Inject our style into the header if not alredy there
      if ($('#abTestCss').length === 0) {
        $('head').append('<style id="abTestCss" type="text/css"></style>');
      }

      $('#abTestCss').text('.btn.btn-xs.btn-yes.btn-toggle.btn-success{ background-color: blue }');
    },
  },

  assignPerPractice: () => {

  },

  assignPerSession: () => {

  },

  assignPerUser: (test, user) => {
    if (!userCache[test.name]) {
      console.log(`No cache for test: ${test.name}. Created.`);
      userCache[test.name] = {};
    }
    if (!userCache[test.name][user]) {
      console.log(`No user cached for test: ${test.name}. Assigned.`);
      if (Math.random() < 0.5) {
        userCache[test.name][user] = groups.baseline;
      } else {
        userCache[test.name][user] = groups.feature;
      }
    }
    return userCache[test.name][user];
  },

  groups,
};
