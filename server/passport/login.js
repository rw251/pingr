const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  passport.use(
    'login',
    new LocalStrategy(
      { passReqToCallback: true },
      ((req, username, password, done) => {
        // check in mongo if a user with email exists or not
        User.findOne(
          { email: username },
          (err, user) => {
          // In case of any error, return using the done method
            if (err) { return done(err); }
            // email does not exist, log the error and redirect back
            if (!user) {
              console.log(`User Not Found with email ${username}`);
              return done(null, false, req.flash('error', 'User Not found.'));
            }
            if (user.registrationCode) {
              return done(null, false, req.flash('error', 'Sorry you haven\t yet confirmed your email address. Please check your spam/junk folder.'));
            }
            // User exists but wrong password, log the error
            return user.comparePassword(password, (compareErr, isMatch) => {
              if (compareErr) return done(compareErr);
              if (!isMatch) {
                console.log('Invalid Password');
                return done(null, false, req.flash('error', 'Invalid Password')); // redirect back to login page
              }
              // console.log('match'); // -> Password123: true
              const previousLogin = user.last_login;
              user.last_login = new Date();
              return user.save((saveErr) => {
                if (saveErr) {
                  console.log(`Error in updating users last login date: ${err}`);
                }
                user.previousLogin = previousLogin;
                return done(null, user);
              });
            });
          }
        );
      })
    )
  );
};
