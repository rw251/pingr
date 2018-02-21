/*jslint browser: true*/
/*jshint -W055 */
/*global console, alert*/

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar in layout and content
 *  to all the others.
 */

var template = require('./template'),
  main = require('./main'),
  base = require('./base'),
  data = require('./data'),
  events = require('./events'),
  state = require('./state'),
  layout = require('./layout');

require('./sideshow')();

//TODO not sure why i did this - was in local variable
//maybe a separate module
//window.location = window.history.location || window.location;
/********************************************************
 *** Shows the pre-load image and slowly fades it out. ***
 ********************************************************/
var gotInitialData = false;
var pageIsReady = false;

var tourbusTour = $('#tourbus-demo-1').tourbus({
  leg: {
    margin: 25,
  },
  onLegStart: function( leg, bus ) {
    if( leg.rawData.highlight ) {
      const targetLeft = leg.$target.offset().left;
      const targetRight = targetLeft + leg.$target.outerWidth();
      const targetTop = leg.$target.offset().top;
      const targetBottom = targetTop + leg.$target.outerHeight();
      const padding = 2;
      $('.tour-overlay-left').css('width', targetLeft - padding);
      $('.tour-overlay-right').css('left', targetRight + padding);

      $('.tour-overlay-top').css('height', targetTop - padding);
      $('.tour-overlay-top').css('left', targetLeft - padding);
      $('.tour-overlay-top').css('width', targetRight - targetLeft + 2*padding);

      $('.tour-overlay-bottom').css('top', targetBottom + padding);
      $('.tour-overlay-bottom').css('left', targetLeft - padding);
      $('.tour-overlay-bottom').css('width', targetRight - targetLeft + 2*padding);
      $('.tour-overlay').show();
    }
    if( leg.rawData.mask) {
      $('.tour-overlay-right').css('left', 0).show();
    }
  },
  onLegEnd: function( leg, bus ) {
    if( leg.rawData.highlight ) {
      $('.tour-overlay').hide();
    }
    if( leg.rawData.mask) {
      $('.tour-overlay').hide();
    }
  }
} );

var App = {
  init: function init() { 

    $('#tutorial1').on('click', (e) => {
      e.preventDefault();
      Sideshow.start({ listAll: true });
    });

    $('#tutorial2').on('click', (e) => {
      e.preventDefault();
      tourbusTour.trigger('depart.tourbus');
    });

    layout.showPage('main-dashboard');

    var initialize = function(){
      //Wire up global click/hover listener
      events.listen();
      //Grab the hash if exists - IE seems to forget it
      main.hash = location.hash || "#overview";
      //main.hash="#overview";

      //Load the data then wire up the events on the page
      main.init();

      $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        delay: {
          "show": 500,
          "hide": 100
        },
        html: true
      });
      $('[data-toggle="lone-tooltip"]').tooltip({
        container: 'body',
        delay: {
          "show": 300,
          "hide": 100
        }
      });
      $('[data-toggle="lone-tooltip"]').on('shown.bs.tooltip', function(e) {
        $('[data-toggle="tooltip"]').not(this).tooltip('hide');
      });
    };

    $('body').on('change', '.practice-picker', (e)=>{
      base.showLoading();
      base.resetTab('indicators');
      base.resetTab('patients');
      layout.reset();
      const newPracticeId = $(e.currentTarget).val();
      const newPractice = state.practices.filter(v => v._id === newPracticeId)[0];
      state.selectedPractice = newPractice;
      console.log("changed practice to: ", newPractice);
      main.getInitialData(()=>{
        initialize();
      });
    });
    
    state.practices = JSON.parse($('#practices').text());
    state.selectedPractice = JSON.parse($('#selectedPractice').text());

    main.getInitialData(function(){
      gotInitialData = true;
      if(gotInitialData && pageIsReady) {
        initialize();
      }
    });

    /******************************************
     *** This happens when the page is ready ***
     ******************************************/
    $(document).on('ready', function() {
      state.practices = JSON.parse($('#practices').text());
      state.selectedPractice = JSON.parse($('#selectedPractice').text());
      pageIsReady = true;
      if(gotInitialData && pageIsReady) {
        initialize();
      }
    });
  }
};

module.exports = App;
