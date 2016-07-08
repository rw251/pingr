var User = require('../models/user');

module.exports =  {

  forgot: function(req, res, next) {
    User.findOne({
      'email': req.params.email
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
        user.save(function(err) {
          if (err) {
            console.log('Error in forgot password: ' + err);
            req.flash('error', 'An error has occurred. Please try again.');
            return next();
          }
          console.log('Password token issued succesful');
          //-//email token
          req.flash('success', 'Thanks. Please check your emails for a link to reset your password.');
          return next();
        });
      } else {
        console.log('No matching user - oops!');
        req.flash('success', 'Thanks. Please check your emails for a link to reset your password.');
        return next();
      }

    });
  },

  token: function(req, res, next) {
    User.findOne({
      'token': req.params.token
      //and expiry recently
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in token retrieval: ' + err);
        req.flash('error', 'An error has occurred. Please try again.');
        return next();
      }
      // already exists
      if (user) {
        //-//authenticate user and redirect to change password screen
        res.redirect('/changepassword');
      } else {
        console.log('No matching user - oops!');
        req.flash('error', 'The reset link has expired. Please try again.');
        return next();
      }

    });
  }

};
