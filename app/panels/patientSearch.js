var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  log = require('../log.js');
var states, loadContFn, ID = "PATIENT_SEARCH";

var isFetching = false;
var ps = {

  wireUp: function() {

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
        }).on('typeahead:selected', ps.onSelected)
        .on('typeahead:autocompleted', ps.onSelected)
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

      $('#search-box').on('click', '.twitter-typeahead', function(e){
        if(e.offsetX < 30) {
          // looks like the search icon is clicked
          //logic should be like below
          /*var val = $('.typeahead').eq(0).val();
          if (!val || val === "") val = $('.typeahead').eq(1).val();
          ps.onSelected(null, {
            "id": val
          });*/
        }
      });

    });

  },

  onSelected: function($e, nhsNumberObject) {
    //Hide the suggestions panel
    $('#search-box').find('.tt-dropdown-menu').css('display', 'none');
    log.event("patient-search", window.location.hash, [{ key: "patid", value: nhsNumberObject.id }]);
    history.pushState(null, null, '#patients/' + nhsNumberObject.id);
    loadContFn('#patients/' + nhsNumberObject.id, true);

  },

  show: function(panel, isAppend, isPatientSelected, loadContentFn) {

    var isDataLoaded = data.patLookup ? true : false;

    loadContFn = loadContentFn;
    var tmpl = require("templates/patient-search");
    var html = tmpl({ dataLoaded: isDataLoaded, patientSelected: isPatientSelected });

    if (isAppend) panel.append(html);
    else panel.html(html);
    // if (isAppend) panel.append(html);
    //panel.html(html);

    //$('#search-box').find('.typeahead').typeahead(); //so it looks ok even while data loading

    var waitUntilDataLoaded = function() {
      setTimeout(function() {
        if (!data.patLookup) {
          waitUntilDataLoaded();
        } else {
          tmpl = require("templates/patient-search");
          html = tmpl({ dataLoaded: true, patientSelected: isPatientSelected });
          $('#patient-Search').replaceWith(html);
          if(isPatientSelected)
          {
            $('#patient-Search .card-title').html("<div class='col-sm-6'><p>Find another patient</p></div><div class='col-sm-2'><a class='btn btn-sm' href='/#patients'>reset</a></div>");
          }
          else {
            $('#patient-Search .card-title').html("<p>Find a patient</p>");
          }
          setTimeout(function() {
            ps.wireUp();
          }, 0);
        }
      }, 500);
    };

    if (!isDataLoaded) {
      waitUntilDataLoaded();
    } else {
      setTimeout(function() {
        ps.wireUp();
      }, 0);
    }
  }

};

module.exports = ps;
