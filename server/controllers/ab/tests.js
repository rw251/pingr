const Test = require('../../models/ab/test');
const { statuses } = require('../../../shared/ab/config');
const benchCtl = require('./conversionMetrics');

let localMetrics = [];

module.exports = {

  index: (req, res) => {
    const query = req.query.showArchived ? {} : { status: { $ne: statuses.archived } };
    Test.find(query, (err, tests) => {
      const testMods = tests.map((test) => {
        if (test.conversionMetricId) {
          test.conversionMetric = benchCtl.nameFromId(test.conversionMetricId);
        }
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
        res.render('pages/ab/create.jade', { test: {}, conversionMetrics });
      });
    },
    post: (req, res) => {
      const newTest = new Test(req.body);
      newTest.save((err) => {
        if (err) res.render('pages/ab/create.jade', { test: newTest, message: { error: err }, conversionMetrics: localMetrics });
        else res.redirect('/ab');
      });
    },
  },

  configure: {
    get: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        benchCtl.getAll((getAllErr, conversionMetrics) => {
          res.render('pages/ab/configure.jade', { test, conversionMetrics });
        });
      });
    },
    post: (req, res) => {
      Test.findById(req.params.testId, (err, test) => {
        test.name = req.body.name;
        test.description = req.body.description;
        test.status = statuses.configured;
        test.randomisationType = req.body.randomisationType;
        test.conversionMetricId = req.body.conversionMetricId;
        test.conversionMetricBaselineValue = req.body.conversionMetricBaselineValue;
        test.conversionMinDetectableEffect = req.body.conversionMinDetectableEffect;
        test.conversionPower = req.body.conversionPower;
        test.conversionAlpha = req.body.conversionAlpha;
        test.conversionSampleSize = req.body.conversionSampleSize;
        if (req.body.startDate) test.startDate = new Date(req.body.startDate);
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
      res.render('pages/ab/progress.jade', { test });
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
