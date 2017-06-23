var template = require('./template'),
  data = require('./data'),
  base = require('./base'),
  layout = require('./layout'),
  log = require('./log'),
  wrapper = require('./panels/wrapper'), // *B*
  indicatorTrend = require('./panels/indicatorTrend'), // *B*
  patientView = require('./views/patient');

var states, patLookup, page, hash;

console.log("main.js: data.lastloader= " + data.lastloader);
data.lastloader = "main.js";

var main = {
  "version": "2.0.0",

  hash: hash,
  init: function(callback) {
    main.preWireUpPages();
    //data.get(main.wireUpPages);
    main.wireUpPages();
  },

  getInitialData: function(callback) {
    data.get(callback);
  },

  onSelected: function($e, nhsNumberObject) {
    //Hide the suggestions panel
    $('#search-box').find('.tt-dropdown-menu').css('display', 'none');
    log.event("patient-search", window.location.hash, [{ key: "patid", value: nhsNumberObject.id }]);
    history.pushState(null, null, '#patients/' + nhsNumberObject.id);
    template.loadContent('#patients/' + nhsNumberObject.id, true);
  },

  wireUpSearchBox: function() {
    if (states) {
      states.clearPrefetchCache();
    }

    data.populateNhsLookup(function() {

      states = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(Object.keys(data.patLookup), function(state) {
          return {
            id: state,
            value: data.patLookup && data.patLookup[state] ? data.patLookup[state].toString().replace(/ /g, "") : state
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
        .on('typeahead:autocompleted', main.onSelected)
        .on('paste', function(e) {
          e.preventDefault();
          var pastedText = '';
          if (window.clipboardData && window.clipboardData.getData) { // IE
            pastedText = window.clipboardData.getData('Text');
          } else if (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
            pastedText = e.originalEvent.clipboardData.getData('text/plain');
          }
          $(this).typeahead('val', pastedText.replace(/\D/g, ''));
          //$(this).trigger("keyup");
        });

      $('#searchbtn').on('mousedown', function() {
        var val = $('.typeahead').eq(0).val();
        if (!val || val === "") val = $('.typeahead').eq(1).val();
        main.onSelected(null, {
          "id": val
        });
      });

    });

  },

  wireUpPages: function() {
    base.wireUpTooltips();
    main.wireUpSearchBox();

    if (main.hash !== location.hash) location.hash = main.hash;
    template.loadContent(location.hash, true);
  },

  preWireUpPages: function() {
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


    //Template DOM container constants
    patientsPanelTemplate = $('#patients-panel');
    actionPlanPanel = $('#action-plan-panel');
    patientList = $('#patient-list');
    suggestedPlanTemplate = $('#suggested-plan-template');
    individualPanel = $('#individual-panel');
    valueTrendPanel = $('#value-trend-panel');
    medicationPanel = $('#medications-panel');
    actionPlanList = $('#action-plan-list');

    //Selector DOM container constants
    bottomLeftPanel = $('#bottom-left-panel');
    bottomRightPanel = $('#bottom-right-panel');
    topPanel = $('#top-panel');
    topLeftPanel = $('#top-left-panel');
    topRightPanel = $('#top-right-panel');
    midPanel = $('#mid-panel');
    farLeftPanel = $('#left-panel');
    farRightPanel = $('#right-panel');
    centrePanel = $('#centre-panel');
  }

};

module.exports = main;
