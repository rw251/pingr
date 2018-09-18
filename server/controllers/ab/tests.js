const Test = require('../../models/ab/test');
const { statuses, randomisationTypeArray, trialArray, outcomeArray } = require('../../../shared/ab/config');
const outcomeCtl = require('./outcomes');
const significance = require('./significanceCalculator');

const isTestFullyConfigured = test => test.name &&
                                      test.researchQuestion &&
                                      test.randomisationTypeId &&
                                      test.trialId &&
                                      test.outcomeId;

module.exports = {

  index: (req, res) => {
    const query = req.query.showArchived ? {} : { statusId: { $ne: statuses.archived.id } };
    Test.find(query, (err, tests) => {
      res.render('pages/ab/index.jade', { tests, showArchived: req.query.showArchived });
    });
  },

  running: (req, res) => {
    const query = { statusId: statuses.running.id };
    if (req.query.randomisationTypeId) {
      if (typeof req.query.randomisationType === 'string') {
        query.randomisationTypeId = req.query.randomisationTypeId;
      } else {
        query.randomisationTypeId = { $in: req.query.randomisationTypeId };
      }
    }
    Test.find(query, (err, tests) => {
      res.send(tests);
    });
  },

  create: {
    get: (req, res) => {
      res.render('pages/ab/create.jade', { test: {}, outcomeArray, randomisationTypeArray, trialArray });
    },
    post: (req, res) => {
      const newTest = new Test(req.body);
      if (isTestFullyConfigured(newTest)) newTest.statusId = statuses.configured.id;
      else newTest.statusId = statuses.new.id;
      newTest.save((err) => {
        if (err) res.render('pages/ab/create.jade', { test: newTest, message: { error: err }, outcomeArray, randomisationTypeArray, trialArray });
        else res.redirect('/ab');
      });
    },
  },

  configure: {
    get: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        res.render('pages/ab/configure.jade', { test, outcomeArray, randomisationTypeArray, trialArray });
      });
    },
    post: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        test.name = req.body.name;
        test.description = req.body.description;
        test.researchQuestion = req.body.researchQuestion;
        test.days = req.body.days;
        test.randomisationTypeId = req.body.randomisationTypeId;
        test.outcomeId = req.body.outcomeId;
        test.outcomeBaselineValue = req.body.outcomeBaselineValue;
        test.conversionMinDetectableEffect = req.body.conversionMinDetectableEffect;
        test.conversionPower = req.body.conversionPower;
        test.conversionAlpha = req.body.conversionAlpha;
        test.conversionSampleSize = req.body.conversionSampleSize;
        test.trialId = req.body.trialId;
        if (req.body.startDate) test.startDate = new Date(req.body.startDate);
        if (isTestFullyConfigured(test)) test.statusId = statuses.configured.id;
        else test.statusId = statuses.new.id;
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
      outcomeCtl.trialHits(test, (hitErr, result) => {
        if (err || hitErr) res.render('pages/ab/progress.jade', { test, message: { error: err || hitErr } });
        else {
          test.baselineHits = result.baseline.total;
          test.featureHits = result.feature.total;
          res.render('pages/ab/progress.jade', { test });
        }
      });
    });
  },

  rawProgress: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      outcomeCtl.trialHits(test, (hitErr, result) => {
        result.needed = test.conversionSampleSize;
        res.send(result);
      });
    });
  },

  results: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      outcomeCtl.trialHits(test, (hitErr, result) => {
        if (err || hitErr) res.render('pages/ab/results.jade', { test, message: { error: err || hitErr } });
        else {
          test.pValue = significance.pValue(0, result.baseline, 0, result.feature);
          test.baselineHits = result.baseline.total;
          test.baselineSuccesses = result.baseline.hits;
          test.featureHits = result.feature.total;
          test.featureSuccesses = result.feature.hits;
          test.pValue = significance.pValue(
            result.baseline.hits, result.baseline.total,
            result.feature.hits, result.feature.total
          );
          if (test.baselineHits > 0 && test.featureHits > 0) {
            if (test.baselineSuccesses / test.baselineHits >
              test.featureSuccesses / test.featureHits) {
              test.verdict = 'Baseline is more successful than feature.';
            } else {
              test.verdict = 'Feature is more successful than baseline.';
            }
            if (test.pValue < 0.05) {
              test.verdict += ` This is SIGNIFICANT with a p-value of ${test.pValue}.`;
            } else if (test.pValue < 0.1) {
              test.verdict += ` This is borderline significant with a p-value of ${test.pValue}.`;
            } else {
              test.verdict += ` This is NOT significant: p-value = ${test.pValue}.`;
            }
          }
          res.render('pages/ab/results.jade', { test });
        }
      });
    });
  },

  pause: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.statusId = statuses.paused.id;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  start: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.statusId = statuses.running.id;
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
      test.statusId = statuses.completed.id;
      test.endDate = new Date();
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  archive: (req, res) => {
    Test.findById(req.params.testId, (err, test) => {
      test.statusId = statuses.archived.id;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

};
