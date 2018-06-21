const ctl = require('../controllers/ab/tests');
const benchCtl = require('../controllers/ab/benchmarks');
const { isAuthenticated, isAdmin } = require('./helpers');

module.exports = {
  applyTo: (router) => {
    router.get('/ab', isAuthenticated, isAdmin, ctl.index);
    router.get('/ab/config/:testId', isAuthenticated, isAdmin, ctl.configure.get);
    router.post('/ab/config/:testId', isAuthenticated, isAdmin, ctl.configure.post);
    router.get('/ab/start/:testId', isAuthenticated, isAdmin, ctl.start);
    router.get('/ab/pause/:testId', isAuthenticated, isAdmin, ctl.pause);
    router.get('/ab/progress/:testId', isAuthenticated, isAdmin, ctl.progress);
    router.get('/ab/delete/:testId', isAuthenticated, isAdmin, ctl.delete);

    router.get('/ab/running', isAuthenticated, isAdmin, ctl.running);

    router.get('/benchmarks', isAuthenticated, isAdmin, benchCtl.all);
  },
};
