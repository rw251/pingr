var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {

  passport.use('signup', new LocalStrategy({
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {

    findOrCreateUser = function() {
      // find a user in Mongo with provided email
      User.findOne({
        email: email,
      }, function(err, user) {
        // In case of any error, return using the done method
        if (err) {
          console.log('Error in SignUp: ' + err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists with email: ' + email);
          return done(null, false, req.flash('error', 'User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User({
            email: email,
            password: password,
            fullname: req.body.fullname,
          });

            // save the user
          newUser.save(function(err) {
            if (err) {
              console.log('Error in Saving user: ' + err);
              throw err;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    };
    // Delay the execution of findOrCreateUser and execute the method
    // in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

};
