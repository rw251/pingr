const data = require('../data.js');
const state = require('../state.js');
const log = require('../log.js');
const Bloodhound = require('corejs-typeahead/dist/bloodhound');
const patientSearchTemplate = require('../templates/patient-search.jade');

let states;
let loadContFn;
let $searchBox;

const ps = {
  wireUp() {
    $searchBox = $('#search-box');

    if (states) {
      states.clearPrefetchCache();
    }

    data.populateNhsLookup(state.selectedPractice._id, () => {
      states = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(
          Object.keys(data.patLookup[state.selectedPractice._id]),
          stt => ({
            id: stt,
            value:
                data.patLookup[state.selectedPractice._id] &&
                data.patLookup[state.selectedPractice._id][stt]
                  ? data.patLookup[state.selectedPractice._id][stt]
                    .toString()
                    .replace(/ /g, '')
                  : stt,
          })
        ),
      });

      states.initialize(true);

      const $typeAhead = $searchBox.find('.typeahead');

      $typeAhead.typeahead('destroy');
      $typeAhead
        .typeahead(
          {
            hint: true,
            highlight: true,
            minLength: 1,
            autoselect: true,
          },
          {
            name: 'patients',
            displayKey: 'value',
            source: states.ttAdapter(),
            templates: {
              empty: [
                '<div class="empty-message">',
                '&nbsp; &nbsp; No matches',
                '</div>',
              ].join('\n'),
            },
          }
        )
        .on('typeahead:selected', ps.onSelected)
        .on('typeahead:autocompleted', ps.onSelected)
        .on('paste', (e) => {
          e.preventDefault();
          let pastedText = '';
          if (window.clipboardData && window.clipboardData.getData) {
            // IE
            pastedText = window.clipboardData.getData('Text');
          } else if (
            e.originalEvent &&
            e.originalEvent.clipboardData &&
            e.originalEvent.clipboardData.getData
          ) {
            pastedText = e.originalEvent.clipboardData.getData('text/plain');
          }
          $typeAhead.typeahead('val', pastedText.replace(/\D/g, ''));
          // $searchBox.trigger("keyup");
        });

      $searchBox.on('click', '.twitter-typeahead', (e) => {
        if (e.offsetX < 30) {
          // looks like the search icon is clicked
          // logic should be like below
          /* var val = $('.typeahead').eq(0).val();
          if (!val || val === "") val = $('.typeahead').eq(1).val();
          ps.onSelected(null, {
            "id": val
          }); */
        }
      });
    });
  },

  onSelected($e, nhsNumberObject) {
    // Hide the suggestions panel
    $searchBox
      .find('.tt-dropdown-menu')
      .css('display', 'none');
    log.event('patient-search', window.location.hash, [
      { key: 'patid', value: nhsNumberObject.id },
    ]);
    window.history.pushState(null, null, `#patients/${nhsNumberObject.id}`);
    loadContFn(`#patients/${nhsNumberObject.id}`, true);
  },

  show(panel, isAppend, isPatientSelected, loadContentFn) {
    const isDataLoaded = !!(
      data.patLookup && data.patLookup[state.selectedPractice._id]
    );

    loadContFn = loadContentFn;
    let tmpl = patientSearchTemplate;
    let html = tmpl({
      dataLoaded: isDataLoaded,
      patientSelected: isPatientSelected,
    });

    if (isAppend) panel.append(html);
    else panel.html(html);

    // $('#search-box').find('.typeahead').typeahead(); //so it looks ok even while data loading

    const waitUntilDataLoaded = () => {
      setTimeout(() => {
        if (!data.patLookup || !data.patLookup[state.selectedPractice._id]) {
          waitUntilDataLoaded();
        } else {
          tmpl = patientSearchTemplate;
          html = tmpl({ dataLoaded: true, patientSelected: isPatientSelected });
          $('#search-box').replaceWith(html);

          setTimeout(() => {
            ps.wireUp();
          }, 0);
        }
      }, 500);
    };

    if (!isDataLoaded) {
      waitUntilDataLoaded();
    } else {
      setTimeout(() => {
        ps.wireUp();
      }, 0);
    }
  },
};

module.exports = ps;
