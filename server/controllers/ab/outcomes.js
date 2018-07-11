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
    { $project: { pageId: 1, hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } } } },

    // Determine if there is a thumb click event for each pageId
    { $group: { _id: '$pageId', clicks: { $max: '$hasEvent' } } },

    // Average to get the proportion of page views with a thumb click
    { $group: { _id: null, value: { $avg: '$clicks' } } },

    // Convert proportion into a percentage
    { $project: { result: { $multiply: [100, '$value'] } } },
  ];
};

const getQueryForPatientPageViewThumbClicks = (days, eventTypes) => {
  const nDaysAgo = getNDaysAgo(days);
  return [
    // Only things with a page id within the last n days that are either one of the event types
    // or a patient page url (agree/disagree don't have a url so aren't matched otherwise)
    { $match: { date: { $gt: nDaysAgo }, pageId: { $exists: true }, $or: [{ url: /patients?\/\d/ }, { type: { $in: eventTypes } }] } },

    // Determine if there is a thumb click event
    { $project: { pageId: 1, url: 1, hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } } } },

    // Determine if there is a thumb click event for each pageId
    { $group: { _id: '$pageId', clicks: { $max: '$hasEvent' }, url: { $max: '$url' } } },

    // If url is null then it is a thumb click on a non-patient page
    { $match: { url: { $ne: null } } },

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
        case outcomes.thumbClicks.id:
          return getQueryForPageViewThumbClicks(days, ['agree', 'disagree']);
        case outcomes.thumbAgreeClicks.id:
          return getQueryForPageViewThumbClicks(days, ['agree']);
        case outcomes.thumbDisagreeClicks.id:
          return getQueryForPageViewThumbClicks(days, ['disagree']);
        default:
          return false;
      }
    case trials.patientView.id:
      switch (outcomeId) {
        case outcomes.thumbClicks.id:
          return getQueryForPatientPageViewThumbClicks(days, ['agree', 'disagree']);
        case outcomes.thumbAgreeClicks.id:
          return getQueryForPatientPageViewThumbClicks(days, ['agree']);
        case outcomes.thumbDisagreeClicks.id:
          return getQueryForPatientPageViewThumbClicks(days, ['disagree']);
        default:
          return false;
      }
    default:
      return false;
  }
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
