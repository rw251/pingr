/*jslint browser: true*/
/*jshint -W055 */
/*global console, alert*/

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar in layout and content
 *  to all the others.
 */

var template = require('./src/template.js'),
  main = require('./src/main.js');

//TODO not sure why i did this - was in local variable
//maybe a separate module
//window.location = window.history.location || window.location;
/********************************************************
 *** Shows the pre-load image and slowly fades it out. ***
 ********************************************************/
$(window).load(function() {
  $('.loading-container').fadeOut(1000, function() {
    //$(this).remove();
  });
});

/******************************************
 *** This happens when the page is ready ***
 ******************************************/
$(document).on('ready', function() {
  //Grab the hash if exists - IE seems to forget it
  main.hash = location.hash;
  //Load the data then wire up the events on the page
  main.init();

  //Sorts out the data held locally in the user's browser
  if (!localStorage.bb) localStorage.bb = JSON.stringify({});
  var obj = JSON.parse(localStorage.bb);
  if (!obj.version || obj.version !== main.version) {
    localStorage.bb = JSON.stringify({
      "version": main.version
    });
  }

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

  //ensure on first load the login screen is cached to the history
  history.pushState(null, null, '');
});
