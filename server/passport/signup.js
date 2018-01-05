const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  passport.use('signup', new LocalStrategy(
    {
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    ((req, email, password, done) => {
      const findOrCreateUser = () => {
      // find a user in Mongo with provided email
        User.findOne({
          email,
        }, (err, user) => {
        // In case of any error, return using the done method
          if (err) {
            console.log(`Error in SignUp: ${err}`);
            return done(err);
          }
          // already exists
          if (user) {
            console.log(`User already exists with email: ${email}`);
            return done(null, false, req.flash('error', 'User Already Exists'));
          }
          // if there is no user with that email
          // create the user
          const newUser = new User({
            email,
            password,
            fullname: req.body.fullname,
          });

            // save the user
          return newUser.save((saveErr) => {
            if (saveErr) {
              console.log(`Error in Saving user: ${saveErr}`);
              throw saveErr;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        });
      };
      // Delay the execution of findOrCreateUser and execute the method
      // in the next tick of the event loop
      process.nextTick(findOrCreateUser);
    })
  ));
};
