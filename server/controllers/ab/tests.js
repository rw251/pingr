const Test = require('../../models/ab/test');
const { statuses, randomisationTypes, randomisationTypeArray, trials, trialArray, outcomes, outcomeArray } = require('../../../shared/ab/config');
const outcomeCtl = require('./outcomes');
const testConfigs = require('../../../shared/ab/tests');

const isTestFullyConfigured = test => test.name &&
                                      test.researchQuestion &&
                                      test.randomisationTypeId &&
                                      test.trialId &&
                                      test.outcomeId;

module.exports = {

  index: (req, res) => {
    const query = req.query.showArchived ? {} : { statusId: { $ne: statuses.archived.id } };
    Test.find(query, (err, tests) => {
      const testMods = tests.map((test) => {
        test.outcome = test.outcomeId ? outcomes[test.outcomeId] : {};
        test.trial = test.trialId ? trials[test.trialId] : {};
        test.status = test.statusId ? statuses[test.statusId] : {};
        test.randomisationType = test.randomisationTypeId ?
          randomisationTypes[test.randomisationTypeId] :
          {};

        test.readyToDeploy = testConfigs[test.name] ? testConfigs[test.name].readyToDeploy === 'true' : false;
        return test;
      });
      res.render('pages/ab/index.jade', { tests: testMods, showArchived: req.query.showArchived });
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
          test.baselineHits = result.baseline;
          test.featureHits = result.feature;
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
      res.render('pages/ab/progress.jade', { test });
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
