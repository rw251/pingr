var User = require('../models/user'),
  crypto = require('crypto'),
  emailSender = require('../email-sender');

var mailConfig = require('../config').mail;

module.exports = {

  forgot: function(req, res, next) {
    console.log(req.body.email);
    User.findOne({
      'email': req.body.email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in forgot password: ' + err);
        req.flash('error', 'An error has occurred. Please try again.');
        return next();
      }
      // already exists
      if (user) {
        //-//update user with reset token
        //user.password = req.body.password;
        //Generate random token
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');

          user.password_recovery_code = token;
          user.password_recovery_expiry = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            if (err) {
              console.log('Error in forgot password: ' + err);
              req.flash('error', 'An error has occurred. Please try again.');
              return next();
            }
            console.log('Password token issued succesful');
            mailConfig.options.from = 'PINGR <info@pingr.srft.nhs.uk>';
            mailConfig.options.to = user.email;
            //Send email
            emailSender.sendEmail(mailConfig, 'PINGR: Password reset', 'You\'re password has been reset. To complete the process click the link below to enter a new password.  If you did not recently reset your password please contact the support team at info@pingr.srft.nhs.uk. \n\n https://' + req.headers.host + '/forgot/' + token + '\n\n', null, function(error, info) {
              if(error) {
                console.log("email not sent: " + error);
              }
              req.flash('success', 'Thanks. Please check your emails for a link to reset your password.');
              return next();
            });
          });

        });
      } else {
        console.log('No matching user - oops!');
        req.flash('success', 'Thanks. Please check your emails for a link to reset your password.');
        return next();
      }

    });
  },

  token: function(req, res, next) {
    User.findOne({password_recovery_code: req.params.token, password_recovery_expiry: { $gt: Date.now() } }, function(err, user) {
      // In case of any error, return using the done method
      if (err || !user) {
        console.log('Error in token retrieval: ' + err);
        req.flash('error', 'The reset link has expired. Please try again.');
        return next();
      }

      if (req.body.newpassword === req.body.confirmpassword) {
          user.password = req.body.newpassword;
          user.password_recovery_code = undefined;
          user.password_recovery_expiry = undefined;

          user.save(function(err) {
              if (err) {
                console.log('Error in saving user');
                req.flash('error', 'An error has occurred. Please try again.');
                return next();
              } else {
                  req.login(user, function(err) {
                      if (err) {
                        console.log('Error in saving user');
                        req.flash('error', 'An error has occurred. Please try again.');
                        return next();
                      } else {
                          mailConfig.options.from = 'PINGR <info@pingr.srft.nhs.uk>';
                          mailConfig.options.to = user.email;
                          //Send email
                          emailSender.sendEmail(mailConfig, 'PINGR: Password changed', 'You\'re password has been changed.\n\nIf you did not initiate this please contact the support team.', null, function(error, info){
                              if(error) {
                                console.log("email not sent: " + error);
                              }
                              req.flash('success', 'You\re password has now been changed');
                              return next();
                          });
                      }
                  });
              }
          });
      } else {
        console.log('Passwords don\'t match');
        req.flash('error', 'Passwords don\'t match.');
        return next();
      }

    });
  }

};
