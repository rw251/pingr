const Test = require('../../models/ab/test');
const { statuses, randomisationTypeArray, trialArray } = require('../../../shared/ab/config');
const benchCtl = require('./outcomes');
const hitCtl = require('./trials');
const testConfigs = require('../../../shared/ab/tests');

let localMetrics = [];

const isTestFullyConfigured = test => test.name &&
                                      test.researchQuestion &&
                                      test.randomisationType &&
                                      test.trial &&
                                      test.outcomeId;

module.exports = {

  index: (req, res) => {
    const query = req.query.showArchived ? {} : { status: { $ne: statuses.archived.id } };
    Test.find(query, (err, tests) => {
      const testMods = tests.map((test) => {
        if (test.outcomeId) {
          test.outcome = benchCtl.nameFromId(test.outcomeId);
        }
        test.readyToDeploy = testConfigs[test.name] ? testConfigs[test.name].readyToDeploy === 'true' : false;
        return test;
      });
      res.render('pages/ab/index.jade', { tests: testMods, showArchived: req.query.showArchived });
    });
  },

  running: (req, res) => {
    Test.find({ status: statuses.running.id }, (err, tests) => {
      res.send(tests);
    });
  },

  create: {
    get: (req, res) => {
      benchCtl.getAll((getAllErr, outcomes) => {
        localMetrics = outcomes;
        res.render('pages/ab/create.jade', { test: {}, outcomes, randomisationTypeArray, trialArray });
      });
    },
    post: (req, res) => {
      const newTest = new Test(req.body);
      if (isTestFullyConfigured(newTest)) newTest.status = statuses.configured.id;
      else newTest.status = statuses.new.id;
      newTest.save((err) => {
        if (err) res.render('pages/ab/create.jade', { test: newTest, message: { error: err }, outcomes: localMetrics, randomisationTypeArray, trialArray });
        else res.redirect('/ab');
      });
    },
  },

  configure: {
    get: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        benchCtl.getAll((getAllErr, outcomes) => {
          res.render('pages/ab/configure.jade', { test, outcomes, randomisationTypeArray, trialArray });
        });
      });
    },
    post: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        test.name = req.body.name;
        test.description = req.body.description;
        test.researchQuestion = req.body.researchQuestion;
        test.days = req.body.days;
        test.randomisationType = req.body.randomisationType;
        test.outcomeId = req.body.outcomeId;
        test.outcomeBaselineValue = req.body.outcomeBaselineValue;
        test.conversionMinDetectableEffect = req.body.conversionMinDetectableEffect;
        test.conversionPower = req.body.conversionPower;
        test.conversionAlpha = req.body.conversionAlpha;
        test.conversionSampleSize = req.body.conversionSampleSize;
        test.trial = req.body.trial;
        if (req.body.startDate) test.startDate = new Date(req.body.startDate);
        if (isTestFullyConfigured(test)) test.status = statuses.configured.id;
        else test.status = statuses.new.id;
        test.save(() => {
          res.redirect('/ab');
        });
      });
    },
  },

  remove: {
    get: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        res.render('pages/ab/remove.jade', { test });
      });
    },
    post: (req, res) => {
      Test.remove({ _id: req.params.testId }, () => {
        res.redirect('/ab');
      });
    },
  },

  progress: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      hitCtl.hits(test, (hitErr, result) => {
        if (err || hitErr) res.render('pages/ab/progress.jade', { test, message: { error: err || hitErr } });
        else {
          test.baselineHits = result.baseline;
          test.featureHits = result.feature;
          res.render('pages/ab/progress.jade', { test });
        }
      });
    });
  },

  results: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      res.render('pages/ab/progress.jade', { test });
    });
  },

  pause: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.status = statuses.paused.id;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  start: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.status = statuses.running.id;
      if (!test.startDate) {
        const now = new Date();
        now.setHours(2);
        now.setMinutes(0);
        now.setSeconds(0);
        test.startDate = now;
      }
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  stop: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.status = statuses.completed.id;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  archive: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.status = statuses.archived.id;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

};
