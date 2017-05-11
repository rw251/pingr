var log = require('./log'),
  lookup = require('./lookup'),
  base = require('./base'),
  layout = require('./layout'),
  tutorial = require('./tutorial'),
  overview = require('./views/overview'),
  indicatorView = require('./views/indicator'),
  patientView = require('./views/patient'),
  actionPlan = require('./views/actions');

var template = {

  loadContent: function(hash, isPoppingState) {
    base.hideTooltips();

    log.navigate(hash, []);

    var i, pathwayId, pathwayStage, standard, indicator, patientId;
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
      //$('html').addClass('scroll-bar');
      var params = {};
      var urlBits = hash.split('/');

      if (hash.indexOf('?') > -1) {
        hash.split('?')[1].split('&').forEach(function(param) {
          var elems = param.split("=");
          params[elems[0]] = elems[1];
        });
        urlBits = hash.split('?')[0].split('/');
      }

      if (urlBits[0] === "#overview" && !urlBits[1]) {

        overview.create(template.loadContent);
      } else if (urlBits[0] === "#indicators") {

        indicatorView.create(urlBits[1], urlBits[2], urlBits[3], params.tab || "trend", template.loadContent);

      } else if (urlBits[0] === "#help") {
        layout.view = "HELP";
        lookup.suggestionModalText = "Screen: Help\n===========\n";
        base.clearBox();
        base.selectTab("");
        layout.showPage('help-page');

        layout.showHeaderBarItems();

      } else if (urlBits[0] === "#contact") {
        layout.view = "CONTACT";
        lookup.suggestionModalText = "Screen: Contact us\n===========\n";
        base.clearBox();
        base.selectTab("");
        layout.showPage('contact-page');

        layout.showHeaderBarItems();

      } else if (urlBits[0] === "#patient") {

        //create(pathwayId, pathwayStage, standard, patientId)
        patientView.create(urlBits[2], urlBits[3], urlBits[4], urlBits[1], template.loadContent);

      } else if (urlBits[0] === "#patients") {

        patientId = urlBits[1];

        patientView.create(urlBits[2], urlBits[3], urlBits[4], patientId, template.loadContent);

      } else if (urlBits[0] === "#agreedactions") {

        actionPlan.create();

      } else {
        //if screen not in correct segment then select it
        //alert("shouldn't get here");

        base.wireUpTooltips();
      }
      //manages the suggestions
      $('#suggestionsModalLauncher').off('click').on('click', function(e){
        base.launchSuggestionModal();
        e.preventDefault();
      });

      //tutorial system entry point
      $('#tutorialLaunch').off('click').on('click', function(e){
        tutorial.run();
        e.preventDefault();
      });

      $(document).ready(function(){
      if (RegExp('tuttip=a1p1', 'gi').test(window.location.hash.split("?")[1])) {
        tutorial.runIndicator();
      }
    });
    }

    lookup.currentUrl = hash;
  }

};

module.exports = template;
