/* jshint esversion:6 */
var patients = require('./patients');
var practices = require('./practices');
var indicators = require('./indicators');
var config = require('../config');

var indicatorLookup={};
var processIndicators = function(indicators) {
  return indicators.filter(function(v) {
    indicatorLookup[v.id] = v.name;
    return v.values && v.values[0].length > 1;
  }).sort(function(a, b) {
    var lastidA = a.values[0].length - 1;
    var lastidB = b.values[0].length - 1;

    if (+a.values[2][lastidA] === 0 && +b.values[2][lastidB] === 0) return 0;
    if (+a.values[2][lastidA] === 0) return 1;
    if (+b.values[2][lastidB] === 0) return -1;

    return (a.values[1][lastidA] * 100 / a.values[2][lastidA]) - (b.values[1][lastidB] * 100 / b.values[2][lastidB]);
  }).map(function(v) {
    var lastid = v.values[0].length - 1;
    v.link = "indicators/" + v.id.replace(/\./g, "/");
    v.performance = (v.values[2][lastid] > 0 ? (v.values[1][lastid] * 100 / v.values[2][lastid]).toFixed(0) + "%" : "N/A");
    v.fraction = v.values[1][lastid] + "/" + v.values[2][lastid];
    v.target = (100 * v.values[3][lastid]) + "%";
    v.benchmark = (100 * +v.benchmark) + "%";
    return v;
  });
};

var processPatients = function(patients) {
  return patients.map(function(v){
    v.indicators = v.indicators.map(function(vv){
      return indicatorLookup[vv];
    });
    if(!v.indicatorsWithAction) {
      v.indicatorsWithAction=[];
      v.numberOfIndicatorsWithAction=0;
    }
    v.indicatorsWithAction = v.indicatorsWithAction.map(function(vv){
      return indicatorLookup[vv];
    });
    return v;
  }).sort(function(a,b){
    return (b.numberOfIndicators - b.numberOfIndicatorsWithAction) - (a.numberOfIndicators - a.numberOfIndicatorsWithAction);
  });
};

module.exports = {

  getDataForEmails: function(practiceId, user, callback) {

    var greetings = ["Hi","Hello","Dear","Greetings"];

    practices.get(practiceId, function(err, practice){
      patients.getAllPatientsPaginatedConsiderLastReviewDate(practiceId, user, 0, 25, function(err, patients) {
        if (err) return callback(err);
        indicators.list(practiceId, function(err, indicators) {
          if (err) return callback(err);
          indicators = processIndicators(indicators);
          patients = processPatients(patients);
          user = user.toObject();
          if(user.last_login) user.last_login = (new Date(user.last_login)).toDateString();
          user.indicators = indicators;
          user.patients = patients;
          user.reminderEmailsFrom = config.mail.reminderEmailsFrom;
          user.practiceSystem = practice.ehr;
          user.greeting = greetings[Math.floor(Math.random()*greetings.length)];
          user.practiceId = practiceId;
          user.practiceName = practice.name;
          return callback(null, { data: user });
        });
      });
    });
  }
};
