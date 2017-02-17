var Indicator = require('../models/indicator'),
  actions = require('./actions');

module.exports = {

  //Get list of indicators for a single practice - for use on the overview screen
  list: function(practiceId, done) {
    Indicator.find({ practiceId: practiceId }, function(err, indicators) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding indicator list for practice: " + practiceId));
      }
      if (!indicators) {
        console.log('Error finding indicator list for practice:  ' + practiceId);
        return done(null, false);
      } else {
        done(null, indicators);
      }
    });
  },

  //Get single indicator for a given practice
  get: function(practiceId, indicatorId, done) {
    Indicator.findOne({ practiceId: practiceId, id: indicatorId }, function(err, indicator) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding indicator: " + indicatorId + " for practice: " + practiceId));
      }
      if (!indicator) {
        console.log("Error finding indicator: " + indicatorId + " for practice: " + practiceId);
        return done(null, false);
      } else {
        done(null, indicator);
      }
    });
  },

  //Get team actions for a single indicator or all indicators
  getActions: function(practiceId, indicatorId, done) {
    var searchObject = { practiceId: practiceId };
    actions.getTeam(searchObject, function(err, actions) {
      var actionObject = {};
      var userDefinedActions=[];
      actions.forEach(function(v) {
        if(v.userDefined && (!indicatorId || indicatorId===v.indicatorId)) userDefinedActions.push(v);
        actionObject[v.actionTextId] = v.toObject();
      });
      if (err) return done(err);
      if (indicatorId) {
        searchObject.id = indicatorId;
      }
      Indicator.find(searchObject, { _id: 0, actions: 1 }, function(err, indicators) {
        if (err) {
          console.log(err);
          return done(new Error("Error finding indicator"));
        }
        if (!indicators) {
          console.log('Invalid request for indicatorId: ' + indicatorId);
          return done(null, false);
        } else {
          var uniqueActions = {};

          indicators.forEach(function(indicator){
            //de dupe and sum the pointsPerAction
            indicator.actions.forEach(function(v){
              v = v.toObject();
              var actionIdFromText = v.actionText.toLowerCase().replace(/[^a-z0-9]/g,"");
              v.pointsPerAction = +v.pointsPerAction;
              v.indicatorList = [v.indicatorId];
              v.actionTextId = actionIdFromText;
              if(!uniqueActions[actionIdFromText]) {
                uniqueActions[actionIdFromText] = v;
              } else {
                uniqueActions[actionIdFromText].indicatorList.push(v.indicatorId);
                uniqueActions[actionIdFromText].pointsPerAction += v.pointsPerAction;
                // how about numberPatients and priority
              }
            });
          });

          //convert back to array and sort
          var rtn = Object.keys(uniqueActions).map(function(v){
            return uniqueActions[v];
          }).sort(function(a,b){
            return b.pointsPerAction - a.pointsPerAction;
          });

          //do the merging
          rtn = rtn.map(function(v) {
            if(actionObject[v.actionTextId]){
              Object.keys(actionObject[v.actionTextId]).forEach(function(vv){
                v[vv] = actionObject[v.actionTextId][vv];
              });
            }
            return v;
          });

          return done(null, {actions: rtn, userDefinedActions: userDefinedActions});
        }
      });
    });
  },

  //Get benchmark data for an indicator
  getBenchmark: function(practiceId, practices, indicatorId, done) {
    var pLookup = {};
    practices.forEach(function(v){
      pLookup[v._id]=[v.name,v.neighbourhood];
    });
    Indicator.find({ id: indicatorId }, function(err, indicators) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding indicators for: " + indicatorId));
      }
      if (!indicators) {
        console.log('Error finding indicators for:  ' + indicatorId);
        return done(null, false);
      } else {
        var benchmark = indicators.filter(function(v){
          return v.values && v.values.length>0 && v.practiceId !== "ALL";
        }).map(function(v) {
          return {
            x: +v.values[1][v.values[1].length - 1]*100/+v.values[2][v.values[2].length - 1],
            p: v.practiceId === practiceId ? "You" : practiceId,
            pFull: v.practiceId === practiceId ? "You" : (pLookup[v.practiceId] ? pLookup[v.practiceId][0] : v.practiceId),
            local: pLookup[v.practiceId] ? pLookup[v.practiceId][1]===pLookup[practiceId][1] : false
          };
        });
        done(null, benchmark);
      }
    });
  },

  //Get trend data for a practice and an indicator
  getTrend: function(practiceId, indicatorId, done) {
    Indicator.findOne({ practiceId: practiceId, id: indicatorId }, { values: 1 }, function(err, indicator) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding trend for practice: " + practiceId + " and indicator: " + indicatorId));
      }
      if (!indicator) {
        console.log("Error finding trend for practice: " + practiceId + " and indicator: " + indicatorId);
        return done(null, false);
      } else {
        done(null, indicator.values);
      }
    });
  }

};
