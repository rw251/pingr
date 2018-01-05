const User = require('../models/user');

module.exports = (req, res, next) => {
  User.findOne({
    email: req.user.email,
  }, (err, user) => {
    // In case of any error, return using the done method
    if (err) {
      console.log(`Error in change password: ${err}`);
      req.flash('error', 'An error has occurred. Please try again.');
      return next();
    }
    // already exists
    if (user) {
      return user.comparePassword(req.body.oldpassword, (compareErr, isMatch) => {
        if (compareErr) {
          console.log('oops!', compareErr);
          req.flash('error', 'An error has occurred. Please try again.');
          return next();
        }
        if (!isMatch) {
          console.log('Invalid Password');
          req.flash('error', 'Incorrect password');
          return next(); // redirect back to login page
        }
        // console.log('match');
        user.password = req.body.newpassword;
        return user.save((saveErr) => {
          if (saveErr) {
            console.log(`Error in changing password: ${saveErr}`);
            req.flash('error', 'An error has occurred. Please try again.');
            return next();
          }
          console.log('Password change succesful');
          req.flash('success', 'Password successfully changed.');
          return next();
        });
      });
    }
    console.log('No matching user - oops!');
    req.flash('error', 'An error has occurred. Please try again.');
    return next();
  });
};
