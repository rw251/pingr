const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  passport.use('login', new LocalStrategy(
    {
      passReqToCallback: true,
    },
    ((req, username, password, done) => {
    // check in mongo if a user with email exists or not
      User.findOne(
        {
          email: username,
        },
        (err, user) => {
          // In case of any error, return using the done method
          if (err) { return done(err); }
          // email does not exist, log the error and redirect back
          if (!user) {
            console.log(`User Not Found with email ${username}`);
            return done(null, false, req.flash('error', 'User Not found.'));
          }
          // User exists but wrong password, log the error
          return user.comparePassword(password, (compareErr, isMatch) => {
            if (compareErr) return done(compareErr);
            if (!isMatch) {
              console.log('Invalid Password');
              return done(null, false, req.flash('error', 'Invalid Password')); // redirect back to login page
            }
            // console.log('match'); // -> Password123: true
            return done(null, user);
          });
        }
      );
    })
  ));
};
