var data = require('../data.js'),
  chart = require('../chart.js');

var bd = {

  wireUp: function() {

    $('#overviewPaneTab').on('click', function(e) {
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      //var tempMust = $('#welcome-task-list').html();
      //var rendered = Mustache.render(tempMust);
      //var tmpl = require("templates/action-plan-task-list");
      $('#mainPage-tab-content').fadeOut(250, function() {

        $('#mainPage-tab-content').children().fadeOut(1);
        $('#overview-content').fadeIn(1);

    //*b* tabbed content

        //welcome.populate(true);
        $(this).fadeIn(250);
      });
    });

    $('#indicatorPaneTab').on('click', function(e) {
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      //var tempMust = $('#welcome-task-list').html();
      //var rendered = Mustache.render(tempMust);
      //var tmpl = require("templates/action-plan-task-list");
      $('#mainPage-tab-content').fadeOut(250, function() {

        $('#mainPage-tab-content').children().fadeOut(1);
        $('#indicator-content').fadeIn(1);

    //*b* tabbed content

        //welcome.populate(true);
        $(this).fadeIn(250);
      });
    });

    $('#patientPaneTab').on('click', function(e) {
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      //var tempMust = $('#welcome-task-list').html();
      //var rendered = Mustache.render(tempMust);
      //var tmpl = require("templates/action-plan-task-list");
      $('#mainPage-tab-content').fadeOut(250, function() {

        $('#mainPage-tab-content').children().fadeOut(1);
        $('#patient-content').fadeIn(1);

    //*b* tabbed content

        //welcome.populate(true);
        $(this).fadeIn(250);
      });
    });
  },

  show: function(panel, isAppend, subPanels, isDownText, isUpText) {

//change this to add li
    var sectionElement = $('<div class="section"></div>');

    if (isAppend) panel.append(sectionElement);
    else panel.html(sectionElement);

    subPanels.forEach(function(v) {
      var args = v.args;
      args.unshift(true);
      args.unshift(sectionElement);
      v.show.apply(null, args);
    });
  },

    showTab: function(panel, tabSet, name, tabLabel, subPanels, isActive) {

      //*b* name must be made something sensible --!!!!

      //change this to add li
      var sectionElement = panel;
      var tabSection = $('<li id="'+ tabLabel.toLowerCase() +'" data-toggle="tooltip" title="'+ tabLabel.toLowerCase() +'"><a id="'+ tabLabel.toLowerCase() +'PaneTab" href="#'+ tabLabel.toLowerCase() +'PaneTab">'+name+'</a></li>');

      var contentObject = $('<div id="'+ tabLabel.toLowerCase() +'-content"></div>');
      $(sectionElement).append(contentObject);

      //append to tabSet
      tabSet.append(tabSection);
      //append to panel
      //panel.append(tabSet);

      subPanels.forEach(function(v) {
        var args = v.args;
        args.unshift(true);
        args.unshift(contentObject);
        v.show.apply(null, args);
      });

      if(isActive){
          tabSection.addClass('active');
      }
      else {
        contentObject.fadeOut(1);
      }
    //if (isUpText) sectionElement.prepend($('<div class="fp-controlArrow fp-up"><div>' + isUpText + '</div></div>'));
    //if (isDownText) sectionElement.append($('<div class="fp-controlArrow fp-down"><div>' + isDownText + '</div></div>'));

  }

};

module.exports = bd;
