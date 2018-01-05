const User = require('../models/user');
const crypto = require('crypto');
const emailSender = require('../email-sender');

const config = require('../config');

module.exports = {

  forgot(req, res, next) {
    console.log(req.body.email);
    User.findOne({
      email: req.body.email,
    }, (err, user) => {
      // In case of any error, return using the done method
      if (err) {
        console.log(`Error in forgot password: ${err}`);
        req.flash('error', 'An error has occurred. Please try again.');
        return next();
      }
      // already exists
      if (user) {
        // -//update user with reset token
        // user.password = req.body.password;
        // Generate random token
        return crypto.randomBytes(20, (cryptoErr, buf) => {
          const token = buf.toString('hex');

          user.password_recovery_code = token;
          user.password_recovery_expiry = Date.now() + 3600000; // 1 hour

          user.save((saveErr) => {
            if (saveErr) {
              console.log(`Error in forgot password: ${saveErr}`);
              req.flash('error', 'An error has occurred. Please try again.');
              return next();
            }
            console.log('Password token issued succesful');

            const emailConfig = emailSender.config(
              config.mail.type, config.mail.adminEmailsFrom, { name: user.fullname, email: user.email }, 'PINGR: Password reset',
              `Your password has been reset. To complete the process click the link below to enter a new password.  If you did not recently reset your password please contact the support team at info@pingr.srft.nhs.uk. \n\n https://${req.headers.host}/auth/reset/${token}\n\n`,
              null, null
            );

            // Send email
            return emailSender.send(emailConfig, (error) => {
              if (error) {
                console.log(`email not sent: ${error}`);
              }
              req.flash('success', 'Thanks. Please check your emails for a link to reset your password.');
              return next();
            });
          });
        });
      }
      console.log('No matching user - oops!');
      req.flash('success', 'Thanks. Please check your emails for a link to reset your password.');
      return next();
    });
  },

  token(req, res, next) {
    User.findOne(
      { password_recovery_code: req.params.token, password_recovery_expiry: { $gt: Date.now() } },
      (err, user) => {
      // In case of any error, return using the done method
        if (err || !user) {
          console.log(`Error in token retrieval: ${err}`);
          req.flash('error', 'The reset link has expired. Please try again.');
          return next();
        }

        if (req.body.newpassword === req.body.confirmpassword) {
          user.password = req.body.newpassword;
          user.password_recovery_code = undefined;
          user.password_recovery_expiry = undefined;

          return user.save((saveErr) => {
            if (saveErr) {
              console.log('Error in saving user');
              req.flash('error', 'An error has occurred. Please try again.');
              return next();
            }
            return req.login(user, (loginErr) => {
              if (loginErr) {
                console.log('Error in saving user');
                req.flash('error', 'An error has occurred. Please try again.');
                return next();
              }
              const emailConfig = emailSender.config(
                config.mail.type, config.mail.adminEmailsFrom, { name: user.fullname, email: user.email }, 'PINGR: Password changed',
                'Your password has been changed.\n\nIf you did not initiate this please contact the support team.',
                null, null
              );

              // Send email
              return emailSender.send(emailConfig, (error) => {
                if (error) {
                  console.log(`email not sent: ${error}`);
                }
                req.flash('success', 'You\'re password has now been changed');
                return next();
              });
            });
          });
        }
        console.log('Passwords don\'t match');
        req.flash('error', 'Passwords don\'t match.');
        return next();
      }
    );
  },

};
