var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport) {

  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      // check in mongo if a user with username exists or not
      User.findOne({
          'username': username
        },
        function(err, user) {
          // In case of any error, return using the done method
          if (err)
            return done(err);
          // Username does not exist, log the error and redirect back
          if (!user) {
            console.log('User Not Found with username ' + username);
            return done(null, false, req.flash('error', 'User Not found.'));
          }
          // User exists but wrong password, log the error
          user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if (!isMatch) {
              console.log('Invalid Password');
              return done(null, false, req.flash('error', 'Invalid Password')); // redirect back to login page
            }
            else {
              console.log('match'); // -> Password123: true
              return done(null, user);
            }
          });
        }
      );

    }));

};
