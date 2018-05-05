/* jshint esversion:6 */
const patients = require('./patients');
const practices = require('./practices');
const indicators = require('./indicators');
const config = require('../config');

const indicatorLookup = {};
const processIndicators = indicatorList => indicatorList.filter((v) => {
  indicatorLookup[v.id] = v.name;
  return v.values && v.values[0].length > 1;
}).sort((a, b) => {
  const lastidA = a.values[0].length - 1;
  const lastidB = b.values[0].length - 1;

  if (+a.values[2][lastidA] === 0 && +b.values[2][lastidB] === 0) return 0;
  if (+a.values[2][lastidA] === 0) return 1;
  if (+b.values[2][lastidB] === 0) return -1;

  return ((a.values[1][lastidA] * 100) / a.values[2][lastidA]) -
    ((b.values[1][lastidB] * 100) / b.values[2][lastidB]);
}).map((v) => {
  const lastid = v.values[0].length - 1;
  v.link = `indicators/${v.id.replace(/\./g, '/')}`;
  v.performance = (v.values[2][lastid] > 0 ? `${((v.values[1][lastid] * 100) / v.values[2][lastid]).toFixed(0)}%` : 'N/A');
  v.fraction = `${v.values[1][lastid]}/${v.values[2][lastid]}`;
  v.target = `${100 * v.values[3][lastid]}%`;
  v.benchmark = `${100 * +v.benchmark}%`;
  return v;
});

const processPatients = patientList => patientList
  .map((v) => {
    v.indicators = v.indicators.map(vv => indicatorLookup[vv]);
    if (!v.indicatorsWithAction) {
      v.indicatorsWithAction = [];
      v.numberOfIndicatorsWithAction = 0;
    }
    v.indicatorsWithAction = v.indicatorsWithAction.map(vv => indicatorLookup[vv]);
    return v;
  })
  .sort((a, b) =>
    (b.numberOfIndicators - b.numberOfIndicatorsWithAction) -
    (a.numberOfIndicators - a.numberOfIndicatorsWithAction));

module.exports = {

  getDataForEmails(practiceId, userThing, callback) {
    const greetings = ['Hi', 'Hello', 'Dear', 'Greetings'];

    practices.get(practiceId, (err, practice) => {
      patients.getAllPatientsPaginatedConsiderLastReviewDate(
        practiceId,
        userThing,
        0,
        25,
        (getErr, patientList) => {
          if (getErr) return callback(getErr);
          return indicators.list(practiceId, user, (listErr, indicatorList) => {
            if (listErr) return callback(listErr);
            const processedIndicators = processIndicators(indicatorList);
            const processedPatients = processPatients(patientList);
            const user = userThing.toObject();
            if (user.last_login) user.last_login = (new Date(user.last_login)).toDateString();
            user.indicators = processedIndicators;
            user.patients = processedPatients;
            user.reminderEmailsFrom = config.mail.reminderEmailsFrom;
            user.practiceSystem = practice.ehr;
            user.greeting = greetings[Math.floor(Math.random() * greetings.length)];
            user.practiceId = practiceId;
            user.practiceName = practice.name;
            return callback(null, { data: user });
          });
        }
      );
    });
  },
};
