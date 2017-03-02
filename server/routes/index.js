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
var actions = require('../controllers/actions.js');
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

  router.get('/emailpreference', isAuthenticated, isAdmin, function(req, res) {
    res.render('pages/optOut.jade', { user: req.user });
  });

  router.post('/emailpreference', isAuthenticated, isAdmin, function(req, res) {
    users.updateEmailPreference(req.user.email, req.body.optout, function(err, user, msg) {
      if (err || msg) {
        res.render('pages/optOut.jade', { user: req.user });
      } else {
        res.render('pages/optOut.jade', { user: user, message: { success: "Email preference updated. " + (req.body.optout ? "You wil not longer receive our reminder emails." : "You are currently set to receive reminder emails.") } });
      }
    });
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
      res.render('pages/userregister.jade', { practices: practices });
    });
  });
  router.post('/register', reg.register, function(req, res) {
    practices.list(function(err, practices) {
      res.render('pages/userregister.jade', { practices: practices, message: req.flash() });
    });
  });
  router.get('/authorise/:email', isAuthenticated, isAdmin, reg.authorise, function(req, res) {
    res.render('pages/userauthorise.jade', { message: req.flash() });
  });
  router.get('/reject/:email', isAuthenticated, isAdmin, reg.reject, function(req, res) {
    res.render('pages/userauthorise.jade', { message: req.flash() });
  });


  /* Handle Logout */
  router.get('/signout', function(req, res) {
    if(req.user)
      events.logout(req.user.email, req.sessionID);
    req.session.destroy(function (err) {
      res.redirect('/login'); //Inside a callback… bulletproof!
    });
    //RW The below sometimes means the redirect occurs before the logout has finished
    //and the user remains logged in
    //req.logout();
    //res.redirect('/login');
  });

  /* EVENT VIEWER */

  router.get('/events', isAuthenticated, isAdmin, function(req, res) {
    events.list({}, req.query.skip, req.query.limit, function(err, events) {
      res.render('pages/eventlist.jade', { events: events, message: req.flash() });
    });
  });

  router.get('/eventsdownload', isAuthenticated, isAdmin, function(req, res) {
    events.download(req.query, function(err, fileExtension, events) {
      if (err) {
        console.log(err);
        res.send();
      }
      res.attachment('events.' + fileExtension);
      res.send(events);
    });
  });

  router.get('/events/:email', isAuthenticated, isAdmin, function(req, res) {
    events.list({ user: req.params.email }, req.query.skip, req.query.limit, function(err, events) {
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


  /* ACTIONS */
  router.post('/api/action/addTeam/:indicatorId?', isAuthenticated, function(req, res) {
    if (!req.body.actionText) {
      res.send("No action posted");
    } else {
      actions.addTeamAction(req.user.practiceId, req.params.indicatorId, req.user.fullname, req.body.actionText, function(err, action) {
        if (err) res.send(err);
        else {
          var evt = {
            type: "recordTeamPlan",
            data: [{ key: "text", value: req.body.actionText }],
            sessionId: req.sessionID,
            user: req.user.email
          };
          if (req.params.indicatorId) {
            evt.data.push({ key: "indicatorId", value: req.params.indicatorId });
          }
          events.add(evt, function(err) {
            res.send(action);
          });
        }
      });
    }
  });

  router.post('/api/action/addIndividual/:patientId', isAuthenticated, function(req, res) {
    if (!req.body.actionText) {
      res.send("No action posted");
    } else {
      actions.addIndividualAction(req.user.practiceId, req.params.patientId, req.body.indicatorList, req.user.fullname, req.body.actionText, function(err, action) {
        var evt = {
          type: "recordIndividualPlan",
          data: [
            { key: "text", value: req.body.actionText },
            { key: "patientId", value: req.params.patientId }
          ],
          sessionId: req.sessionID,
          user: req.user.email
        };
        events.add(evt, function(err) {
          res.send(action);
        });
      });
    }
  });
  router.delete('/api/action/userdefinedpatient/:patientId/:actionTextId', isAuthenticated, function(req, res) {
    actions.deleteUserDefinedPatientAction(req.params.patientId, req.params.actionTextId, function(err) {
      if (err) res.send(err);
      else res.send({ status: "ok" });
    });
  });
  router.post('/api/action/update/individual/:patientId', isAuthenticated, function(req, res) {
    actions.updateIndividual(req.user.practiceId, req.params.patientId, req.body.action, function(err, action) {
      if (err) res.send(err);
      else {
        var evt = {
          type: "undo",
          data: [
            { key: "action", value: req.body.action.actionTextId },
            { key: "patientId", value: req.params.patientId }
          ],
          sessionId: req.sessionID,
          user: req.user.email
        };
        if (req.body.action.agree === true) {
          evt.type = "agree";
        } else if (req.body.action.agree === false) {
          evt.type = "disagree";
          if(req.body.action.rejectedReasonText)
            evt.data.push({ key: "reasonText", value: req.body.action.rejectedReasonText });
        }
        events.add(evt, function(err) {
          res.send(action);
        });
      }
    });
  });
  router.post('/api/action/update/userdefinedpatient/:patientId/:actionTextId', isAuthenticated, function(req, res) {
    actions.updatePatientUserDefined(req.params.patientId, req.params.actionTextId, req.body.action, function(err, action) {
      if (err) res.send(err);
      else res.send(action);
    });
  });
  router.post('/api/action/update/team/:indicatorId?', isAuthenticated, function(req, res) {
    actions.updateTeam(req.user.practiceId, req.params.indicatorId, req.body.action, function(err, action) {
      if (err) res.send(err);
      else {
        var evt = {
          type: "undo",
          data: [{ key: "action", value: req.body.action.actionTextId }],
          sessionId: req.sessionID,
          user: req.user.email
        };
        if (req.params.indicatorId) {
          evt.data.push({ key: "indicatorId", value: req.params.indicatorId });
        }
        if (req.body.action.agree === true) {
          evt.type = "agree";
        } else if (req.body.action.agree === false) {
          evt.type = "disagree";
          if(req.body.action.rejectedReasonText)
            evt.data.push({ key: "reasonText", value: req.body.action.rejectedReasonText });
        }
        events.add(evt, function(err) {
          res.send(action);
        });
      }
    });
  });
  router.post('/api/action/update/userdefinedteam/:actionTextId', isAuthenticated, function(req, res) {
    actions.updateTeamUserDefined(req.params.actionTextId, req.body.action, function(err, action) {
      if (err) res.send(err);
      else res.send(action);
    });
  });
  router.delete('/api/action/userdefinedteam/:actionTextId', isAuthenticated, function(req, res) {
    actions.deleteUserDefinedTeamAction(req.params.actionTextId, function(err) {
      if (err) res.send(err);
      else res.send({ status: "ok" });
    });
  });
  router.get('/api/action/team/:indicatorId?', isAuthenticated, function(req, res) {
    indicators.getActions(req.user.practiceId, req.params.indicatorId, function(err, actions) {
      if (err) res.send(err);
      else res.send(actions);
    });
  });
  router.get('/api/action/individual/:patientId?', isAuthenticated, function(req, res) {
    patients.getActions(req.user.practiceId, req.params.patientId, function(err, actions) {
      if (err) res.send(err);
      if (req.params.patientId) res.send(actions[req.params.patientId]);
      else res.send(actions);
    });
  });
  router.get('/api/action/all', isAuthenticated, function(req, res) {
    actions.listAgreedWith(req.user.practiceId, function(err, actions) {
      if (err) res.send(err);
      var patientActions = actions.filter(function(v) {
        return v.patientId;
      });
      var teamActions = actions.filter(function(v) {
        return !v.patientId;
      });
      patients.getSpecificActions(patientActions, function(err, patientActionsReady) {
        if (err) res.send(err);
        indicators.getSpecificActions(req.user.practiceId, teamActions, function(err, teamActionsReady) {
          if (err) res.send(err);
          res.send({ patient: patientActionsReady, team: teamActionsReady });
        });
      });
    });
  });

  //store Event
  router.post('/api/event', function(req, res) {
    if (!req.body.event) {
      res.send("No event posted");
    } else {
      req.body.event.sessionId = req.sessionID;
      req.body.event.user = req.user.email;
      events.add(req.body.event, function(err) {
        if (err) res.send(err);
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

  //return user data
  router.get('/api/userDetails', isAuthenticated, function(req, res) {
    res.send({ fullname: req.user.fullname, practiceId: req.user.practiceId });
  });

  //return a list of all practices
  router.get('/api/ListOfPractices', isAuthenticated, function(req, res) {
    practices.list(function(err, practices) {
      res.send(practices);
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

  //note for 2xFn's below:
  //req.user.practiceId = inject current user practiceId
  //rep.params.practiceId = use practiceId passed by the function

  //Get list of indicators for a single practice - for use on the overview screen
  router.get('/api/ListOfIndicatorsForPractice', isAuthenticated, function(req, res) {
    indicators.list(req.user.practiceId, function(err, indicators) {
      res.send(indicators);
    });
  });

  //Get list of indicators for a single practice (inc option) - for use on the overview screen
  router.get('/api/ListOfIndicatorsForPractice/:practiceId', isAuthenticated, function(req, res) {
    indicators.list(req.params.practiceId, function(err, indicators) {
      res.send(indicators);
    });
  });
  //Get benchmark data for an indicator
  router.get('/api/BenchmarkDataFor/:indicatorId', isAuthenticated, function(req, res) {
    practices.list(function(err, practices) {
      indicators.getBenchmark(req.user.practiceId, practices, req.params.indicatorId, function(err, benchmark) {
        res.send(benchmark);
      });
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

  router.get('/img/:email/:token', function(req, res) {
    events.emailReminderOpenedTokenCheck(req.params.email, req.params.token);
    var buf = new Buffer(35);
    buf.write("R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");
    res.send(buf, { 'Content-Type': 'image/gif' }, 200);
  });

  router.get('/t/:token/*', function(req, res) {
    events.emailReminderTokenCheck(req.params.token, req.url);
    res.redirect('/login');
  });

  router.get('/t/:token', function(req, res) {
    events.emailReminderTokenCheck(req.params.token, req.url);
    res.redirect('/login');
  });

  router.get('/', isAuthenticated, function(req, res, next) {
    practices.get(req.user.practiceId, function(err, practice) {
      res.render('pages/index.jade', { admin: req.user.roles.indexOf("admin") > -1, fullname: req.user.fullname, practice_id: req.user.practiceId, practice_name: req.user.practiceName, practice_system: practice ? practice.ehr : "" });
    });
  });

  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, isAuthenticated, function(req, res, next) {
    next();
  });

  return router;
};
