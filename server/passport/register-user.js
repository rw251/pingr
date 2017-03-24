var User = require('../models/user'),
  emailSender = require('../email-sender');

var config = require('../config');

module.exports = {
  register: function(req, res, next) {
    User.findOne({
      'email': req.body.email
    }, function(err, user) {
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
        var els = req.body.practice.split("|");
        var newUser = new User({
          email: req.body.email,
          password: req.body.password,
          fullname: req.body.fullname,
          last_login: new Date(),
          practiceIdNotAuthorised: els[0] !== "" ? els[0] : "",
          practiceNameNotAuthorised: els[0] !== "" ? els[1] : "None"
        });

        // save the user
        newUser.save(function(err) {
          if (err) {
            console.log('Error saving user');
            req.flash('error', 'An error occurred please try again.');
            return next();
          }

          var emailConfig = emailSender.config(null, config.mail.adminEmailsFrom, config.mail.newUsersNotificationEmail.split(","), "PINGR: Request for access",
            "A user has requested to access pingr at " + config.server.url + ".\n\nName: " + req.body.fullname + "\n\nEmail: " + req.body.email + "\n\nPractice: " + els[1],
            null, null);

          //to is now in config file
          emailSender.send(emailConfig, function(error, info) {
            if (error) {
              console.log("email not sent: " + error);
            }
            emailConfig.to = [{name: newUser.fullname, email: newUser.email}];
            emailConfig.subject = "PINGR: Request for access";
            emailConfig.text = "We have received your request to access " + config.server.url + ".\n\nName: " + req.body.fullname + "\n\nEmail: " + req.body.email + "\n\nPractice: " + els[1] + "\n\nWhen this has been authorised you will be sent another email.\n\nRegards\n\nPINGR";
            emailSender.send(emailConfig, function(error, info) {
              if (error) {
                console.log("email not sent: " + error);
              }
              req.flash('success', 'Thanks for registering. You will receive an email shortly when your request has been authorised. You can log in to PINGR now, but you won\'t see any data until you are authorised.');
              return next();
            });
          });
        });
      }
    });
  },

  authorise: function(req, res, next) {
    User.findOne({
      'email': req.params.email
    }, function(err, user) {
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

        user.save(function(err) {
          if (err) {
            console.log('Error saving user');
            req.flash('error', 'An error occurred updating the user.');
            return next();
          }
          //send email
          var emailConfig = emailSender.config(null, config.mail.adminEmailsFrom, {name: user.fullname, email: user.email}, "PINGR: Request for access",
            "You have been authorised to view PINGR for practice " + user.practiceName + "\n\nYou can access the site at " + config.server.url + ".\n\nRegards\n\nPINGR",
            null, null);
          emailSender.send(emailConfig, function(error, info) {
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

  reject: function(req, res, next) {
    User.findOne({
      'email': req.params.email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err || !user) {
        console.log('Error in user register: ' + err);
        req.flash('error', 'User doesn\'t exist');
        return next();
      } else {
        User.remove({'email': user.email}, function(err){
          if (err) {
            console.log('Error removing user');
            req.flash('error', 'An error occurred deleting the user.');
            return next();
          }
          //send email
          var emailConfig = emailSender.config(null, config.mail.adminEmailsFrom, {name: user.fullname, email: user.email}, "PINGR: Request for access",
            "You have been denied access to view PINGR for practice " + user.practiceNameNotAuthorised + "\n\nIf you think this is a mistake please get in touch.\n\nRegards\n\nPINGR",
            null, null);
          emailSender.send(emailConfig, function(error, info) {
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
