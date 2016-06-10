var express = require('express');
var router = express.Router();
var cp = require('../passport/change-password');

var isAuthenticated = function(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/login');
};

module.exports = function(passport) {

  /* GET login page. */
  router.get('/login', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('pages/login.jade', { message: req.flash() });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  /* GET Registration Page */
  router.get('/signup', function(req, res) {
    res.render('pages/register', { message: req.flash() });
  });

  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  /* GET Change password Page */
  router.get('/changepassword', isAuthenticated, function(req, res) {
    res.render('pages/changepassword', { message: req.flash() });
  });

  /* Handle Change password POST */
  router.post('/changepassword', isAuthenticated, cp, function(req, res) {
    res.render('pages/changepassword', { message: req.flash() });
  });

  /* Handle Logout */
  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  /* GET Home Page */
  router.get(/^\/.*(html|js)$/, isAuthenticated, function(req, res, next) {
    next();
  });

  return router;
};
