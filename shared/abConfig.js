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
  },

  assignUser: (test, user) => {
    if (!userCache[test]) userCache[test] = {};
    if (!userCache[test][user]) {
      if (Math.random() < 0.5) {
        userCache[test][user] = groups.baseline;
      } else {
        userCache[test][user] = groups.feature;
      }
    }
    return userCache[test][user];
  },

  groups,
};
