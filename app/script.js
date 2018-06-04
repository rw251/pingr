const lookup = require('./lookup');
require('./polyfills');

// require all the things that get globally added to jquery
require('bootstrap');
require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-buttons/js/buttons.colVis.js')(window, $);
require('datatables.net-buttons/js/buttons.html5.js')(window, $);

const abConfig = require('../shared/abConfig');

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar
 * in layout and content to all the others.
 */

const main = require('./main');
const base = require('./base');
const events = require('./events');
const state = require('./state');
const layout = require('./layout');
const tutorial = require('./tutorial');

// TODO not sure why i did this - was in local variable
// maybe a separate module
// window.location = window.history.location || window.location;
/** ******************************************************
 *** Shows the pre-load image and slowly fades it out. ***
 ******************************************************* */
let gotInitialData = false;
let pageIsReady = false;

const getServerParameters = () => {
  lookup.userName = $('#user_fullname').text().trim();
  state.practices = JSON.parse($('#practices').text());
  state.selectedPractice = JSON.parse($('#selectedPractice').text());
  if ($('#last_login').text() === '') {
    // first login
    $('#tutorialText').text(`Welcome to PINGR ${lookup.userName}! Pleased to see you! As this is your first time you might want to check out our tutorials by clicking here.`);
    tutorial.intro();
  } else if ($('#last_viewed_tutorial').text() === '') {
    // never seen tutorial
    $('#tutorialText').text(`Welcome ${lookup.userName}! Since you last logged in we've added some tutorials which you might find informative. Check them out by clicking here.`);
    tutorial.intro();
  } else {
    const lastLogin = new Date($('#last_login').text());
    // const lastViewedTutorial = new Date($('#last_viewed_tutorial').text());

    if ((new Date() - lastLogin) / (1000 * 60 * 60 * 24) > 30) {
      // not logged in for 30 days so show tutorial
      $('#tutorialText').text(`Welcome back ${lookup.userName}! It's been a while, so if you need a refresher remember to check out the tutorials by clicking here.`);
      tutorial.intro();
    }
  }
};

const App = {
  init: function init() {
    layout.showPage('main-dashboard');

    // wire up the tutorial
    tutorial.initialize();

    const initialize = () => {
      // Wire up global click/hover listener
      events.listen();
      // Grab the hash if exists - IE seems to forget it
      main.hash = window.location.hash || '#overview';
      // main.hash="#overview";

      // Load the data then wire up the events on the page
      main.init();

      $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        delay: {
          show: 500,
          hide: 100,
        },
        html: true,
      });
      $('[data-toggle="lone-tooltip"]').tooltip({
        container: 'body',
        delay: {
          show: 300,
          hide: 100,
        },
      });
      $('[data-toggle="lone-tooltip"]').on('shown.bs.tooltip', () => {
        $('[data-toggle="tooltip"]')
          .not(this)
          .tooltip('hide');
      });
    };

    $('body').on('change', '.practice-picker', (e) => {
      base.showLoading();
      base.resetTab('indicators');
      base.resetTab('patients');
      layout.reset();
      const newPracticeId = $(e.currentTarget).val();
      const newPractice = state.practices.filter(v => v._id === newPracticeId)[0];
      state.selectedPractice = newPractice;
      // console.log('changed practice to: ', newPractice);
      main.getInitialData(() => {
        initialize();
      });
    });

    getServerParameters();

    // if (abConfig.abTestTest.isRunning) {
    const group = abConfig.assignPerUser(abConfig.abTestTest, lookup.userName);
    console.log(`User ${lookup.userName} is in group ${group}`);
    if (group === abConfig.groups.feature) {
      abConfig.abTestTest.featureCode($);
    }

    // }

    main.getInitialData(() => {
      gotInitialData = true;
      if (gotInitialData && pageIsReady) {
        initialize();
      }
    });

    /** ****************************************
     *** This happens when the page is ready ***
     ***************************************** */
    $(document).ready(() => {
      getServerParameters();
      pageIsReady = true;
      if (gotInitialData && pageIsReady) {
        initialize();
      }
    });
  },
};

module.exports = App;
