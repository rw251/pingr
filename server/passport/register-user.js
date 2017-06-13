var User = require('../models/user'),
  crypto = require('crypto'),
  emailSender = require('../email-sender');

var config = require('../config');

module.exports = {
  register: function (req, res, next) {
    User.findOne({
      'email': req.body.email
    }, function (err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in user register: ' + err);
        req.flash('error', 'An error has occurred. Please try again.');
        return next();
      }
      // already exists
      if (user) {
        console.log('User already exists');
        req.flash('error', 'That email address is already in the system.');
        return next();
      } else {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          var els = req.body.practice.split("|");
          var newUser = new User({
            email: req.body.email,
            password: req.body.password,
            fullname: req.body.fullname,
            last_login: new Date(),
            emailFrequency: req.body.freq,
            emailDay: req.body.day,
            emailHour: req.body.hour,
            practiceIdNotAuthorised: els[0] !== "" ? els[0] : "",
            practiceNameNotAuthorised: els[0] !== "" ? els[1] : "None",
            registrationCode: token
          });

          // save the user
          newUser.save(function (err) {
            if (err) {
              console.log('Error saving user');
              req.flash('error', 'An error occurred please try again.');
              return next();
            }

            var emailConfig = emailSender.config(null, config.mail.adminEmailsFrom, config.mail.newUsersNotificationEmail.split(","), "PINGR: Request for access",
              "A user has requested to access pingr at " + config.server.url + ".\n\nName: " + req.body.fullname + "\n\nEmail: " + req.body.email + "\n\nPractice: " + els[1],
              null, null);

            //to is now in config file
            emailSender.send(emailConfig, function (error, info) {
              if (error) {
                console.log("email not sent: " + error);
              }
              emailConfig = emailSender.config(null, config.mail.reminderEmailsFrom, null, "PINGR: Validate email address",
              "We have received your request to access " + config.server.url + ".\n\nName: " + req.body.fullname + "\n\nEmail: " + req.body.email + "\n\nPractice: " + els[1] + "\n\nPlease confirm your email address by following this link: https://" + req.headers.host + "/register/" + token + ".",
              null, null);
              emailConfig.to = [{ name: newUser.fullname, email: newUser.email }];
              //emailConfig.text = "We have received your request to access " + config.server.url + ".\n\nName: " + req.body.fullname + "\n\nEmail: " + req.body.email + "\n\nPractice: " + els[1] + "\n\nWhen this has been authorised you will be sent another email.\n\nRegards\n\nPINGR";
              emailSender.send(emailConfig, function (error, info) {
                if (error) {
                  console.log("email not sent: " + error);
                }

                req.flash('success', 'Thanks for registering. You will receive an email shortly to confirm your email address. Please check your spam/junk folder - if the email is there then please mark it as not junk.');
                return next();
              });
            });
          });
        });
      }
    });
  },

  token: function(req, res, next) {
    User.findOne({
      'registrationCode': req.params.token
    }, function (err, user) {
      // In case of any error, return using the done method
      if (err || !user) {
        req.flash('error', 'User doesn\'t exist');
        return next();
      } else {
        user.registrationCode = undefined;
        user.save(function(err){
          req.flash('success', 'Thanks for validating your email - you can now login - though you may still need to wait to be authorised to view practice data.');
          return next();
        });
      }
    });
  },

  authorise: function (req, res, next) {
    User.findOne({
      'email': req.params.email
    }, function (err, user) {
      // In case of any error, return using the done method
      if (err || !user) {
        console.log('Error in user register: ' + err);
        req.flash('error', 'User doesn\'t exist');
        return next();
      } else {
        if (!user.practiceIdNotAuthorised || !user.practiceNameNotAuthorised) {
          console.log('No practice requested for user');
          req.flash('error', 'The user didn\'t request to view any practice.');
          return next();
        }

        user.practiceId = user.practiceIdNotAuthorised;
        user.practiceName = user.practiceNameNotAuthorised;
        user.practiceNameNotAuthorised = null;
        user.practiceIdNotAuthorised = null;

        user.save(function (err) {
          if (err) {
            console.log('Error saving user');
            req.flash('error', 'An error occurred updating the user.');
            return next();
          }
          //send email
          var emailConfig = emailSender.config(null, config.mail.adminEmailsFrom, { name: user.fullname, email: user.email }, "PINGR: Request for access",
            "You have been authorised to view PINGR for practice " + user.practiceName + "\n\nYou can access the site at " + config.server.url + ".\n\nRegards\n\nPINGR",
            null, null);
          emailSender.send(emailConfig, function (error, info) {
            if (error) {
              console.log("email not sent: " + error);
              req.flash('error', 'User authorised but confirmation email failed to send.');
              return next();
            } else {
              req.flash('success', 'User authorised and confirmation email sent to them.');
              return next();
            }
          });
        });
      }
    });
  },

  reject: function (req, res, next) {
    User.findOne({
      'email': req.params.email
    }, function (err, user) {
      // In case of any error, return using the done method
      if (err || !user) {
        console.log('Error in user register: ' + err);
        req.flash('error', 'User doesn\'t exist');
        return next();
      } else {
        User.remove({ 'email': user.email }, function (err) {
          if (err) {
            console.log('Error removing user');
            req.flash('error', 'An error occurred deleting the user.');
            return next();
          }
          //send email
          var emailConfig = emailSender.config(null, config.mail.adminEmailsFrom, { name: user.fullname, email: user.email }, "PINGR: Request for access",
            "You have been denied access to view PINGR for practice " + user.practiceNameNotAuthorised + "\n\nIf you think this is a mistake please get in touch.\n\nRegards\n\nPINGR",
            null, null);
          emailSender.send(emailConfig, function (error, info) {
            if (error) {
              console.log("email not sent: " + error);
              req.flash('error', 'User rejected but confirmation email failed to send.');
              return next();
            } else {
              req.flash('success', 'User rejected and rejection email sent to them.');
              return next();
            }
          });
        });
      }
    });
  }

};
