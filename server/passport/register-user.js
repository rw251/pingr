const User = require('../models/user');
const crypto = require('crypto');
const emailSender = require('../email-sender');
const indicators = require('../controllers/indicators');
const patients = require('../controllers/patients');

const config = require('../config');

module.exports = {
  register(req, res, next) {
    User.findOne({
      email: req.body.email,
    }, (err, user) => {
      // In case of any error, return using the done method
      if (err) {
        console.log(`Error in user register: ${err}`);
        req.flash('error', 'An error has occurred. Please try again.');
        return next();
      }
      // already exists
      if (user) {
        console.log('User already exists');
        req.flash('error', 'That email address is already in the system.');
        return next();
      }
      return crypto.randomBytes(20, (cErr, buf) => {
        indicators.getList((getErr, indicatorList) => {
          const token = buf.toString('hex');
          if (typeof req.body.practice === 'string') req.body.practice = [req.body.practice];
          const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            fullname: req.body.fullname,
            last_login: new Date(),
            // practiceIdNotAuthorised: els[0] !== "" ? els[0] : "",
            // practiceNameNotAuthorised: els[0] !== "" ? els[1] : "None",
            registrationCode: token,
            emailFrequency: req.body.freq,
            emailDay: req.body.day,
            emailHour: req.body.hour,
          });

          if (req.body.indicatorIdsToInclude) {
            const indicatorsToExclude = {};
            indicatorList.forEach((i) => {
              indicatorsToExclude[i._id] = true;
            });
            // either string or array depending on whether 1 or more things selected
            if (typeof req.body.indicatorIdsToInclude === 'string') req.body.indicatorIdsToInclude = [req.body.indicatorIdsToInclude];
            req.body.indicatorIdsToInclude.forEach((i) => {
              delete indicatorsToExclude[i];
            });
            newUser.emailIndicatorIdsToExclude = Object.keys(indicatorsToExclude);
          } else {
            newUser.emailIndicatorIdsToExclude = indicatorList.map(i => i._id);
          }
          if (req.body.patientsToInclude) {
            const patientTypesToExclude = {};
            patients.possibleExcludeType.forEach((i) => {
              patientTypesToExclude[i.id] = true;
            });
            if (typeof req.body.patientsToInclude === 'string') req.body.patientsToInclude = [req.body.patientsToInclude];
            req.body.patientsToInclude.forEach((i) => {
              delete patientTypesToExclude[i];
            });
            newUser.patientTypesToExclude = Object.keys(patientTypesToExclude);
          } else {
            newUser.patientTypesToExclude = patients.possibleExcludeType.map(i => i.id);
          }

          newUser.practices = req.body.practice.map((v) => {
            const els = v.split('|');
            if (els[0] !== '') {
              return { id: els[0], name: els[1], authorised: false };
            }
            return null;
          }).filter(v => v);

          const practiceString = newUser.practices.map(v => v.name).join(', ');

          // save the user
          newUser.save((saveErr) => {
            if (saveErr) {
              console.log('Error saving user');
              req.flash('error', 'An error occurred please try again.');
              return next();
            }

            let emailConfig = emailSender.config(
              config.mail.type, config.mail.adminEmailsFrom, config.mail.newUsersNotificationEmail.split(','), 'PINGR: Request for access',
              `A user has requested to access pingr at ${config.server.url}.\n\nName: ${req.body.fullname}\n\nEmail: ${req.body.email}\n\nPractice(s): ${practiceString}`,
              null, null
            );

              // to is now in config file
            return emailSender.send(emailConfig, (sendError) => {
              if (sendError) {
                console.log(`email not sent: ${sendError}`);
              }
              emailConfig = emailSender.config(
                config.mail.type, config.mail.reminderEmailsFrom, null, 'PINGR: Validate email address',
                `We have received your request to access ${config.server.url}.\n\nName: ${req.body.fullname}\n\nEmail: ${req.body.email}\n\nPractice(s): ${practiceString}\n\nPlease confirm your email address by following this link: https://${req.headers.host}/register/${token}.`,
                null, null
              );
              emailConfig.to = [{ name: newUser.fullname, email: newUser.email }];
              // emailConfig.text = "We have received your request to access " + config.server.url +
              // ".\n\nName: " + req.body.fullname + "\n\nEmail: " + req.body.email + "\n\nPractice:
              // " + els[1] + "\n\nWhen this has been authorised you will be sent another email.
              // \n\nRegards\n\nPINGR";
              emailSender.send(emailConfig, (error) => {
                if (error) {
                  console.log(`email not sent: ${error}`);
                }

                req.flash('success', 'Thanks for registering. You will receive an email shortly to confirm your email address.');
                req.flash('warning', 'Please check your spam/junk folder - if the email is there then please mark it as not junk.');
                return next();
              });
            });
          });
        });
      });
    });
  },

  token(req, res, next) {
    User.findOne({
      registrationCode: req.params.token,
    }, (err, user) => {
      // In case of any error, return using the done method
      if (err || !user) {
        req.flash('error', 'User doesn\'t exist');
        return next();
      }
      user.registrationCode = undefined;
      return user.save(() => {
        req.flash('success', 'Thanks for validating your email - you can now login - though you may still need to wait to be authorised to view practice data.');
        return next();
      });
    });
  },

  authorise(req, res, next) {
    User.findOne({
      email: req.params.email,
    }, (err, user) => {
      // In case of any error, return using the done method
      if (err || !user) {
        console.log(`Error in user register: ${err}`);
        req.flash('error', 'User doesn\'t exist');
        return next();
      }
      // if (!user.practiceIdNotAuthorised || !user.practiceNameNotAuthorised) {
      if (!user.practices || user.practices.length === 0) {
        console.log('No practice requested for user');
        req.flash('error', 'The user didn\'t request to view any practice.');
        return next();
      }

      user.practices = user.practices.map((v) => {
        v.authorised = true;
        return v;
      });
      // user.practiceId = user.practiceIdNotAuthorised;
      // user.practiceName = user.practiceNameNotAuthorised;
      // user.practiceNameNotAuthorised = null;
      // user.practiceIdNotAuthorised = null;

      return user.save((saveErr) => {
        if (saveErr) {
          console.log('Error saving user');
          req.flash('error', 'An error occurred updating the user.');
          return next();
        }
        // send email
        const emailConfig = emailSender.config(
          config.mail.type, config.mail.adminEmailsFrom, { name: user.fullname, email: user.email }, 'PINGR: Request for access',
          `You have been authorised to view PINGR for practice(s) ${user.practices.map(v => v.name).join(', ')}\n\nYou can access the site at ${config.server.url}.\n\nRegards\n\nPINGR`,
          null, null
        );
        return emailSender.send(emailConfig, (error) => {
          if (error) {
            console.log(`email not sent: ${error}`);
            req.flash('error', 'User authorised but confirmation email failed to send.');
            return next();
          }
          req.flash('success', 'User authorised and confirmation email sent to them.');
          return next();
        });
      });
    });
  },

  reject(req, res, next) {
    User.findOne({
      email: req.params.email,
    }, (err, user) => {
      // In case of any error, return using the done method
      if (err || !user) {
        console.log(`Error in user register: ${err}`);
        req.flash('error', 'User doesn\'t exist');
        return next();
      }
      return User.remove({ email: user.email }, (removeErr) => {
        if (removeErr) {
          console.log('Error removing user');
          req.flash('error', 'An error occurred deleting the user.');
          return next();
        }
        // send email
        const emailConfig = emailSender.config(
          config.mail.type, config.mail.adminEmailsFrom, { name: user.fullname, email: user.email }, 'PINGR: Request for access',
          `You have been denied access to view PINGR for practice(s) ${user.practices.map(v => v.name).join(', ')}\n\nIf you think this is a mistake please get in touch.\n\nRegards\n\nPINGR`,
          null, null
        );
        return emailSender.send(emailConfig, (error) => {
          if (error) {
            console.log(`email not sent: ${error}`);
            req.flash('error', 'User rejected but confirmation email failed to send.');
            return next();
          }
          req.flash('success', 'User rejected and rejection email sent to them.');
          return next();
        });
      });
    });
  },

};
