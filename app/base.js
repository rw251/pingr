const data = require('./data');
const lookup = require('./lookup');
const state = require('./state');
const log = require('./log');
const notify = require('./notify');
const Clipboard = require('clipboard');
const modalSuggestionTmpl = require('./templates/modal-suggestion.jade');
const modalAboutTmpl = require('./templates/modal-about.jade');
const loadingTmpl = require('./templates/loading.jade');

require('./helpers/jquery-smartresize');
// require('./helpers/jquery-smartscroll');

let clipboard;

const base = {
  // object for keeping track what is in each panel to prevent unnecessary redraws
  panels: {},

  textFromHistory(history) {
    if (!history.who) return history;
    return `${(history.who.trim() === lookup.userName
      ? 'You '
      : `${history.who.trim()} `) + history.what} this action on ${new Date(history.when).toDateString()}${
      history.why ? ` You disagreed because you said: '${history.why}'` : ''
    }`;
  },

  selectTab(id) {
    const href = $('#mainTab li.active a').data('href');
    $('#mainTab li.active')
      .removeClass('active')
      .find('a')
      .attr('href', href);
    $(`#mainTab li[data-id="${id}"]`)
      .addClass('active')
      .find('a')
      .removeAttr('href');
  },

  // get the currently selected tab
  getTab() {
    const tab = $('#mainTab li.active').attr('id');
    if (tab === 'patientTab' && window.location.hash.indexOf('patients') > -1) { return 'patientsTab'; }
    return $('#mainTab li.active').attr('id');
  },

  createPanel(templateFn, templateData) {
    const rendered = templateFn(templateData);
    return rendered;
  },

  //* b* maintains the state of the right-panel in all tabs that use it
  //    presently this is involved in chaching the state of indicator tab
  //    however it is ready to use to maintain overview and patient tabs if
  //    required in the future.
  savePanelState() {
    if ($("div[class*='state-']")[0] !== undefined) {
      // RW replaced includes with indexOf - includes only supported in IE from v 12
      if (
        $("div[class*='state-']")
          .attr('class')
          .indexOf('overview') > -1
      ) {
        // save as overview
        const stateData = $("div[class*='state-']").children();
        $('#stateM-overview').html(stateData);
        return;
      }

      if (
        $("div[class*='state-']")
          .attr('class')
          .indexOf('indicator') > -1
      ) {
        // save as indicator
        const stateData = $("div[class*='state-']").children();
        $('#stateM-indicator').html(stateData);
        return;
      }

      if (
        $("div[class*='state-']")
          .attr('class')
          .indexOf('patient') > -1
      ) {
        // save as patient
        const stateData = $("div[class*='state-']").children();
        $('#stateM-patient').html(stateData);
      }
    }
  },

  createPanelShow(templateSelector, panelSelector, templateData, templates) {
    const rendered = base.createPanel(
      templateSelector,
      templateData,
      templates
    );
    panelSelector.html(rendered).show();
  },

  hideFooter() {
    $('footer').hide();
  },

  showFooter() {
    $('footer').show();
  },

  hideTooltips() {
    $('[data-toggle="tooltip"]').tooltip('hide');
  },

  wireUpTooltips() {
    $('[data-toggle="tooltip"]').tooltip('hide');
    $('.tooltip').remove();

    $('.tooltip-on-click').tooltip({ container: 'body' });
    $('[data-toggle="tooltip"]:visible').tooltip({
      container: 'body',
      delay: {
        show: 500,
        hide: 100,
      },
      html: true,
    });
    $('[data-toggle="lone-tooltip"]:visible').tooltip({
      container: 'body',
      delay: {
        show: 300,
        hide: 100,
      },
    });
    $('[data-toggle="lone-tooltip"]').on('shown.bs.tooltip', (e) => {
      $('[data-toggle="tooltip"]')
        .not(e.currentTarget)
        .tooltip('hide');
    });
    $('.patient-row-tooltip').on('show.bs.tooltip', (e) => {
      if ($(e.currentTarget).hasClass('highlighted')) {
        e.stopPropagation();
        e.preventDefault();
      }
    });
  },

  setupClipboard(selector, destroy) {
    if (destroy && clipboard) clipboard.destroy(); // tidy up

    clipboard = new Clipboard(selector);

    clipboard.on('success', (event) => {
      let dataText = event.text; // data['text/plain'];
      const ispatid = dataText.match(/[0-9]{10}/);
      if (ispatid && ispatid.length > 0) {
        const poss = Object
          .keys(data.patLookup[state.selectedPractice._id])
          .filter(v => data.patLookup[state.selectedPractice._id][v] === ispatid[0]);
        if (poss && poss.length > 0) {
          [dataText] = poss;
        } else {
          dataText = 'XXX XXX XXXX';
        }
      }
      log.event('copy-button', window.location.hash, [
        { key: 'data', value: dataText },
      ]);
      // console.log(`Copied text to clipboard: ${dataText}`);
      $(event.trigger).tooltip('hide');
      $(event.trigger).popover({
        trigger: 'manual',
        template:
          '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
        delay: {
          show: 500,
          hide: 500,
        },
        html: true,
      });
      if (lookup.tmp) {
        clearTimeout(lookup.tmp.timeout);
        $(lookup.tmp.target).popover('hide');
      }
      $(event.trigger).popover('show');
      lookup.tmp = { target: event.trigger };
      lookup.tmp.timeout = setTimeout(() => {
        delete lookup.tmp;
        $(event.trigger).popover('hide');
      }, 5000);
      $(event.trigger).blur();
      // event.stopPropagation();
      // event.preventDefault();
    });
  },

  clearBox() {
    // Clear the patient search box
    $('.typeahead').typeahead('val', '');
  },

  /** ******************************
   * Modals
   ******************************* */

  launchAboutModal() {
    $('#modal').html(modalAboutTmpl());

    $('#modal .modal')
      .off('shown.bs.modal')
      .on('shown.bs.modal', () => {
        $('#modal-suggestion-text').focus();
      });

    $('#modal .modal')
      .off('submit', 'form')
      .on('submit', 'form', (e) => {
        const suggestion = $('#modal textarea').val();

        log.event('suggestion', window.location.hash, [
          { key: 'text', value: suggestion },
        ]);

        e.preventDefault();
        $('#modal .modal').modal('hide');

        notify.showSaved();
      })
      .modal();
  },

  launchSuggestionModal() {
    $('#modal').html(modalSuggestionTmpl({ text: lookup.suggestionModalText }));

    $('#modal .modal')
      .off('shown.bs.modal')
      .on('shown.bs.modal', () => {
        $('#modal-suggestion-text').focus();
      });

    $('#modal .modal')
      .off('submit', 'form')
      .on('submit', 'form', (e) => {
        const suggestion = $('#modal textarea').val();

        log.event('suggestion', window.location.hash, [
          { key: 'text', value: suggestion },
        ]);

        e.preventDefault();
        $('#modal .modal').modal('hide');

        notify.showSaved();
      })
      .modal();
  },

  switchTo2Column1Narrow1Wide() {
    if (base.layout === '12') return;
    base.layout = '12';
    base.farLeftPanel.show();
    base.farRightPanel.show();
    base.centrePanel.hide();
  },

  switchToSingleColumn() {
    if (base.layout === '1') return;
    base.layout = '1';
    base.farLeftPanel.hide();
    base.farRightPanel.hide();
    base.centrePanel.show();
  },

  updateTitle(title, dontClearRight) {
    $('#title-left').html(title);
    if (!dontClearRight) $('#title-right').html('');
  },

  hidePanels(panel) {
    panel.children().hide();
  },

  updateTab(tab, value, url) {
    const tabId = tab === 'patient' ? 'patients' : tab;
    const tabElement = $(`#mainTab a[data-href="#${tabId}"]`);
    tabElement.html(`${
      tabElement.text().split(':')[0]
    }:<br><span><strong>${value}</strong></span>`);
    tabElement.data('href', `#${tab}/${url}`);
  },

  resetTab(tab) {
    const tabElement = $(`#mainTab a[data-href="#${tab}"]`);
    tabElement.html(tabElement.text().split(':')[0]);
    tabElement.data('href', `#${tab}`);
    tabElement.attr('href', `#${tab}`);
  },
  /**
   * Show the main loading page and hide everything else
   */
  showLoading() {
    $('.loading-container').show();
    $('#title-row').hide();
  },

  /**
   * Show a loading icon in a given element with an optional message
   */
  showLocalLoading(element, message) {
    element.html(loadingTmpl({ message }));
  },

  hideLoading() {
    $('.loading-container').fadeOut(0);
    $('#title-row').fadeIn(0);
  },

  getCssText(elems) {
    const elements = elems || base.elements;
    const cssText = elements
      .map(v =>
        `${v.selector} {max-height:${Math.max(
          v.minHeight,
          Math.floor($(window).height() - $(v.selector).position().top - v.padding)
        )}px;min-height:${v.minHeight}px;}`)
      .join(' ');
    return cssText;
  },

  updateFixedHeightElements(elems) {
    // console.log(elems);
    // console.log('update called');
    const elements = elems || base.elements;
    base.elements = elements;
    // console.log('shall we update?');
    const currentlyVisibleElements = elements.filter(v => $(`${v.selector}:visible`).length > 0);
    if (currentlyVisibleElements.length !== elements.length) {
      // console.log('no - wait a bit.');
      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css"></style>');
      }

      $('#addedCSS').text(base.getCssText(currentlyVisibleElements));
      setTimeout(() => {
        base.updateFixedHeightElements(elements);
      }, 100);
    } else {
      // console.log('yes');
      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css"></style>');
      }

      $('#addedCSS').text(base.getCssText());

      // console.log('done');
    }
  },

  resizeListeners: [],
};

$(window).smartresize(() => {
  $('#addedCSS').text(base.getCssText());
  base.updateFixedHeightElements();

  base.resizeListeners.forEach((l) => {
    l();
  });
});

// $('#right-panel').smartscroll(() => {
//   base.resizeListeners.forEach((l) => {
//     l();
//   });
// });

module.exports = base;
