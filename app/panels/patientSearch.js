var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  log = require('../log.js');
var states, loadContFn, ID = "PATIENT_SEARCH";

var ps = {

  wireUp: function() {
    if (states) {
      states.clearPrefetchCache();
    }

    data.populateNhsLookup(function(){

      states = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(data.patientArray, function(state) {
          return {
            id: state,
            value: data.patLookup && data.patLookup[state] ? data.patLookup[state].toString().replace(/ /g,"") : state
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
        }).on('typeahead:selected', ps.onSelected)
        .on('typeahead:autocompleted', ps.onSelected);

      $('#searchbtn').on('mousedown', function() {
        var val = $('.typeahead').eq(0).val();
        if (!val || val === "") val = $('.typeahead').eq(1).val();
        ps.onSelected(null, {
          "id": val
        });
      });

    });

  },

  onSelected: function($e, nhsNumberObject) {
    //Hide the suggestions panel
    $('#search-box').find('.tt-dropdown-menu').css('display', 'none');
    log.event("patient-search", window.location.hash, [{key:"patid",value:nhsNumberObject.id}]);
    history.pushState(null, null, '#patients/' + nhsNumberObject.id);
    loadContFn('#patients/' + nhsNumberObject.id, true);

  },

  show: function(panel, isAppend, loadContentFn) {

    loadContFn = loadContentFn;
    var tmpl = require("templates/patient-search");

    if(isAppend) panel.append(tmpl());
    else panel.html(tmpl());

    ps.wireUp();
  }

};

module.exports = ps;
