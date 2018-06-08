module.exports = {
  isAuthenticated: (req, res, next) => {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated()) { return next(); }
    // if the user is not authenticated then redirect him to the login page
    req.session.redirect_to = req.path; // remember the page they tried to load
    return res.redirect('/login');
  },

  isUserOkToViewPractice: (req, res, next) => {
    const isUserAuthorisedForThisPractice = req.user.practices
      .filter(v => v.authorised && v.id === req.params.practiceId).length > 0;
    if (!isUserAuthorisedForThisPractice) return res.send([]);
    return next();
  },

  isAdmin: (req, res, next) => {
    if (req.user.roles.indexOf('admin') > -1) return next();
    return res.redirect('/login');
  },
};
