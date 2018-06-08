const { Test, statuses } = require('../../models/test');
const benchCtl = require('./benchmarks');

module.exports = {

  index: (req, res) => {
    Test.find({ status: { $ne: statuses.archived } }, (err, tests) => {
      res.render('pages/ab/index.jade', { tests });
    });
  },

  configure: {
    get: (req, res) => {
      Test.findOne({ _id: +req.params.testId }, (err, test) => {
        benchCtl.getAll((getAllErr, benchmarks) => {
          res.render('pages/ab/configure.jade', { test, benchmarks });
        });
      });
    },
    post: (req, res) => {
      Test.findOne({ _id: +req.params.testId }, (err, test) => {
        test.status = statuses.configured;
        test.randomisationType = req.body.randomisationType;
        test.benchmarkId = req.body.benchmarkId;
        test.startDate = new Date(req.body.startDate);
        test.save(() => {
          res.redirect('/ab');
        });
      });
    },
  },

  progress: (req, res) => {
    Test.findOne({ _id: +req.params.testId }, (err, test) => {
      res.render('pages/ab/progress.jade', { test });
    });
  },

  pause: (req, res) => {
    Test.findOne({ _id: +req.params.testId }, (err, test) => {
      test.status = statuses.paused;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  start: (req, res) => {
    Test.findOne({ _id: +req.params.testId }, (err, test) => {
      test.status = statuses.running;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },

  delete: (req, res) => {
    Test.findOne({ _id: +req.params.testId }, (err, test) => {
      test.status = statuses.archived;
      test.save(() => {
        res.redirect('/ab');
      });
    });
  },
};
