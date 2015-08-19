/*jslint browser: true*/
/*jshint -W055 */
/*global $, c3, Mustache, ZeroClipboard, console, jsPDF, Bloodhound, bb, alert*/

(function () {
  'use strict';

	var local= {};
  var loadData = function(file){
    local.patients = file.patients;
  };

	var getData = function(callback, json) {
    if(json) {
      loadData(json);
      if(typeof callback === 'function') callback();
    } else {
      var r = Math.random();
  		$.getJSON("ehr_data.json?v="+r, function(file) {
  			loadData(file);
        if(typeof callback === 'function') callback();
  		}).fail(function(err){
        alert("data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
      });
    }
	};

  var populatePatientDemo = function(patientId){
      var data = {};
      if(local.patients[patientId]){
        data = local.patients[patientId].demographic;
        data.patientId = patientId;
      } else {
        data.notfound = patientId;
      }

      var template = $('#demographic').html();
      Mustache.parse(template);   // optional, speeds up future uses
      var rendered = Mustache.render(template, data);
      $('#jumbodemo').html(rendered).removeClass("jumbotron").show();
  };

  var populatePatientEvents = function(patientId){
      var data = {"events":local.patients[patientId].events, "hasEvents":local.patients[patientId].events && local.patients[patientId].events.length>0};

      var template = $('#event-table').html();
      Mustache.parse(template);   // optional, speeds up future uses
      var rendered = Mustache.render(template, data, {"event" : $('#event-row')});
      $('#jumborecord').html(rendered).removeClass("jumbotron").show();
  };

  var wireUpPages = function(){
    $('#search').on('click', function(){
      populatePatientDemo($('#patientId').val());
      populatePatientEvents($('#patientId').val());
    });

    $('#patientId').on('keyup', function(k){
      if(k.which===13){
        $('#search').click();
      }
    });

  };

	var initialize = function(){
    getData(wireUpPages);
	};

	window.EHR = {
    "version" : "1.0",
		"init" : initialize
	};
})();

/******************************************
*** This happens when the page is ready ***
******************************************/
$(document).on('ready', function () {
	//Load the data then wire up the events on the page
	EHR.init();
});
