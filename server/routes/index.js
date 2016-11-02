var express = require('express');
var router = express.Router();
var cp = require('../passport/change-password');
var fp = require('../passport/forgot-password');
var reg = require('../passport/register-user');
var rp = require('../passport/reset-password');
var users = require('../controllers/users.js');
var practices = require('../controllers/practices.js');
var patients = require('../controllers/patients.js');
var indicators = require('../controllers/indicators.js');
var events = require('../controllers/events.js');
var text = require('../controllers/text.js');

var isAuthenticated = function(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  req.session.redirect_to = req.path; //remember the page they tried to load
  res.redirect('/login');
};

var isAdmin = function(req, res, next) {
  if (req.user.roles.indexOf("admin") > -1) return next();
  res.redirect('/login');
};

module.exports = function(passport) {

  /* GET login page. */
  router.get('/login', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('pages/login.jade', { message: req.flash() });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', { failureFlash: true, failureRedirect: '/login' }), function(req, res) {
    events.login(req.user.email, req.sessionID);
    var red = req.session.redirect_to || '/';
    if (req.body.hash) red += '#' + req.body.hash;
    req.session.redirect_to = null;
    delete req.session.redirect_to;
    res.redirect(red);
  });

  /* GET Change password Page */
  router.get('/changepassword', isAuthenticated, function(req, res) {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  /* Handle Change password POST */
  router.post('/changepassword', isAuthenticated, cp, function(req, res) {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  //User forgets password
  router.get('/forgot', function(req, res) {
    res.render('pages/userforgot.jade');
  });
  router.post('/forgot', fp.forgot, function(req, res) {
    res.render('pages/userforgot.jade', { message: req.flash() });
  });
  router.get('/forgot/:token', function(req, res) {
    res.render('pages/newpassword.jade', { message: req.flash() });
  });
  router.post('/forgot/:token', fp.token, function(req, res) {
    res.render('pages/newpassword.jade', { message: req.flash() });
  });

  //User registration
  router.get('/register', function(req, res) {
    practices.list(function(err, practices) {
      res.render('pages/userregister.jade',  { practices: practices });
    });
  });
  router.post('/register', reg.register, function(req, res) {
    practices.list(function(err, practices) {
      res.render('pages/userregister.jade',  { practices: practices, message: req.flash() });
    });
  });
  router.get('/authorise/:email',  isAuthenticated, isAdmin, reg.authorise, function(req, res){
    res.render('pages/userauthorise.jade',  { message: req.flash() });
  });
  router.get('/reject/:email',  isAuthenticated, isAdmin, reg.reject, function(req, res){
    res.render('pages/userauthorise.jade',  { message: req.flash() });
  });


  /* Handle Logout */
  router.get('/signout', function(req, res) {
    events.logout(req.user.email, req.sessionID);
    req.logout();
    res.redirect('/login');
  });

  /* EVENT VIEWER */

  router.get('/events', isAuthenticated, isAdmin, function(req, res) {
    events.list({}, req.query.skip, req.query.limit, function(err, events) {
      res.render('pages/eventlist.jade', { events: events, message: req.flash() });
    });
  });

  router.get('/events/:email', isAuthenticated, isAdmin, function(req, res) {
    events.list({user: req.params.email},req.query.skip, req.query.limit, function(err, events) {
      res.render('pages/eventlist.jade', { events: events, message: req.flash() });
    });
  });

  /* USER ADMIN */
  router.get('/admin', isAuthenticated, isAdmin, function(req, res) {
    users.list(function(err, users) {
      res.render('pages/userlist.jade', { users: users, message: req.flash() });
    });
  });

  router.get('/adduser', isAuthenticated, isAdmin, function(req, res) {
    practices.list(function(err, practices) {
      res.render('pages/useradd.jade', { practices: practices, message: req.flash() });
    });
  });

  router.post('/adduser', isAuthenticated, isAdmin, function(req, res) {
    users.add(req, function(err, user, flash) {
      if (err || flash) {
        practices.list(function(err, practices) {
          res.render('pages/useradd.jade', { practices: practices, message: flash });
        });
      } else {
        res.redirect('/admin');
      }
    });
  });

  router.get('/delete/:email', isAuthenticated, isAdmin, function(req, res) {
    res.render('pages/userdelete.jade', { email: req.params.email });
  });

  router.post('/delete/:email', isAuthenticated, isAdmin, function(req, res) {
    users.delete(req.params.email, function(err, user, flash) {
      res.redirect('/admin');
    });
  });

  router.get('/edit/:email', isAuthenticated, isAdmin, function(req, res) {
    users.get(req.params.email, function(err, user) {
      practices.list(function(err, practices) {
        res.render('pages/useredit.jade', { practices: practices, user: user });
      });
    });
  });

  router.post('/edit/:email', isAuthenticated, isAdmin, function(req, res) {
    users.edit(req.params.email, req, function(err, user, msg) {
      if (err || msg) {
        users.get(req.params.email, function(err, user) {
          practices.list(function(err, practices) {
            res.render('pages/useredit.jade', { practices: practices, user: user, message: { error: msg } });
          });
        });
      } else {
        res.redirect('/admin');
      }
    });
  });

  router.get('/reset/:email', isAuthenticated, isAdmin, function(req, res) {
    res.render('pages/userreset.jade', { email: req.params.email });
  });

  router.post('/reset/:email', isAuthenticated, isAdmin, rp, function(req, res) {
    res.render('pages/userreset.jade', { message: req.flash() });
  });

  /* api */
  //store Event
  router.post('/api/event',function(req,res){
    if(!req.body.event) {
      res.send("No event posted");
    } else {
      req.body.event.sessionId = req.sessionID;
      req.body.event.user = req.user.email;
      events.add(req.body.event, function(err){
        if(err) res.send(err);
        else res.send("");
      });
    }
  });

  //Get nhs number lookup
  router.get('/api/nhs', isAuthenticated, function(req, res) {
    patients.nhsLookup(req.user.practiceId, function(err, lookup) {
      res.send(lookup);
    });
  });

  //Return a list of patients - not sure this is needed
  router.get('/api/ListOfPatients', isAuthenticated, function(req, res) {
    patients.list(function(err, patients) {
      res.send(patients);
    });
  });
  //Get a single patient's details - for use on the patient screen
  router.get('/api/PatientDetails/:patientId', isAuthenticated, function(req, res) {
    patients.get(req.params.patientId, function(err, patient) {
      res.send(patient);
    });
  });
  //Get list of patients for a practice and indicator - for use on indicator screen
  router.get('/api/PatientListForPractice/Indicator/:indicatorId', isAuthenticated, function(req, res) {
    patients.getListForIndicator(req.user.practiceId, req.params.indicatorId, function(err, patients) {
      res.send(patients);
    });
  });

  //Get list of indicators for a single practice - for use on the overview screen
  router.get('/api/ListOfIndicatorsForPractice', isAuthenticated, function(req, res) {
    indicators.list(req.user.practiceId, function(err, indicators) {
      res.send(indicators);
    });
  });
  //Get benchmark data for an indicator
  router.get('/api/BenchmarkDataFor/:indicatorId', isAuthenticated, function(req, res) {
    indicators.getBenchmark(req.params.indicatorId, function(err, benchmark) {
      res.send(benchmark);
    });
  });
  //Get trend data for a practice and an indicator
  router.get('/api/TrendDataForPractice/Indicator/:indicatorId', isAuthenticated, function(req, res) {
    indicators.getTrend(req.user.practiceId, req.params.indicatorId, function(err, trend) {
      res.send(trend);
    });
  });
  //Get text
  router.get('/api/Text', isAuthenticated, function(req, res) {
    text.get(function(err, textObj) {
      res.send(textObj);
    });
  });

  router.get('/', isAuthenticated, function(req, res, next) {
    res.render('pages/index.jade', { admin: req.user.roles.indexOf("admin") > -1, fullname: req.user.fullname });
  });

  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, isAuthenticated, function(req, res, next) {
    next();
  });

  return router;
};
