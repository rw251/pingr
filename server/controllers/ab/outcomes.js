const Event = require('../../models/event');
const { outcomes, trials } = require('../../../shared/ab/config');

const getNDaysAgo = (n) => {
  const today = new Date();
  const nDaysAgo = new Date();
  nDaysAgo.setDate(today.getDate() - n);
  return nDaysAgo;
};

const getQueryForPageViewThumbClicks = (days, eventTypes) => {
  const nDaysAgo = getNDaysAgo(days);
  return [
    // Only things with a page id within the last n days
    { $match: { date: { $gt: nDaysAgo }, pageId: { $exists: true } } },
    // Determine if there is a thumb click event
    {
      $project: {
        pageId: 1,
        hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } },
      },
    },
    // Determine if there is a thumb click event for each pageId
    { $group: { _id: '$pageId', clicks: { $max: '$hasEvent' } } },
    // Average to get the proportion of page views with a thumb click
    { $group: { _id: null, value: { $avg: '$clicks' } } },
    // Convert proportion into a percentage
    { $project: { result: { $multiply: [100, '$value'] } } },
  ];
};

const getQuery = (trialId, outcomeId, days) => {
  // const nDaysAgo = getNDaysAgo(days);
  switch (trialId) {
    case trials.pageView.id:
      switch (outcomeId) {
        case outcomes.thumbClicks.id: {
          return getQueryForPageViewThumbClicks(days, ['agree', 'disagree']);
        }
        case outcomes.thumbAgreeClicks.id: {
          return getQueryForPageViewThumbClicks(days, ['agree']);
        }
        case outcomes.thumbDisagreeClicks.id: {
          return getQueryForPageViewThumbClicks(days, ['disagree']);
        }
        default:
          return false;
      }
    case trials.patientView.id:
      switch (outcomeId) {
        case outcomes.thumbClicks.id:
          return false;
        case outcomes.thumbAgreeClicks.id:
          return false;
        case outcomes.thumbDisagreeClicks.id:
          return false;
        default:
          return false;
      }
    default:
      return false;
  }
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

module.exports = {

  all: (req, res) => {
    res.render('pages/ab/outcomes.jade', { outcomes });
  },

  conversion: (req, res) => {
    const { trialId, outcomeId, days } = req.params;
    const query = getQuery(trialId, outcomeId, days);
    Event.aggregate(query, (err, output) => {
      res.send({ error: err, value: output[0].result });
    });
  },
};
