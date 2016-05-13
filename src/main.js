var template = require('./template.js'),
  data = require('./data.js'),
  base = require('./base.js'),
  layout = require('./layout.js'),
  welcome = require('./panels/welcome.js'),
  log = require('./log.js'),
  patientView = require('./views/patient.js'),
  Mustache = require('mustache');

var states, patLookup, page, hash;

console.log("main.js: data.lastloader= " + data.lastloader);
data.lastloader = "main.js";

var main = {
  "version": "2.0.0",

  hash: hash,
  init: function() {
    main.preWireUpPages();

    log.loadActions(function() {
      data.get(main.wireUpPages);
    });
  },

  onSelected: function($e, nhsNumberObject) {
    //Hide the suggestions panel
    $('#search-box').find('.tt-dropdown-menu').css('display', 'none');

    history.pushState(null, null, '#patients/' + nhsNumberObject.id);
    template.loadContent('#patients/' + nhsNumberObject.id, true);


    //template.displaySelectedPatient(nhsNumberObject.id);
  },

  wireUpSearchBox: function() {
    if (states) {
      states.clearPrefetchCache();
    }

    states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(data.patientArray, function(state) {
        return {
          id: state,
          value: data.patLookup && data.patLookup[state] ? data.patLookup[state] : state
        };
      })
    });

    states.initialize(true);

    $('#search-box').find('.typeahead').typeahead('destroy');
    $('#search-box').find('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1,
        autoselect: true
      }, {
        name: 'patients',
        displayKey: 'value',
        source: states.ttAdapter(),
        templates: {
          empty: [
              '<div class="empty-message">',
                '&nbsp; &nbsp; No matches',
              '</div>'
            ].join('\n')
        }
      }).on('typeahead:selected', main.onSelected)
      .on('typeahead:autocompleted', main.onSelected);

    $('#searchbtn').on('mousedown', function() {
      var val = $('.typeahead').eq(0).val();
      if (!val || val === "") val = $('.typeahead').eq(1).val();
      main.onSelected(null, {
        "id": val
      });
    });
  },

  wireUpPages: function() {
    base.wireUpTooltips();
    main.wireUpSearchBox();

    $('#data-file').on('change', function(evt) {
      $('#data-file-wrapper').addClass('disabled').text("Loading...");
      var file = evt.target.files[0]; // FileList object
      var reader = new FileReader();

      reader.onload = (function() {
        return function(e) {
          var JsonObj = JSON.parse(e.target.result);
          data.get(null, JsonObj);
          console.log(JsonObj);

          main.wireUpSearchBox();

          setTimeout(function() {
            if (!$('#patient-file-wrapper').is(':visible')) {
              $('#file-loader').hide(500);
            } else {
              $('#data-file-wrapper').hide(500);
            }
            template.loadContent('#overview');
          }, 1000);
        };
      })(file);

      reader.readAsText(file);
    });

    $('#patient-file').on('change', function(evt) {
      $('#patient-file-wrapper').addClass('disabled').text("Loading...");
      var file = evt.target.files[0]; // FileList object
      var reader = new FileReader();

      reader.onload = (function() {
        return function(e) {
          var lines = e.target.result.split("\n");
          data.patLookup = {};
          for (var i = 0; i < lines.length; i++) {
            var fields = lines[i].split("\t");
            if (fields.length !== 2) continue;
            data.patLookup[fields[0].trim()] = fields[1].trim();
          }

          main.wireUpSearchBox();

          setTimeout(function() {
            if (!$('#data-file-wrapper').is(':visible')) {
              $('#file-loader').hide(500);
            } else {
              $('#patient-file-wrapper').hide(500);
            }
            template.loadContent('#overview');
          }, 1000);
        };
      })(file);

      reader.readAsText(file);
    });

    $('#outstandingTasks').on('click', function(e) {
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      var tempMust = $('#welcome-task-list').html();
      var rendered = Mustache.render(tempMust);
      $('#welcome-tab-content').fadeOut(100, function() {
        $(this).html(rendered);
        welcome.populate();
        $(this).fadeIn(100);
      });
    });

    $('#completedTasks').on('click', function(e) {
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      var tempMust = $('#welcome-task-list').html();
      var rendered = Mustache.render(tempMust);
      $('#welcome-tab-content').fadeOut(100, function() {
        $(this).html(rendered);
        welcome.populate(true);
        $(this).fadeIn(100);
      });
    });

    if (main.hash !== location.hash) location.hash = main.hash;
    template.loadContent(location.hash, true);
  },

  preWireUpPages: function() {
      layout.showPage('login');

      //Every link element stores href in history
      $(document).on('click', 'a.history', function() {
        // keep the link in the browser history
        history.pushState(null, null, this.href);
        template.loadContent(location.hash, true);
        // do not give a default action
        return false;
      });

      //Called when the back button is hit
      $(window).on('popstate', function(e) {
        template.loadContent(location.hash, true);
      });

      //Templates
      patientsPanelTemplate = $('#patients-panel');
      actionPlanPanel = $('#action-plan-panel');
      patientList = $('#patient-list');
      suggestedPlanTemplate = $('#suggested-plan-template');
      individualPanel = $('#individual-panel');
      valueTrendPanel = $('#value-trend-panel');
      medicationPanel = $('#medications-panel');
      actionPlanList = $('#action-plan-list');

      //Selectors
      bottomLeftPanel = $('#bottom-left-panel');
      bottomRightPanel = $('#bottom-right-panel');
      topPanel = $('#top-panel');
      topLeftPanel = $('#top-left-panel');
      topRightPanel = $('#top-right-panel');
      midPanel = $('#mid-panel');
      farLeftPanel = $('#left-panel');
      farRightPanel = $('#right-panel');
    }
    /*,
      "_local": local*/
};

module.exports = main;
