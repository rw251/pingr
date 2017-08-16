var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./server/config.js');
var mongoose = require('mongoose');
var DEBUG = false;

module.exports = function(PORT, PATH, CALLBACK) {

  mongoose.set('debug', DEBUG);
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db.url);

  var app = express();

  // view engine setup
  //app.set('views', path.join(__dirname, 'views'));
  //app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'server/views'));
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  //app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));

  // Configuring Passport
  var passport = require('passport');
  var expressSession = require('express-session');
  var SESSION_TIMEOUT = 4 * 3600 * 1000; //4 hours to be sure - but client side
                                         //2 hours redirects to signout
  app.use(expressSession({
    secret: config.passport.secret,
    cookie: { maxAge: SESSION_TIMEOUT },
    rolling: true,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Using the flash middleware provided by connect-flash to store messages in session
  // and displaying in templates
  var flash = require('connect-flash');
  app.use(flash());

  // Initialize Passport
  var initPassport = require('./server/passport/init');
  initPassport(passport);

  var routes = require('./server/routes/index')(passport);
  app.use('/', routes);

  app.use(express.static(path.join(__dirname, PATH)));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('pages/error.jade', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/error.jade', {
      message: err.message,
      error: {}
    });
  });

  /**
   * Module dependencies.
   */

  var debug = require('debug')('passport-mongo:server');
  var http = require('http');

  /**
   * Get port from config or environment and store in Express.
   */

  var port = PORT || config.server.port;
  if (!port) port = process.env.PORT || '3000';
  app.set('port', port);

  /**
   * Create HTTP server.
   */

  var server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    CALLBACK();
    var addr = server.address();
    var bind = typeof addr === 'string' ?
      'pipe ' + addr :
      'port ' + addr.port;
    debug('Listening on ' + bind);
  }

};
