const template = require('./template');
const data = require('./data');
const base = require('./base');
const state = require('./state');
const log = require('./log');
const Bloodhound = require('corejs-typeahead/dist/bloodhound');

let states;
let hash;

// console.log(`main.js: data.lastloader= ${data.lastloader}`);
data.lastloader = 'main.js';

const main = {
  version: '2.0.0',

  hash,
  init() {
    main.preWireUpPages();
    // data.get(main.wireUpPages);
    main.wireUpPages();
  },

  getInitialData(callback) {
    data.get(
      state.selectedPractice ? state.selectedPractice._id : null,
      true,
      callback
    );
  },

  onSelected($e, nhsNumberObject) {
    // Hide the suggestions panel
    $('#search-box')
      .find('.tt-dropdown-menu')
      .css('display', 'none');
    log.event('patient-search', window.location.hash, [
      { key: 'patid', value: nhsNumberObject.id },
    ]);
    window.history.pushState(null, null, `#patient/${nhsNumberObject.id}`);
    template.loadContent(`#patient/${nhsNumberObject.id}`, true);
  },

  wireUpSearchBox() {
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

      $('#search-box')
        .find('.typeahead')
        .typeahead('destroy');
      $('#search-box')
        .find('.typeahead')
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
        .on('typeahead:selected', main.onSelected)
        .on('typeahead:autocompleted', main.onSelected)
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
          $(e.currentTarget).typeahead('val', pastedText.replace(/\D/g, ''));
        });

      $('#searchbtn').on('mousedown', () => {
        let val = $('.typeahead')
          .eq(0)
          .val();
        if (!val || val === '') {
          val = $('.typeahead')
            .eq(1)
            .val();
        }
        main.onSelected(null, { id: val });
      });
    });
  },

  wireUpPages() {
    base.wireUpTooltips();
    main.wireUpSearchBox();

    if (main.hash !== window.location.hash) window.location.hash = main.hash;
    template.loadContent(window.location.hash, true, () => {
      // Called when the back button is hit
      $(window).on('popstate', () => {
        template.loadContent(window.location.hash, true);
      });
    });
  },

  preWireUpPages() {
    // Every link element stores href in history
    $(document).on('click', 'a.history', (e) => {
      // keep the link in the browser history
      window.history.pushState(null, null, e.currentTarget.href);
      template.loadContent(window.location.hash, true);
      // do not give a default action
      return false;
    });

    // // Template DOM container constants
    // patientsPanelTemplate = $('#patients-panel');
    // actionPlanPanel = $('#action-plan-panel');
    // patientList = $('#patient-list');
    // suggestedPlanTemplate = $('#suggested-plan-template');
    // individualPanel = $('#individual-panel');
    // valueTrendPanel = $('#value-trend-panel');
    // medicationPanel = $('#medications-panel');
    // actionPlanList = $('#action-plan-list');

    // // Selector DOM container constants
    // bottomLeftPanel = $('#bottom-left-panel');
    // bottomRightPanel = $('#bottom-right-panel');
    // topPanel = $('#top-panel');
    // topLeftPanel = $('#top-left-panel');
    // topRightPanel = $('#top-right-panel');
    // midPanel = $('#mid-panel');
    base.farLeftPanel = $('#left-panel');
    base.farRightPanel = $('#right-panel');
    base.centrePanel = $('#centre-panel');
  },
};

module.exports = main;
