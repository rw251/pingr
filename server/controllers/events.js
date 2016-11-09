var Event = require('../models/event');

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

  download: function(dateFrom, done){
    if(dateFrom) {

    } else {
      Event.find({},function(err, events){
        if(err) return done(err);
        return done(null, events);
      });
    }
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
