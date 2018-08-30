const Event = require('../../models/event');
const { outcomes, trials } = require('../../../shared/ab/config');

const getNDaysAgo = (n) => {
  const today = new Date();
  const nDaysAgo = new Date();
  nDaysAgo.setDate(today.getDate() - n);
  return nDaysAgo;
};

const getMatchForPageViewThumbClicks = (daysOrDate) => {
  const $match = { $match: { pageId: { $exists: true } } };
  if (daysOrDate) {
    const nDaysAgo = daysOrDate.getMinutes ? daysOrDate : getNDaysAgo(daysOrDate);
    $match.$match.date = { $gt: nDaysAgo };
  }
  return $match;
};

const getMatchForPatientPageViewThumbClicks = (daysOrDate, eventTypes) => {
  const $match = { $match: { pageId: { $exists: true }, $or: [{ url: /patients?\/\d/ }, { type: { $in: eventTypes } }] } };
  if (daysOrDate) {
    const nDaysAgo = daysOrDate.getMinutes ? daysOrDate : getNDaysAgo(daysOrDate);
    $match.$match.date = { $gt: nDaysAgo };
  }
  return $match;
};

const getProjectForPageViewThumbClicks = eventTypes => ({ $project: { pageId: 1, hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } } } });

const getProjectForPatientPageViewThumbClicks = eventTypes => ({ $project: { pageId: 1, url: 1, hasEvent: { $cond: { if: { $in: ['$type', eventTypes] }, then: 1, else: 0 } } } });

const getQueryForPageViewThumbClicks = (days, eventTypes) => [
  // Only things with a page id within the last n days
  getMatchForPageViewThumbClicks(days),

  // Determine if there is a thumb click event
  getProjectForPageViewThumbClicks(eventTypes),

  // Determine if there is a thumb click event for each pageId
  { $group: { _id: '$pageId', clicks: { $max: '$hasEvent' } } },

  // Average to get the proportion of page views with a thumb click
  { $group: { _id: null, value: { $avg: '$clicks' } } },

  // Convert proportion into a percentage
  { $project: { result: { $multiply: [100, '$value'] } } },
];

const getQueryForPatientPageViewThumbClicks = (days, eventTypes) => [
  // Only things with a page id within the last n days that are either one of the event types
  // or a patient page url (agree/disagree don't have a url so aren't matched otherwise)
  getMatchForPatientPageViewThumbClicks(days, eventTypes),

  // Determine if there is a thumb click event
  getProjectForPatientPageViewThumbClicks(eventTypes),

  // Determine if there is a thumb click event for each pageId
  { $group: { _id: '$pageId', clicks: { $max: '$hasEvent' }, url: { $max: '$url' } } },

  // If url is null then it is a thumb click on a non-patient page
  { $match: { url: { $ne: null } } },

  // Average to get the proportion of page views with a thumb click
  { $group: { _id: null, value: { $avg: '$clicks' } } },

  // Convert proportion into a percentage
  { $project: { result: { $multiply: [100, '$value'] } } },
];

const getHitQueryForPageViewThumbClicks = (test, eventTypes) => {
  const $match = getMatchForPageViewThumbClicks(test.startDate);
  $match.$match[`tests.${test.name}`] = { $exists: true };
  const $project = getProjectForPageViewThumbClicks(eventTypes);
  $project.$project.groop = `$tests.${test.name}`;
  return [
    // Only things with a page id within the last n days
    $match,

    // Determine if there is a thumb click event
    $project,

    { $group: { _id: '$pageId', groop: { $max: '$groop' }, hits: { $max: '$hasEvent' } } },

    // Determine if there is a thumb click event for each pageId
    { $group: { _id: '$groop', total: { $sum: 1 }, hits: { $sum: '$hits' } } },
  ];
};

const getHitQueryForPatientPageViewThumbClicks = (test, eventTypes) => {
  const $match = getMatchForPatientPageViewThumbClicks(test.startDate, eventTypes);
  $match.$match[`tests.${test.name}`] = { $exists: true };
  const $project = getProjectForPatientPageViewThumbClicks(eventTypes);
  $project.$project.groop = `$tests.${test.name}`;
  return [
    // Only things with a page id within the last n days that are either one of the event types
    // or a patient page url (agree/disagree don't have a url so aren't matched otherwise)
    $match,

    // Determine if there is a thumb click event
    $project,

    // Determine if there is a thumb click event for each pageId
    { $group: { _id: '$pageId', url: { $max: '$url' }, groop: { $max: '$groop' }, hits: { $max: '$hasEvent' } } },

    // If url is null then it is a thumb click on a non-patient page
    { $match: { url: { $ne: null } } },

    // Determine if there is a thumb click event for each pageId
    { $group: { _id: '$groop', total: { $sum: 1 }, hits: { $sum: '$hits' } } },
  ];
};

const getConversionQuery = (trialId, outcomeId, days) => {
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

const getTrialHitQuery = (test) => {
  switch (test.trialId) {
    case trials.pageView.id:
      switch (test.outcomeId) {
        case outcomes.thumbClicks.id:
          return getHitQueryForPageViewThumbClicks(test, ['agree', 'disagree']);
        case outcomes.thumbAgreeClicks.id:
          return getHitQueryForPageViewThumbClicks(test, ['agree']);
        case outcomes.thumbDisagreeClicks.id:
          return getHitQueryForPageViewThumbClicks(test, ['disagree']);
        default:
          return false;
      }
    case trials.patientView.id:
      switch (test.outcomeId) {
        case outcomes.thumbClicks.id:
          return getHitQueryForPatientPageViewThumbClicks(test, ['agree', 'disagree']);
        case outcomes.thumbAgreeClicks.id:
          return getHitQueryForPatientPageViewThumbClicks(test, ['agree']);
        case outcomes.thumbDisagreeClicks.id:
          return getHitQueryForPatientPageViewThumbClicks(test, ['disagree']);
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
    const query = getConversionQuery(trialId, outcomeId, days);
    Event.aggregate(query, (err, output) => {
      res.send({ error: err, value: output[0].result });
    });
  },

  trialHits: (test, callback) => {
    const query = getTrialHitQuery(test);
    Event.aggregate(query, (err, output) => {
      let baseline = 0;
      let feature = 0;
      output.forEach((o) => {
        if (o._id === 'baseline') baseline = { total: o.total, hits: o.hits };
        else feature = { total: o.total, hits: o.hits };
      });
      return callback(err, { baseline, feature });
    });
  },

};
