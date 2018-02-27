const log = require('./log');
const lookup = require('./lookup');
const base = require('./base');
const layout = require('./layout');
const overview = require('./views/overview');
const indicatorView = require('./views/indicator');
const patientView = require('./views/patient');
const actionPlan = require('./views/actions');
const $ = require('jquery');

const template = {
  loadContent(hash, isPoppingState) {
    base.hideTooltips();

    log.navigate(hash, []);

    let patientId;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    if (hash === '') {
      base.clearBox();
      base.showFooter();
      layout.showPage('login');
      $('html').removeClass('scroll-bar');
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
        overview.create(template.loadContent);
      } else if (urlBits[0] === '#indicators') {
        indicatorView.create(
          urlBits[1],
          urlBits[2],
          urlBits[3],
          params.tab || 'trend',
          template.loadContent
        );
      } else if (urlBits[0] === '#help') {
        layout.view = 'HELP';
        lookup.suggestionModalText = 'Screen: Help\n===========\n';
        base.clearBox();
        base.selectTab('');
        layout.showPage('help-page');

        layout.showHeaderBarItems();
      } else if (urlBits[0] === '#contact') {
        layout.view = 'CONTACT';
        lookup.suggestionModalText = 'Screen: Contact us\n===========\n';
        base.clearBox();
        base.selectTab('');
        layout.showPage('contact-page');

        layout.showHeaderBarItems();
      } else if (urlBits[0] === '#patient') {
        // create(pathwayId, pathwayStage, standard, patientId)
        patientView.create(
          urlBits[2],
          urlBits[3],
          urlBits[4],
          urlBits[1],
          template.loadContent
        );
      } else if (urlBits[0] === '#patients') {
        [, patientId] = urlBits;

        patientView.create(
          urlBits[2],
          urlBits[3],
          urlBits[4],
          patientId,
          template.loadContent
        );
      } else if (urlBits[0] === '#agreedactions') {
        actionPlan.create();
      } else {
        // if screen not in correct segment then select it
        // alert("shouldn't get here");

        base.wireUpTooltips();
      }

      $('#suggs')
        .off('click')
        .on('click', (e) => {
          base.launchSuggestionModal();
          e.preventDefault();
        });
    }

    lookup.currentUrl = hash;
  },
};

module.exports = template;
