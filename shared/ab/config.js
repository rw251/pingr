const tests = require('./tests');

const groups = {
  baseline: 'baseline',
  feature: 'feature',
};

const statuses = {
  new: { id: 'new', description: 'New' },
  configured: { id: 'configured', description: 'Configured' },
  running: { id: 'running', description: 'Running' },
  paused: { id: 'paused', description: 'Paused' },
  archived: { id: 'archived', description: 'Archived' },
  completed: { id: 'completed', description: 'Completed' },
};

const randomisationTypes = {
  perPage: { id: 'perPage', name: 'Per page view', description: 'Assigned to random group on every page visit' },
  perPatientViewed: { id: 'perPatientViewed', name: 'Per patient view', description: 'Assigned to random group on every patient page visit' },
  perSession: { id: 'perSession', name: 'Per session', description: 'Assigned to random group on every login' },
  perUser: { id: 'perUser', name: 'Per user', description: 'Assigned to random group on first login' },
};

const trials = {
  pageView: { id: 'pageView', name: 'Page view', description: 'A single trial is the viewing of a single page.' },
  patientView: { id: 'patientView', name: 'Patient page view', description: 'A single trial is the viewing of a single patient page.' },
};

const outcomes = { thumbClicks: { id: 'thumbClicks', name: 'Thumb clicks', description: 'Whether or not a thumb was clicked during the trial.' } };

// this should be in db
const userCache = {};

// load all test files


module.exports = {

  assign: (test) => {
    switch (test.randomisationType) {
      case randomisationTypes.perPractice.id:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
      case randomisationTypes.perUser.id:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
      case randomisationTypes.perPage.id:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
      case randomisationTypes.perPatientViewed.id:
        return Math.random() < 0.5 ? groups.baseline : groups.feature;
      default: // randomisationTypes.perSession.id:
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
  trials,
  outcomes,
  statusArray: Object.keys(statuses).map(v => statuses[v]),
  randomisationTypeArray: Object.keys(randomisationTypes).map(v => randomisationTypes[v]),
  trialArray: Object.keys(trials).map(v => trials[v]),
};
