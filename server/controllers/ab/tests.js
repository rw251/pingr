const Test = require('../../models/ab/test');
const { statuses, randomisationTypes, hitCounters } = require('../../../shared/ab/config');
const benchCtl = require('./conversionMetrics');
const hitCtl = require('./hitCounters');
const testConfigs = require('../../../shared/ab/tests');

let localMetrics = [];

const isTestFullyConfigured = test => test.name &&
                                      test.description &&
                                      test.randomisationType &&
                                      test.hitCounter &&
                                      test.conversionMetricId;

module.exports = {

  index: (req, res) => {
    const query = req.query.showArchived ? {} : { status: { $ne: statuses.archived } };
    Test.find(query, (err, tests) => {
      const testMods = tests.map((test) => {
        if (test.conversionMetricId) {
          test.conversionMetric = benchCtl.nameFromId(test.conversionMetricId);
        }
        test.readyToDeploy = testConfigs[test.name] ? testConfigs[test.name].readyToDeploy === 'true' : false;
        return test;
      });
      res.render('pages/ab/index.jade', { tests: testMods, showArchived: req.query.showArchived });
    });
  },

  running: (req, res) => {
    Test.find({ status: statuses.running }, (err, tests) => {
      res.send(tests);
    });
  },

  create: {
    get: (req, res) => {
      benchCtl.getAll((getAllErr, conversionMetrics) => {
        localMetrics = conversionMetrics;
        res.render('pages/ab/create.jade', { test: {}, conversionMetrics, randomisationTypes, hitCounters });
      });
    },
    post: (req, res) => {
      const newTest = new Test(req.body);
      if (isTestFullyConfigured(newTest)) newTest.status = statuses.configured;
      else newTest.status = statuses.new;
      newTest.save((err) => {
        if (err) res.render('pages/ab/create.jade', { test: newTest, message: { error: err }, conversionMetrics: localMetrics, randomisationTypes, hitCounters });
        else res.redirect('/ab');
      });
    },
  },

  configure: {
    get: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        benchCtl.getAll((getAllErr, conversionMetrics) => {
          res.render('pages/ab/configure.jade', { test, conversionMetrics, randomisationTypes, hitCounters });
        });
      });
    },
    post: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        test.name = req.body.name;
        test.description = req.body.description;
        test.randomisationType = req.body.randomisationType;
        test.conversionMetricId = req.body.conversionMetricId;
        test.conversionMetricBaselineValue = req.body.conversionMetricBaselineValue;
        test.conversionMinDetectableEffect = req.body.conversionMinDetectableEffect;
        test.conversionPower = req.body.conversionPower;
        test.conversionAlpha = req.body.conversionAlpha;
        test.conversionSampleSize = req.body.conversionSampleSize;
        test.hitCounter = req.body.hitCounter;
        if (req.body.startDate) test.startDate = new Date(req.body.startDate);
        if (isTestFullyConfigured(test)) test.status = statuses.configured;
        else test.status = statuses.new;
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
      test.status = statuses.paused;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  start: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.status = statuses.running;
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
      test.status = statuses.completed;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  archive: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.status = statuses.archived;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

};
