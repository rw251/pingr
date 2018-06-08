const express = require('express');
const cp = require('../passport/change-password');
const fp = require('../passport/forgot-password');
const reg = require('../passport/register-user');
const rp = require('../passport/reset-password');
const users = require('../controllers/users.js');
const practices = require('../controllers/practices.js');
const patients = require('../controllers/patients.js');
const excludedPatients = require('../controllers/excludedPatients.js');
const indicators = require('../controllers/indicators.js');
const events = require('../controllers/events.js');
const actions = require('../controllers/actions.js');
const emails = require('../controllers/emails.js');
const emailSender = require('../email-sender.js');
const text = require('../controllers/text.js');
const utils = require('../controllers/utils.js');
const config = require('../config');
const tutorials = require('../tutorials');
const abRoutes = require('./ab');
const { isAuthenticated, isAdmin, isUserOkToViewPractice } = require('./helpers');

const router = express.Router();

module.exports = (passport) => {
  /* GET login page. */
  router.get('/login', (req, res) => {
    // Display the Login page with any flash message, if any
    res.render('pages/login.jade', { message: req.flash() });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    events.login(req.user.email, req.sessionID);
    let red = req.session.redirect_to || '/';
    if (req.body.hash) red += `#${req.body.hash}`;
    req.session.redirect_to = null;
    delete req.session.redirect_to;

    // seems this is the only way to actually pass somwthing from the user object
    req.session.previousLogin = req.user.previousLogin;

    res.redirect(red);
  });

  /* GET Change password Page */
  router.get('/changepassword', isAuthenticated, (req, res) => {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  /* Handle Change password POST */
  router.post('/changepassword', isAuthenticated, cp, (req, res) => {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  router.get('/emailpreference', isAuthenticated, (req, res) => {
    indicators.getList((err, indicatorList) => {
      res.render('pages/optOut.jade', { user: req.user, indicatorList, patientsToIncludeList: patients.possibleExcludeType });
    });
  });

  router.post('/emailpreference', isAuthenticated, (req, res) => {
    indicators.getList((err, indicatorList) => {
      users.updateEmailPreference(req.user.email, req.body, (updateErr, user, msg) => {
        if (updateErr || msg) {
          res.render('pages/optOut.jade', { user: req.user, indicatorList, patientsToIncludeList: patients.possibleExcludeType });
        } else {
          res.render('pages/optOut.jade', { user, indicatorList, patientsToIncludeList: patients.possibleExcludeType, message: { success: `Email preference updated. ${req.body.freq === '0' ? 'You wil not longer receive our reminder emails.' : 'You are currently set to receive reminder emails.'}` } });
        }
      });
    });
  });

  router.get('/emailsample', isAuthenticated, (req, res, next) => {
    emails.sample(req.user, (err, sampleEmail) => {
      if (err) return next(err);
      return res.send(sampleEmail);
    });
  });

  router.post('/emailsendtest', isAuthenticated, isAdmin, (req, res, next) => {
    const emailConfig = emailSender.config(req.body.type === 'smtp' ? 'SMTP' : config.mail.type, config.mail.reminderEmailsFrom, req.body.to.replace(',', ';').split(';').map(v => ({ name: v.split('@')[0], email: v })), req.body.subject, req.body.text, req.body.html, null);

    emailSender.send(emailConfig, (err) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        res.send(true);
      }
    });
  });

  router.get('/emailadd', isAuthenticated, isAdmin, (req, res) => {
    utils.getDataForEmails(req.user.practices[0].id, req.user, (err, data) => {
      data.message = req.flash();
      res.render('pages/emailadd.jade', data);
    });
  });

  router.post('/emailadd', isAuthenticated, isAdmin, (req, res) => {
    emails.create(req, (err, email, msg) => {
      if (err || msg) {
        utils.getDataForEmails(req.user.practices[0].id, req.user, (getErr, data) => {
          data.message = { error: msg };
          res.render('pages/emailadd.jade', data);
        });
      } else {
        res.redirect('/emailadmin');
      }
    });
  });

  router.post('/emaildefault/:label', isAuthenticated, isAdmin, (req, res, next) => {
    emails.setDefault(req.params.label, (err) => {
      if (err) next(err);
      else res.send(true);
    });
  });

  router.get('/emailedit/:label', isAuthenticated, isAdmin, (req, res) => {
    utils.getDataForEmails(req.user.practices[0].id, req.user, (err, data) => {
      emails.get(req.params.label, (getErr, email) => {
        data.email = email;
        res.render('pages/emailedit.jade', data);
      });
    });
  });

  router.post('/emailedit/:label', isAuthenticated, isAdmin, (req, res) => {
    emails.edit(req.params.label, req, (err, user, msg) => {
      if (err || msg) {
        utils.getDataForEmails(req.user.practices[0].id, req.user, (getDataErr, data) => {
          emails.get(req.params.label, (getErr, email) => {
            data.email = email;
            data.message = { error: msg };
            res.render('pages/emailedit.jade', data);
          });
        });
      } else {
        res.redirect('/emailadmin');
      }
    });
  });

  router.get('/emaildelete/:label', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/emaildelete.jade', { label: req.params.label });
  });

  router.post('/emaildelete/:label', isAuthenticated, isAdmin, (req, res) => {
    emails.delete(req.params.label, () => {
      res.redirect('/emailadmin');
    });
  });

  router.get('/emailadmin', isAuthenticated, isAdmin, (req, res) => {
    utils.getDataForEmails(req.user.practices[0].id, req.user, (err, data) => {
      emails.list((listErr, emailList) => {
        if (listErr) {
          console.log(listErr);
          res.send();
        } else {
          data.emailList = emailList;
          data.reminderEmailsFrom = config.mail.reminderEmailsFrom;
          data.adminEmailsFrom = config.mail.adminEmailsFrom;
          data.newUsersNotificationEmail = config.mail.newUsersNotificationEmail;
          data.serverUrl = config.server.url;
          res.render('pages/emailadmin.jade', data);
        }
      });
    });
  });

  abRoutes.applyTo(router);

  // User forgets password
  router.get('/auth/reset', (req, res) => {
    res.render('pages/auth-forgot-password.jade');
  });
  router.post('/auth/reset', fp.forgot, (req, res) => {
    res.render('pages/auth-forgot-password.jade', { message: req.flash() });
  });
  router.get('/auth/reset/:token', (req, res) => {
    res.render('pages/newpassword.jade', { message: req.flash() });
  });
  router.post('/auth/reset/:token', fp.token, (req, res) => {
    res.render('pages/newpassword.jade', { message: req.flash() });
  });

  // User registration
  router.get('/register', (req, res) => {
    indicators.getList((err, indicatorList) => {
      practices.list((listErr, practiceList) => {
        res.render('pages/auth-register.jade', {
          user: {},
          practiceList,
          indicatorList,
          patientsToIncludeList: patients.possibleExcludeType,
        });
      });
    });
  });
  router.post('/register', reg.register, (req, res) => {
    indicators.getList((err, indicatorList) => {
      practices.list((listErr, practiceList) => {
        res.render('pages/auth-register.jade', {
          user: {},
          practiceList,
          indicatorList,
          patientsToIncludeList: patients.possibleExcludeType,
          message: req.flash(),
        });
      });
    });
  });
  router.get('/register/:token', reg.token, (req, res) => {
    indicators.getList((err, indicatorList) => {
      practices.list((listErr, practiceList) => {
        res.render('pages/auth-register.jade', {
          user: {},
          practiceList,
          indicatorList,
          patientsToIncludeList: patients.possibleExcludeType,
          message: req.flash(),
        });
      });
    });
  });
  router.get('/authorise/:email', isAuthenticated, isAdmin, reg.authorise, (req, res) => {
    res.render('pages/userauthorise.jade', { message: req.flash() });
  });
  router.get('/reject/:email', isAuthenticated, isAdmin, reg.reject, (req, res) => {
    res.render('pages/userauthorise.jade', { message: req.flash() });
  });


  /* Handle Logout */
  router.get('/signout', (req, res) => {
    if (req.user) {
      events.logout(req.user.email, req.sessionID);
    }
    req.logout();
    req.session.destroy(() => {
      res.redirect('/login'); // Inside a callback… bulletproof!
    });
    // RW The below sometimes means the redirect occurs before the logout has finished
    // and the user remains logged in
    // req.logout();
    // res.redirect('/login');
  });

  /* EVENT VIEWER */

  router.get('/events', isAuthenticated, isAdmin, (req, res) => {
    events.list({}, req.query.skip, req.query.limit, (err, eventList) => {
      res.render('pages/eventlist.jade', { eventList, message: req.flash() });
    });
  });

  router.get('/eventsdownload', isAuthenticated, isAdmin, (req, res) => {
    events.download(req.query, (err, fileExtension, eventList) => {
      if (err) {
        console.log(err);
        res.send();
      }
      res.attachment(`events.${fileExtension}`);
      res.send(eventList);
    });
  });

  router.get('/events/:email', isAuthenticated, isAdmin, (req, res) => {
    events.list({ user: req.params.email }, req.query.skip, req.query.limit, (err, eventList) => {
      res.render('pages/eventlist.jade', { eventList, message: req.flash() });
    });
  });

  /* USER ADMIN */
  router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    users.list((err, userList) => {
      res.render('pages/userlist.jade', { userList, message: req.flash() });
    });
  });

  router.get('/adduser', isAuthenticated, isAdmin, (req, res) => {
    indicators.getList((err, indicatorList) => {
      practices.list((listErr, practiceList) => {
        res.render('pages/useradd.jade', {
          user: {},
          practiceList,
          indicatorList,
          patientsToIncludeList: patients.possibleExcludeType,
          message: req.flash(),
        });
      });
    });
  });

  router.post('/adduser', isAuthenticated, isAdmin, (req, res) => {
    users.add(req, (err, user, flash) => {
      if (err || flash) {
        indicators.getList((indicatorListErr, indicatorList) => {
          practices.list((practiceListErr, practiceList) => {
            res.render('pages/useradd.jade', {
              user: {},
              practiceList,
              indicatorList,
              patientsToIncludeList: patients.possibleExcludeType,
              message: flash,
            });
          });
        });
      } else {
        res.redirect('/admin');
      }
    });
  });

  router.get('/delete/:email', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/userdelete.jade', { email: req.params.email });
  });

  router.post('/delete/:email', isAuthenticated, isAdmin, (req, res) => {
    users.delete(req.params.email, () => {
      res.redirect('/admin');
    });
  });

  router.get('/edit/:email', isAuthenticated, isAdmin, (req, res) => {
    users.get(req.params.email, (err, user) => {
      indicators.getList((getListErr, indicatorList) => {
        practices.list((getErr, practiceList) => {
          res.render('pages/useredit.jade', { user, practiceList, indicatorList, patientsToIncludeList: patients.possibleExcludeType });
        });
      });
    });
  });

  router.post('/edit/:email', isAuthenticated, isAdmin, (req, res) => {
    users.edit(req.params.email, req, (err, editedUser, msg) => {
      if (err || msg) {
        users.get(req.params.email, (getErr, user) => {
          indicators.getList((getListErr, indicatorList) => {
            practices.list((listErr, practiceList) => {
              res.render('pages/useredit.jade', {
                user,
                practiceList,
                indicatorList,
                patientsToIncludeList: patients.possibleExcludeType,
                message: { error: msg },
              });
            });
          });
        });
      } else {
        res.redirect('/admin');
      }
    });
  });

  router.get('/reset/:email', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/userreset.jade', { email: req.params.email });
  });

  router.post('/reset/:email', isAuthenticated, isAdmin, rp, (req, res) => {
    res.render('pages/userreset.jade', { message: req.flash() });
  });

  /* api */


  /* ACTIONS */
  router.post('/api/action/addTeam/:practiceId/:indicatorId?', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    if (!req.body.actionText) {
      res.send('No action posted');
    } else {
      actions.addTeamAction(
        req.params.practiceId,
        req.params.indicatorId,
        req.user.fullname,
        req.body.actionText,
        (err, action) => {
          if (err) res.send(err);
          else {
            const evt = {
              type: 'recordTeamPlan',
              data: [{ key: 'text', value: req.body.actionText }],
              sessionId: req.sessionID,
              user: req.user.email,
            };
            if (req.params.indicatorId) {
              evt.data.push({ key: 'indicatorId', value: req.params.indicatorId });
            }
            events.add(evt, () => {
              res.send(action);
            });
          }
        }
      );
    }
  });

  router.post('/api/action/addIndividual/:practiceId/:patientId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    if (!req.body.actionText) {
      res.send('No action posted');
    } else {
      actions.addIndividualAction(
        req.params.practiceId,
        req.params.patientId,
        req.body.indicatorList,
        req.user.fullname,
        req.body.actionText,
        (err, action) => {
          const evt = {
            type: 'recordIndividualPlan',
            data: [
              { key: 'text', value: req.body.actionText },
              { key: 'patientId', value: req.params.patientId },
            ],
            sessionId: req.sessionID,
            user: req.user.email,
          };
          events.add(evt, () => {
            res.send(action);
          });
        }
      );
    }
  });
  router.delete('/api/action/userdefinedpatient/:patientId/:actionTextId', isAuthenticated, (req, res) => {
    actions.deleteUserDefinedPatientAction(req.params.patientId, req.params.actionTextId, (err) => {
      if (err) res.send(err);
      else res.send({ status: 'ok' });
    });
  });
  router.post('/api/action/update/individual/:practiceId/:patientId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    actions.updateIndividual(
      req.params.practiceId,
      req.params.patientId,
      req.body.action,
      (err, action) => {
        if (err) res.send(err);
        else {
          const evt = {
            type: 'undo',
            data: [
              { key: 'action', value: req.body.action.actionTextId },
              { key: 'patientId', value: req.params.patientId },
            ],
            sessionId: req.sessionID,
            user: req.user.email,
          };
          if (req.body.action.agree === true) {
            evt.type = 'agree';
          } else if (req.body.action.agree === false) {
            evt.type = 'disagree';
            if (req.body.action.rejectedReasonText) { evt.data.push({ key: 'reasonText', value: req.body.action.rejectedReasonText }); }
          }
          events.add(evt, () => {
            res.send(action);
          });
        }
      }
    );
  });
  router.post('/api/action/update/userdefinedpatient/:patientId/:actionTextId', isAuthenticated, (req, res) => {
    actions.updatePatientUserDefined(
      req.params.patientId,
      req.params.actionTextId,
      req.body.action,
      (err, action) => {
        if (err) res.send(err);
        else res.send(action);
      }
    );
  });
  router.post('/api/action/update/team/:practiceId/:indicatorId?', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    actions.updateTeam(
      req.params.practiceId,
      req.params.indicatorId,
      req.body.action,
      (err, action) => {
        if (err) res.send(err);
        else {
          const evt = {
            type: 'undo',
            data: [{ key: 'action', value: req.body.action.actionTextId }],
            sessionId: req.sessionID,
            user: req.user.email,
          };
          if (req.params.indicatorId) {
            evt.data.push({ key: 'indicatorId', value: req.params.indicatorId });
          }
          if (req.body.action.agree === true) {
            evt.type = 'agree';
          } else if (req.body.action.agree === false) {
            evt.type = 'disagree';
            if (req.body.action.rejectedReasonText) { evt.data.push({ key: 'reasonText', value: req.body.action.rejectedReasonText }); }
          }
          events.add(evt, () => {
            res.send(action);
          });
        }
      }
    );
  });
  router.post('/api/action/update/userdefinedteam/:actionTextId', isAuthenticated, (req, res) => {
    actions.updateTeamUserDefined(req.params.actionTextId, req.body.action, (err, action) => {
      if (err) res.send(err);
      else res.send(action);
    });
  });
  router.delete('/api/action/userdefinedteam/:actionTextId', isAuthenticated, (req, res) => {
    actions.deleteUserDefinedTeamAction(req.params.actionTextId, (err) => {
      if (err) res.send(err);
      else res.send({ status: 'ok' });
    });
  });
  router.get('/api/action/team/:practiceId/:indicatorId?', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    indicators.getActions(
      req.params.practiceId,
      req.params.indicatorId,
      req.user,
      (err, actionList) => {
        if (err) res.send(err);
        else res.send(actionList);
      }
    );
  });
  router.get('/api/action/individual/:practiceId/:patientId?', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    patients.getActions(
      req.params.practiceId,
      req.params.patientId,
      req.user,
      (err, actionList) => {
        if (err) res.send(err);
        if (req.params.patientId) res.send(actionList[req.params.patientId]);
        else res.send(actionList);
      }
    );
  });
  router.get('/api/action/all/:practiceId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    actions.listAgreedWith(req.params.practiceId, (err, actionList) => {
      if (err) res.send(err);
      const patientActions = actionList.filter(v => v.patientId);
      const teamActions = actionList.filter(v => !v.patientId);
      patients.getSpecificActions(patientActions, (getPErr, patientActionsReady) => {
        if (getPErr) res.send(getPErr);
        indicators.getSpecificActions(
          req.params.practiceId,
          teamActions,
          (getIErr, teamActionsReady) => {
            if (getIErr) res.send(getIErr);
            res.send({ patient: patientActionsReady, team: teamActionsReady });
          }
        );
      });
    });
  });

  // mark tutorial as viewed
  router.post('/api/tutorial/viewed', (req, res, next) => {
    users.tutorialViewed(req.user, (err) => {
      if (err) next(err);
      else res.send(true);
    });
  });

  // store Event
  router.post('/api/event', (req, res, next) => {
    if (!req.body.event) {
      next(new Error('No event posted'));
    } else {
      req.body.event.sessionId = req.sessionID;
      req.body.event.user = req.user.email;
      events.add(req.body.event, (err) => {
        if (err) next(err);
        else res.send(true);
      });
    }
  });

  // Get nhs number lookup
  router.get('/api/nhs/:practiceId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    patients.nhsLookup(req.params.practiceId, (err, lookup) => {
      res.send(lookup);
    });
  });

  // return a list of all practices
  router.get('/api/ListOfPractices', isAuthenticated, (req, res) => {
    practices.list((err, practiceList) => {
      res.send(practiceList);
    });
  });

  // Return a list of patients - not sure this is needed
  router.get('/api/ListOfPatients', isAuthenticated, (req, res) => {
    patients.list((err, patientList) => {
      res.send(patientList);
    });
  });
  // Return a page of the low hanging fruit patients
  router.get('/api/WorstPatients/:practiceId/:skip/:limit', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    patients.getAllPatientsPaginated(
      req.params.practiceId,
      req.user,
      +req.params.skip,
      +req.params.limit,
      (err, patientList) => {
        res.send(patientList);
      }
    );
  });
  // Get a single patient's details - for use on the patient screen
  router.get('/api/PatientDetails/:patientId', isAuthenticated, (req, res) => {
    patients.get(req.params.patientId, req.user, (err, patient) => {
      res.send(patient);
    });
  });
  // Get list of patients for a practice and indicator - for use on indicator screen
  router.get('/api/PatientListForPractice/:practiceId/Indicator/:indicatorId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    patients.getListForIndicator(
      req.params.practiceId,
      req.params.indicatorId,
      (err, patientList, type) => {
        res.send({ patients: patientList, type });
      }
    );
  });

  // Exclude a patient from an indicator
  router.post('/api/exclude/patient/:patientId/for/indicator/:indicatorId/practice/:practiceId', isAuthenticated, isUserOkToViewPractice, excludedPatients.exclude);
  // Include a patient from an indicator
  router.post('/api/include/patient/:patientId/for/indicator/:indicatorId/practice/:practiceId', isAuthenticated, isUserOkToViewPractice, excludedPatients.include);
  // Get all exclusions for a practice
  router.get('/api/excludedpatients/practice/:practiceId', isAuthenticated, isUserOkToViewPractice, excludedPatients.get);

  // note for 2xFn's below:
  // req.user.practiceId = inject current user practiceId
  // rep.params.practiceId = use practiceId passed by the function
  // RW - ah but now we can have multiple practices so we have req.user.practices as an array

  // Get list of indicators for a single practice - for use on the overview screen
  router.get('/api/ListOfIndicatorsForPractice', isAuthenticated, (req, res) => {
    const authorisedPractices = req.user.practices.filter(v => v.authorised);
    const practiceId = authorisedPractices.length > 0 ? authorisedPractices[0].id : null;
    indicators.list(practiceId, req.user, (err, indicatorList) => {
      res.send(indicatorList);
    });
  });

  // Get list of indicators for a single practice (inc option) - for use on the overview screen
  router.get('/api/ListOfIndicatorsForPractice/:practiceId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    indicators.list(req.params.practiceId, req.user, (err, indicatorList) => {
      res.send(indicatorList);
    });
  });
  // Get benchmark data for an indicator
  router.get('/api/BenchmarkDataFor/:practiceId/:indicatorId', isAuthenticated, isUserOkToViewPractice, (req, res) => {
    practices.list((err, practiceList) => {
      indicators.getBenchmark(
        req.params.practiceId,
        practiceList,
        req.params.indicatorId,
        (cbErr, benchmark) => {
          res.send(benchmark);
        }
      );
    });
  });
  // Get trend data for a practice and an indicator
  // router.get('/api/TrendDataForPractice/:practiceId/Indicator/:indicatorId',
  // isAuthenticated, isUserOkToViewPractice, function(req, res) {
  //   indicators.getTrend(req.params.practiceId, req.params.indicatorId, function(err, trend) {
  //     res.send(trend);
  //   });
  // });
  // Get text
  router.get('/api/Text', isAuthenticated, (req, res) => {
    text.get(req.user, (err, textObj) => {
      res.send(textObj);
    });
  });

  router.get('/img/:email/:token', (req, res) => {
    events.emailReminderOpenedTokenCheck(req.params.email, req.params.token);
    const buf = Buffer.allocUnsafe(35);
    buf.write('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
    res.send(buf, { 'Content-Type': 'image/gif' }, 200);
  });

  router.get('/t/:token/*', (req, res) => {
    events.emailReminderTokenCheck(req.params.token, req.url);
    res.redirect('/');
  });

  router.get('/t/:token', (req, res) => {
    events.emailReminderTokenCheck(req.params.token, req.url);
    res.redirect('/');
  });

  router.get('/', isAuthenticated, (req, res) => {
    // practices.get(req.user.practiceId, function(err, practice) {
    //   res.render('pages/index.jade', { admin: req.user.roles.indexOf("admin") > -1,
    // fullname: req.user.fullname, practice_id: req.user.practiceId, practice_name:
    //  req.user.practiceName, practice_system: practice ? practice.ehr : "" });
    // });
    const practiceIds = req.user.practices.map(v => v.id);
    practices.getMany(practiceIds, (err, practiceList) => {
      res.render('pages/index.jade', { admin: req.user.roles.indexOf('admin') > -1, fullname: req.user.fullname, practiceList, selectedPractice: practiceList[0], tutorials, last_login: req.session.previousLogin, last_viewed_tutorial: req.user.last_viewed_tutorial });
    });
  });

  /* Ensure all other html/js resources are only accessible if authenticated */
  // RW - there is now nothing sensitive in js / html files so all can be let through
  // router.get(/^\/(.*html|.*js|)$/, isAuthenticated, (req, res, next) => {
  //   next();
  // });

  return router;
};
