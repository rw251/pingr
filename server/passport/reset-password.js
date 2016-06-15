var User = require('../models/user');

module.exports = function(req, res, next) {
  User.findOne({
    'email': req.params.email
  }, function(err, user) {
    // In case of any error, return using the done method
    if (err) {
      console.log('Error in change password: ' + err);
      req.flash('error', 'An error has occurred. Please try again.');
      return next();
    }
    // already exists
    if (user) {
      user.password = req.body.password;
      user.save(function(err) {
        if (err) {
          console.log('Error in changing password: ' + err);
          req.flash('error', 'An error has occurred. Please try again.');
          return next();
        }
        console.log('Password change succesful');
        req.flash('success', 'Password successfully changed.');
        return next();
      });
    } else {
      console.log('No matching user - oops!');
      req.flash('error', 'An error has occurred. Please try again.');
      return next();
    }

  });
};
