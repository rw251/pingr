var Event = require('../models/event'),
  json2csv = require('json2csv'),
  User = require('../models/user');

var processEvent = function(event){
  event = event.toObject();
  if(event.data) {
    event.data.forEach(function(v){
      event["data."+v.key]=v.value;
    });
  }
  delete event.data;
  return event;
};

var e = {

  //Get list of events for a given type - or all
  list: function(filter, skip, limit, done) {
    Event.find(filter, null, {skip: +skip || 0, limit: +limit || 100, sort: {date: -1}}, function(err, events) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding event list"));
      }
      if (!events) {
        console.log('Error finding event list');
        return done(null, false);
      } else {
        done(null, events);
      }
    });
  },

  //Get list of events for a given type - or all
  csv: function(filter, skip, limit, done) {
    Event.find(filter, null, {skip: +skip || 0, limit: +limit || 100, sort: {date: -1}}, function(err, events) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding event list"));
      }
      if (!events) {
        console.log('Error finding event list');
        return done(null, false);
      } else {
        done(null, json2csv({data: events.map(processEvent)}));
      }
    });
  },

  download: function(options, done){
    var filter={};
    if(options.from && options.to) filter.date = {$gte:new Date(options.from), $lte:new Date(options.to)};
    else if(options.from) filter.date = {$gte:new Date(options.from)};
    else if(options.to) filter.date = {$lte:new Date(options.to)};

    if(options.user) filter.user = options.user;

    Event.find(filter,function(err, events){
      if(err) return done(err);
      if(options.csv && options.csv!=="json") return done(null, "csv", json2csv({data: events.map(processEvent)}));
      else return done(null, "json", events);
    });

  },

  add: function(event, done){
    if (event) {
      //record to mongo
      try {
        var newEvent = new Event(event);

        // save the event
        newEvent.save(function(err,evt) {
          if (err) {
            return done(err);
          } else {
            console.log(evt);
            return done(null);
          }
        });
      } catch(e) {
        return done(e);
      }
    }
    else {
      return done("oops");
    }
  },

  emailReminder: function(email, token, date, done) {
    var newEvent = new Event({date:date, user: email, type: "emailReminderSent", data:[{key:"token", value: token}]});

    // save the event
    newEvent.save(function(err) {
      if (err) {
        console.log("Error writing login event: " + err);
        return done(err);
      }
      return done(null);
    });
  },

  emailReminderOpenedTokenCheck: function(email, token) {
    User.findOne({email: email},function(err,user){
      if (user) {
        var newEvent = new Event({user: user.email, type: "emailReminderOpened", data:[{key:"token", value: token}]});

        // save the event
        newEvent.save(function(err) {
          if (err) {
            console.log("Error writing login event: " + err);
          }
        });
      }
    });
  },

  emailReminderTokenCheck: function(token, url) {
    User.findOne({email_url_tracking_code: token},function(err,user){
      if (user) {
        var newEvent = new Event({user: user.email, type: "emailReminderLinkClicked", url:url, data:[{key:"token", value: token}]});

        // save the event
        newEvent.save(function(err) {
          if (err) {
            console.log("Error writing login event: " + err);
          }
        });
      }
    });
  },

  login: function(email, session) {
    var newEvent = new Event({sessionId:session, user: email, type: "login"});

    // save the event
    newEvent.save(function(err) {
      if (err) {
        console.log("Error writing login event: " + err);
      }
    });
  },

  logout: function(email, session) {
    var newEvent = new Event({sessionId:session, user: email, type: "logout"});

    // save the event
    newEvent.save(function(err) {
      if (err) {
        console.log("Error writing login event: " + err);
      }
    });
  }

};

module.exports = e;
