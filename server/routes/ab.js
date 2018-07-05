const ctl = require('../controllers/ab/tests');
const benchCtl = require('../controllers/ab/outcomes');
const { isAuthenticated, isAdmin } = require('./helpers');

module.exports = {
  applyTo: (router) => {
    router.get('/ab', isAuthenticated, isAdmin, ctl.index);

    router.get('/ab/new', isAuthenticated, isAdmin, ctl.create.get);
    router.post('/ab/new', isAuthenticated, isAdmin, ctl.create.post);

    router.get('/ab/config/:testId', isAuthenticated, isAdmin, ctl.configure.get);
    router.post('/ab/config/:testId', isAuthenticated, isAdmin, ctl.configure.post);

    router.get('/ab/remove/:testId', isAuthenticated, isAdmin, ctl.remove.get);
    router.post('/ab/remove/:testId', isAuthenticated, isAdmin, ctl.remove.post);

    router.get('/ab/start/:testId', isAuthenticated, isAdmin, ctl.start);
    router.get('/ab/stop/:testId', isAuthenticated, isAdmin, ctl.stop);
    router.get('/ab/pause/:testId', isAuthenticated, isAdmin, ctl.pause);
    router.get('/ab/archive/:testId', isAuthenticated, isAdmin, ctl.archive);

    router.get('/ab/progress/:testId', isAuthenticated, isAdmin, ctl.progress);
    router.get('/ab/results/:testId', isAuthenticated, isAdmin, ctl.results);

    router.get('/ab/running', isAuthenticated, isAdmin, ctl.running);

    router.get('/ab/conversions/for/trial/:trial/outcome/:outcome/over/:days/days', isAuthenticated, isAdmin, benchCtl.conversion);

    router.get('/outcomes', isAuthenticated, isAdmin, benchCtl.all);
  },
};
