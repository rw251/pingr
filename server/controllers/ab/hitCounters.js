const Event = require('../../models/event');

const pageViews = (test, callback) => {
  const match = {
    $match: {
      date: { $gt: test.startDate },
      type: 'navigate',
      url: {
        $nin: [
          '#processIndicators', '#outcomeIndicators',
          '#indicator-trend', '#indicator-benchmark', '#indicator-patient-list',
          '#processIndicatorsQS', '#outcomeIndicatorsQS'],
      },
    },
  };
  match.$match[`tests.${test.name}`] = { $exists: true };
  const project = { $project: { _id: 0, groope: `$tests.${test.name}` } };
  const group = { $group: { _id: '$groope', total: { $sum: 1 } } };
  const query = [match, project, group];

  Event.aggregate(query, (err, output) => {
    let baseline = 0;
    let feature = 0;
    output.forEach((o) => {
      if (o._id === 'baseline') baseline = o.total;
      else feature = o.total;
    });
    return callback(err, { baseline, feature });
  });
};
// #patient/

const patientViews = (test, callback) => {
  const match = {
    $match: {
      date: { $gt: test.startDate },
      type: 'navigate',
      url: { $regex: /#patient\// },
    },
  };
  match.$match[`tests.${test.name}`] = { $exists: true };
  const project = { $project: { _id: 0, groope: `$tests.${test.name}` } };
  const group = { $group: { _id: '$groope', total: { $sum: 1 } } };
  const query = [match, project, group];

  Event.aggregate(query, (err, output) => {
    let baseline = 0;
    let feature = 0;
    output.forEach((o) => {
      if (o._id === 'baseline') baseline = o.total;
      else feature = o.total;
    });
    return callback(err, { baseline, feature });
  });
};

module.exports = {
  pageViews,
  patientViews,
  hits: (test, callback) => {
    switch (test.hitCounter) {
      case 'pageView':
        return pageViews(test, callback);
      case 'patientView':
        return patientViews(test, callback);
      default:
        return callback(new Error('Unexpected hitCounter'));
    }
  },
};
