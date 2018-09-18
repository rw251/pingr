const $ = require('jquery');
const lookup = require('./lookup');
const abConfig = require('../shared/ab/config');

// don't cache always fetch
const getRunningTests = (randomisationTypeIds, callback) =>
  $.getJSON(`/ab/running?randomisationTypeId=${randomisationTypeIds.join('&randomisationTypeId=')}`, tests => callback(tests));

module.exports = {

  clearPageGroups: () => {
    if (lookup.pageGroups) {
      lookup.pageGroups.forEach((test) => {
        delete lookup.tests[test];
      });
    }
  },

  process: (randomisationTypeIds, callback) => {
    if (!lookup.tests) lookup.tests = {};
    if (!lookup.pageGroups) lookup.pageGroups = [];
    getRunningTests(randomisationTypeIds, (tests) => {
      if (tests) {
        tests.forEach((test) => {
          // assign the user to a group (might be already defined)
          test.group = abConfig.assign(test);
          // add to the state object
          lookup.tests[test.name] = test.group;

          // keep track of perPage and perPatientView
          if (test.randomisationTypeId === abConfig.randomisationTypes.perPage.id ||
            test.randomisationTypeId === abConfig.randomisationTypes.perPatientViewed.id) {
            lookup.pageGroups.push(test.name);
          }

          // if the user is in the feature group execute
          abConfig.init($, test);
          console.log(`User ${lookup.userName} assigned to the '${test.group}' group for test '${test.name}'`);
        });
      }
      if (callback) callback();
    });
  },

};

