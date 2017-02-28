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
  events = require('./events');

//TODO not sure why i did this - was in local variable
//maybe a separate module
//window.location = window.history.location || window.location;
/********************************************************
 *** Shows the pre-load image and slowly fades it out. ***
 ********************************************************/

var App = {
  init: function init() {
    $(window).load(function() {
      $('.loading-container').fadeOut(1000, function() {
        //$(this).remove();
      });
    });

    /******************************************
     *** This happens when the page is ready ***
     ******************************************/
    $(document).on('ready', function() {
      //Wire up global click/hover listener
      events.listen();
      //Grab the hash if exists - IE seems to forget it
      main.hash = location.hash;
      main.hash="#overview";

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

    });
  }
};

module.exports = App;
