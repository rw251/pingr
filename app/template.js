const log = require('./log');
const lookup = require('./lookup');
const base = require('./base');
const layout = require('./layout');
const overview = require('./views/overview');
const indicatorView = require('./views/indicator');
const patientView = require('./views/patient');
const actionPlan = require('./views/actions');

const template = {
  loadContent(hash, isPoppingState, callback) {
    base.hideTooltips();

    log.navigatePage(hash, []);

    let patientId;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    let shouldCallCallback = false;

    if (hash === '') {
      base.clearBox();
      base.showFooter();
      layout.showPage('login');
      $('html').removeClass('scroll-bar');
      shouldCallCallback = true;
    } else {
      base.hideFooter();
      // $('html').addClass('scroll-bar');
      const params = {};
      let urlBits = hash.split('/');

      if (hash.indexOf('?') > -1) {
        hash
          .split('?')[1]
          .split('&')
          .forEach((param) => {
            const elems = param.split('=');
            [, params[elems[0]]] = elems;
          });
        urlBits = hash.split('?')[0].split('/');
      }

      if (urlBits[0] === '#overview' && !urlBits[1]) {
        overview.create(template.loadContent, callback);
      } else if (urlBits[0] === '#indicators') {
        indicatorView.create(
          urlBits[1],
          urlBits[2],
          urlBits[3],
          params.tab || 'trend',
          template.loadContent,
          callback
        );
      } else if (urlBits[0] === '#about') {
        layout.view = 'ABOUT';
        lookup.suggestionModalText = 'Screen: About us\n===========\n';
        base.clearBox();
        base.selectTab('');
        layout.showPage('about-page');

        layout.showHeaderBarItems();

        shouldCallCallback = true;
      } else if (urlBits[0] === '#patient') {
        // create(pathwayId, pathwayStage, standard, patientId)
        patientView.create(
          urlBits[2],
          urlBits[3],
          urlBits[4],
          urlBits[1],
          template.loadContent,
          callback
        );
      } else if (urlBits[0] === '#patients') {
        [, patientId] = urlBits;

        patientView.create(
          urlBits[2],
          urlBits[3],
          urlBits[4],
          patientId,
          template.loadContent,
          callback
        );
      } else if (urlBits[0] === '#agreedactions') {
        actionPlan.create(callback);
      } else {
        // if screen not in correct segment then select it
        // alert("shouldn't get here");

        base.wireUpTooltips();
        shouldCallCallback = true;
      }

      $('#about')
        .off('click')
        .on('click', (e) => {
          base.launchAboutModal();
          e.preventDefault();
        });

      $('#suggs')
        .off('click')
        .on('click', (e) => {
          base.launchSuggestionModal();
          e.preventDefault();
        });
    }

    lookup.currentUrl = hash;

    if (shouldCallCallback) return callback();
  },
};

module.exports = template;
