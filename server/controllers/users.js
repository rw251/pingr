var User = require('../models/user');

module.exports = {

  get: function(email, done) {
    User.findOne({
      'email': email
    }, function(err, user) {
      if (!user) {
        console.log('User doesnt exists with email: ' + email);
        return done(null, false);
      } else {
        done(null, user.toObject());
      }
    });
  },

  list: function(done) {
    User.find({}, null, {sort: {email: 1}}, function(err, users) {
      if (err) {
        return done(err);
      }
      users = users.map(function(v) {
        return v.toObject();
      });
      return done(null, users);
    });
  },

  delete: function(email, done) {
    User.find({ email: email }).remove(done);
  },

  edit: function(email, req, done) {
    User.findOne({
      'email': email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
      // already exists
      if (!user) {
        console.log('User doesnt exists with email: ' + email);
        return done(null, false, req.flash('error', 'User Not Exists'));
      } else {
        // if there is a user with that email
        // create the user
        var roles = [];
        if (req.body.isAdmin) roles.push("admin");

        user.email = req.body.email;
        user.fullname = req.body.fullname;
        user.roles = roles;
        // save the user
        user.save(function(err) {
          if (err) {
            console.log('Error in Saving user: ' + err);
            throw err;
          }
          console.log('User edit succesful');
          return done(null, user);
        });
      }
    });
  },

  add: function(req, done) {
    User.findOne({
      'email': req.body.email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
      // already exists
      if (user) {
        console.log('User already exists with email: ' + req.body.email);
        return done(null, false, req.flash('error', 'User Already Exists'));
      } else {
        // if there is no user with that email
        // create the user
        var roles = [];
        if (req.body.isAdmin) roles.push("admin");
        var newUser = new User({
          email: req.body.email,
          password: req.body.password,
          fullname: req.body.fullname,
          roles: roles
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
  }

};
