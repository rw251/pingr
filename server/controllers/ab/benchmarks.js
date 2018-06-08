const Event = require('../../models/event');

const getNDaysAgo = (n) => {
  const today = new Date();
  const nDaysAgo = new Date();
  nDaysAgo.setDate(today.getDate() - n);
  return nDaysAgo;
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
  Event.aggregate(query, (err, output) => callback(err, { id, description, value: output[0].result }));
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
  Event.aggregate(query, (err, output) => callback(err, { id, description, value: output[0].result }));
};

const agreesPerSessionLastNDays = (n, callback) =>
  eventsPerSessionLastNDays(['agree'], n, 1, `Agrees clicked per session in last ${n} days.`, callback);
const disagreesPerSessionLastNDays = (n, callback) =>
  eventsPerSessionLastNDays(['disagree'], n, 2, `Disagrees clicked per session in last ${n} days.`, callback);
const thumbsPerSessionLastNDays = (n, callback) =>
  eventsPerSessionLastNDays(['agree', 'disagree'], n, 3, `Thumbs clicked per session in last ${n} days.`, callback);
const agreesPerMinuteLastNDays = (n, callback) =>
  eventsPerMinuteLastNDays(['agree'], n, 4, `Agrees clicked per minute in last ${n} days.`, callback);
const disagreesPerMinuteLastNDays = (n, callback) =>
  eventsPerMinuteLastNDays(['disagree'], n, 5, `Disagrees clicked per minute in last ${n} days.`, callback);
const thumbsPerMinuteLastNDays = (n, callback) =>
  eventsPerMinuteLastNDays(['agree', 'disagree'], n, 6, `Thumbs clicked per minute in last ${n} days.`, callback);

const go = (n, func) => {
  func(n, (err, output) => output.result);
};

const getAll = (callback) => {
  const need = 2;
  let done = 0;
  const benchmarks = [];
  [thumbsPerSessionLastNDays, thumbsPerMinuteLastNDays].forEach((func) => {
    func(90, (err, output) => {
      done += 1;
      benchmarks.push(output);
      if (done === need) {
        callback(null, benchmarks);
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
    getAll((err, benchmarks) => {
      res.render('pages/ab/benchmarks.jade', { benchmarks });
    });
  },

  getAll,
};
