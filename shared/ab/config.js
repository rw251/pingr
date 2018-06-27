const tests = require('./tests');

const groups = {
  baseline: 'baseline',
  feature: 'feature',
};

const statuses = {
  new: 'new',
  configured: 'configured',
  running: 'running',
  paused: 'paused',
  archived: 'archived',
  completed: 'completed',
};

const randomisationTypes = {
  perSession: 'perSession',
  perUser: 'perUser',
  perPractice: 'perPractice',
};

// this should be in db
const userCache = {};

// load all test files


module.exports = {

  assign: (test) => {
    switch (test.randomisationTypes) {
      case randomisationTypes.perPractice:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
      case randomisationTypes.perUser:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
      default: // randomisationTypes.perSession:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
    }
  },

  init: ($, test) => {
    if (test.group === groups.feature) {
      tests[test.name].init($);
    }
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
  statuses,
  randomisationTypes,
};
