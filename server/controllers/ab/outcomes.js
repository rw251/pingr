const Event = require('../../models/event');
const { outcomes, trials } = require('../../../shared/ab/config');

const outcomeNames = [
  'Agrees clicked per session in last 90 days.',
  'Disagrees clicked per session in last 90 days.',
  'Thumbs clicked per session in last 90 days.',
  'Agrees clicked per minute in last 90 days.',
  'Disagrees clicked per minute in last 90 days.',
  'Thumbs clicked per minute in last 90 days.',
  'Proportion of page views with thumb click in the last 90 days',
  'Proportion of page views with own action added in the last 90 days',
];

const getNDaysAgo = (n) => {
  const today = new Date();
  const nDaysAgo = new Date();
  nDaysAgo.setDate(today.getDate() - n);
  return nDaysAgo;
};

const getQuery = (trial, outcome, days) => {
  const nDaysAgo = getNDaysAgo(days);
  switch (trial) {
    case trials.pageView:
      switch (outcome) {
        case outcomes.thumbClicks: {
          const match = { $match: { date: { $gt: nDaysAgo } } };

          const project = { $project: { _id: 0, groope: `$tests.${test.name}` } };
          const group = { $group: { _id: '$groope', total: { $sum: 1 } } };
          const query = [match, project, group];
          return [
            { $match: { date: { $gt: nDaysAgo } } },
            {
              $project: {
                sessionId: 1,
                hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } },
              },
            },
            { $group: { _id: '$sessionId', events: { $sum: '$hasEvent' } } },
            { $group: { _id: null, result: { $avg: '$events' } } },
          ]; }
        default:
          return false;
      }
    case trials.patientView:
      switch (outcome) {
        case outcomes.thumbClicks:
          return false;
        default:
          return false;
      }
    default:
      return false;
  }
};


const eventsPerSessionLastNDays = (eventTypes, n, id, description, callback) => {
  const nDaysAgo = getNDaysAgo(n);
  const query = [
    { $match: { date: { $gt: nDaysAgo } } },
    {
      $project: {
        sessionId: 1,
        hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } },
      },
    },
    { $group: { _id: '$sessionId', events: { $sum: '$hasEvent' } } },
    { $group: { _id: null, result: { $avg: '$events' } } },
  ];
  Event.aggregate(query, (err, output) =>
    callback(err, { id, description, value: output[0].result * 100 }));
};

const eventsPerMinuteLastNDays = (eventTypes, n, id, description, callback) => {
  const nDaysAgo = getNDaysAgo(n);
  const query = [
    { $match: { date: { $gt: nDaysAgo } } },
    {
      $project: {
        date: 1,
        sessionId: 1,
        hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } },
      },
    },
    { $group: { _id: '$sessionId', start: { $min: '$date' }, end: { $max: '$date' }, events: { $sum: '$hasEvent' } } },
    { $project: { _id: 1, duration: { $subtract: ['$end', '$start'] }, events: 1 } },
    { $group: { _id: null, totalDuration: { $sum: '$duration' }, totalEvents: { $sum: '$events' } } },
    { $project: { eventsPerMillisecond: { $divide: ['$totalEvents', '$totalDuration'] } } },
    { $project: { result: { $multiply: [60000, '$eventsPerMillisecond'] } } },
  ];
  Event.aggregate(query, (err, output) =>
    callback(err, { id, description, value: output[0].result * 100 }));
};

const agreesPerSessionLastNDays = (n, callback) =>
  eventsPerSessionLastNDays(['agree'], n, 1, outcomeNames[0], callback);
const disagreesPerSessionLastNDays = (n, callback) =>
  eventsPerSessionLastNDays(['disagree'], n, 2, outcomeNames[1], callback);
const thumbsPerSessionLastNDays = (n, callback) =>
  eventsPerSessionLastNDays(['agree', 'disagree'], n, 3, outcomeNames[2], callback);
const agreesPerMinuteLastNDays = (n, callback) =>
  eventsPerMinuteLastNDays(['agree'], n, 4, outcomeNames[3], callback);
const disagreesPerMinuteLastNDays = (n, callback) =>
  eventsPerMinuteLastNDays(['disagree'], n, 5, outcomeNames[4], callback);
const thumbsPerMinuteLastNDays = (n, callback) =>
  eventsPerMinuteLastNDays(['agree', 'disagree'], n, 6, outcomeNames[5], callback);

const go = (n, func) => {
  func(n, (err, output) => output.result);
};

const getAll = (callback) => {
  const need = 2;
  let done = 0;
  const outcomes = [];
  [thumbsPerSessionLastNDays, thumbsPerMinuteLastNDays].forEach((func) => {
    func(90, (err, output) => {
      done += 1;
      outcomes.push(output);
      if (done === need) {
        callback(null, outcomes);
      }
    });
  });
};

module.exports = {

  agreesPerSessionLastNDays: n => go(n, agreesPerSessionLastNDays),
  disagreesPerSessionLastNDays: n => go(n, disagreesPerSessionLastNDays),
  thumbsPerSessionLastNDays: n => go(n, thumbsPerSessionLastNDays),
  agreesPerMinuteLastNDays: n => go(n, agreesPerMinuteLastNDays),
  disagreesPerMinuteLastNDays: n => go(n, disagreesPerMinuteLastNDays),
  thumbsPerMinuteLastNDays: n => go(n, thumbsPerMinuteLastNDays),

  all: (req, res) => {
    // getAll((err, outcomes) => {
    res.render('pages/ab/outcomes.jade', { outcomes });
    // });
  },

  getAll,

  nameFromId: id => outcomeNames[id - 1],

  conversion: (req, res) => {
    const { trial, outcome, days } = req.params;
    const query = getQuery(trial, outcome, days);
    Event.aggregate(query, (err, output) => {
      res.send({ error: err, value: output[0].result });
    });
  },
};
