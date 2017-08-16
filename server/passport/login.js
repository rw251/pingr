var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport) {

  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      // check in mongo if a user with email exists or not
      User.findOne({
          'email': username
        },
        function(err, user) {
          // In case of any error, return using the done method
          if (err)
            return done(err);
          // email does not exist, log the error and redirect back
          if (!user) {
            console.log('User Not Found with email ' + username);
            return done(null, false, req.flash('error', 'User Not found.'));
          }
          if(user.registrationCode) {
            return done(null, false, req.flash('error', 'Sorry you haven\t yet confirmed your email address. Please check your spam/junk folder.'));
          }
          // User exists but wrong password, log the error
          user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if (!isMatch) {
              console.log('Invalid Password');
              return done(null, false, req.flash('error', 'Invalid Password')); // redirect back to login page
            }
            else {
              //console.log('match'); // -> Password123: true
              user.last_login = new Date();
              user.save(function(err) {
                if (err) {
                  console.log('Error in updating users last login date: ' + err);
                }
                return done(null, user);
              });
            }
          });
        }
      );

    }));

};
