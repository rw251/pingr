require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// const favicon = require('serve-favicon');
// const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');

const config = require('./server/config.js');
const mongoose = require('mongoose');

const passport = require('passport');
const expressSession = require('express-session');

const flash = require('connect-flash');
const initPassport = require('./server/passport/init');
const routeIndex = require('./server/routes/index');

const debug = require('debug')('passport-mongo:server');
const http = require('http');

const DEBUG = false;

module.exports = (PORT, PATH, CALLBACK) => {
  mongoose.set('debug', DEBUG);
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db.url, { useMongoClient: true });

  const app = express();

  // add gzip
  app.use(compression());

  // add cors (for reverse proxy and pingr-proxy)
  app.use(cors({ origin: ['https://pingr-proxy.herokuapp.com', 'https://pingr-dev.herokuapp.com', 'https://pingr-ben.herokuapp.com'] }));

  // view engine setup
  // app.set('views', path.join(__dirname, 'views'));
  // app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'server/views'));
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  // app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  const SESSION_TIMEOUT = 4 * 3600 * 1000; // 4 hours to be sure - but client side
  // 2 hours redirects to signout
  app.use(expressSession({
    secret: config.passport.secret,
    cookie: { maxAge: SESSION_TIMEOUT },
    rolling: true,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Using the flash middleware provided by connect-flash to store messages in session
  // and displaying in templates
  app.use(flash());

  // Initialize Passport
  initPassport(passport);

  const routes = routeIndex(passport);
  app.use('/', routes);

  app.use(express.static(path.join(__dirname, PATH)));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err, req, res) => {
      res.status(err.status || 500);
      res.render('pages/error.jade', {
        message: err.message,
        error: err,
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('pages/error.jade', {
      message: err.message,
      error: {},
    });
  });

  /**
   * Get port from config or environment and store in Express.
   */

  let port = PORT || config.server.port;
  if (!port) port = process.env.PORT || '3000';
  app.set('port', port);
  console.log(`port:${port}`);

  /**
   * Create HTTP server.
   */

  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
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
    const addr = server.address();
    const bind = typeof addr === 'string' ?
      `pipe ${addr}` :
      `port ${addr.port}`;
    debug(`Listening on ${bind}`);
  }

  server.on('error', onError);
  server.on('listening', onListening);
};
