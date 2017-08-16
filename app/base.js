var data = require('./data'),
  lookup = require('./lookup'),
  chart = require('./chart'),
  log = require('./log'),
  notify = require('./notify'),
  Clipboard = require('clipboard');

require('./helpers/jquery-smartresize');

$(window).smartresize(function() {
  $('#addedCSS').text(base.getCssText());
  base.updateFixedHeightElements();
});

var clipboard;

var base = {

  //object for keeping track what is in each panel to prevent unnecessary redraws
  panels: {},

  textFromHistory: function(history) {
    if(!history.who) return history;
    return (history.who.trim() === $('#user_fullname').text().trim() ? "You " : history.who.trim() + " ") +
      history.what + " this action on " + new Date(history.when).toDateString() + (history.why ? " You disagreed because you said: '" + history.why + "'" : "");
  },

  selectTab: function(id) {
    var href = $('#mainTab li.active a').data("href");
    $('#mainTab li.active').removeClass('active').find('a').attr("href", href).find('div.btn').removeClass('btn-warning');
    $('#mainTab li[data-id="' + id + '"]').addClass('active').find('a').removeAttr("href").find('div.btn').addClass('btn-warning');

  },

  createPanel: function(templateFn, data, templates) {
    var rendered = templateFn(data);
    return rendered;
  },

  //*b* maintains the state of the right-panel in all tabs that use it
  //    presently this is involved in chaching the state of indicator tab
  //    however it is ready to use to maintain overview and patient tabs if
  //    required in the future.
  savePanelState: function() {
    if ($("div[class*='state-']")[0] !== undefined) {
      //RW replaced includes with indexOf - includes only supported in IE from v 12
      if ($("div[class*='state-']").attr('class').indexOf('overview') > -1) {
        //save as overview
        var stateData = $("div[class*='state-']").children();
        $("#stateM-overview").html(stateData);
        return;
      }

      if ($("div[class*='state-']").attr('class').indexOf('indicator') > -1) {
        //save as indicator
        var stateData = $("div[class*='state-']").children();
        $("#stateM-indicator").html(stateData);
        return;
      }

      if ($("div[class*='state-']").attr('class').indexOf('patient') > -1) {
        //save as patient
        var stateData = $("div[class*='state-']").children();
        $("#stateM-patient").html(stateData);
        return;
      }
    }
  },

  createPanelShow: function(templateSelector, panelSelector, data, templates) {
    var rendered = base.createPanel(templateSelector, data, templates);
    panelSelector.html(rendered).show();
  },

  hideFooter: function() {
    $('footer').hide();
  },

  showFooter: function() {
    $('footer').show();
  },

  hideTooltips: function() {
    $('[data-toggle="tooltip"]').tooltip('hide');
  },

  wireUpTooltips: function() {
    $('[data-toggle="tooltip"]').tooltip('hide');
    $('.tooltip').remove();

    $('.tooltip-on-click').tooltip({
      container: 'body'
    });
    $('[data-toggle="tooltip"]:visible').tooltip({
      container: 'body',
      delay: {
        "show": 500,
        "hide": 100
      },
      html: true
    });
    $('[data-toggle="lone-tooltip"]:visible').tooltip({
      container: 'body',
      delay: {
        "show": 300,
        "hide": 100
      }
    });
    $('[data-toggle="lone-tooltip"]').on('shown.bs.tooltip', function(e) {
      $('[data-toggle="tooltip"]').not(this).tooltip('hide');
    });
    $('.patient-row-tooltip').on('show.bs.tooltip', function(e) {
      if ($(this).hasClass('highlighted')) {
        e.stopPropagation();
        e.preventDefault();
      }
    });
  },

  setupClipboard: function(selector, destroy) {
    if (destroy && clipboard) clipboard.destroy(); //tidy up

    clipboard = new Clipboard(selector);

    clipboard.on('success', function(event) {
      var dataText = event.text;//data['text/plain'];
      var ispatid = dataText.match(/[0-9]{10}/);
      if (ispatid && ispatid.length > 0) {
        var poss = Object.keys(data.patLookup).filter(function(v) {
          return data.patLookup[v] === ispatid[0];
        });
        if (poss & poss.length > 0) {
          dataText = poss[0];
        } else {
          dataText = "XXX XXX XXXX";
        }
      }
      log.event("copy-button", window.location.hash, [{ key: "data", value: dataText }]);
      console.log('Copied text to clipboard: ' + dataText);
      $(event.trigger).tooltip('hide');
      $(event.trigger).popover({
        trigger: 'manual',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
        delay: {
          show: 500,
          hide: 500
        },
        html: true
      });
      if (lookup.tmp) {
        clearTimeout(lookup.tmp.timeout);
        $(lookup.tmp.target).popover('hide');
      }
      $(event.trigger).popover('show');
      lookup.tmp = { target: event.trigger };
      lookup.tmp.timeout = setTimeout(function() {
        delete lookup.tmp;
        $(event.trigger).popover('hide');
      }, 5000);
      $(event.trigger).blur();
      //event.stopPropagation();
      //event.preventDefault();
    });
  },

  clearBox: function() {
    //Clear the patient search box
    $('.typeahead').typeahead('val', '');
  },

  /********************************
   * Modals
   ********************************/

  launchSuggestionModal: function() {
    var tmpl = require("templates/modal-suggestion");

    $('#modal').html(tmpl({ text: lookup.suggestionModalText }));

    $('#modal .modal').off('shown.bs.modal').on('shown.bs.modal', function (e) {
      $('#modal-suggestion-text').focus();
    });

    $('#modal .modal').off('submit', 'form').on('submit', 'form', function(e) {

      var suggestion = $('#modal textarea').val();

      log.event("suggestion", window.location.hash, [{ key: "text", value: suggestion }]);

      e.preventDefault();
      $('#modal .modal').modal('hide');

      notify.showSaved();
    }).modal();

  },

  switchTo2Column1Narrow1Wide: function() {
    if (base.layout === "12") return;
    base.layout = "12";
    farLeftPanel.show();
    farRightPanel.show();
    centrePanel.hide();
  },

  switchToSingleColumn: function () {
    if (base.layout === "1") return;
    base.layout = "1";
    farLeftPanel.hide();
    farRightPanel.hide();
    centrePanel.show();
  },

  updateTitle: function(title, dontClearRight) {
    $('#title-left').html(title);
    if(!dontClearRight) $('#title-right').html("");
  },

  hidePanels: function(panel) {
    panel.children().hide();
  },

  updateTab: function(tab, value, url) {
    /*var tabElement = $('#mainTab a[data-href="#' + tab + '"]');
    tabElement.html(tabElement.text().split(":")[0] + ":<br><span><strong>" + value + "</strong></span>");
    tabElement.data("href", "#" + tab + "/" + url);*/

    var tabElement = $('#mainTab a[data-href="#' + tab + '"]');
    var tabPresentation = tabElement.find('div.btn')
    tabPresentation.html("<i>" + tabElement.text().split("-")[0] + "</i> - <span><strong>" + value + "</strong></span><div class='ripple-container'></div>");
    tabElement.data("href", "#" + tab + "/" + url);
  },

/**
 * Show the main loading page and hide everything else
 */
  showLoading: function() {
    $('.loading-container').show();
    $('#title-row').hide();
  },

/**
 * Show a loading icon in a given element with an optional message
 */
  showLocalLoading: function(element, message) {
    var tmpl = require('./templates/loading');
    element.html(tmpl({message: message}));
  },

  hideLoading: function() {
    $('.loading-container').fadeOut(0);
    $('#title-row').fadeIn(0);
  },

  getCssText: function(elements) {
    if(!elements) elements = base.elements;
    var cssText = elements.map(function(v) {
      return v.selector + " {max-height:" + Math.max(v.minHeight,Math.floor($(window).height() - $(v.selector).position().top - v.padding)) + "px;min-height:" + v.minHeight + "px;}";
    }).join(" ");
    return cssText;
  },

  updateFixedHeightElements: function(elements) {
    //console.log(elements);
    //console.log("update called");
    if (!elements) elements = base.elements;
    base.elements = elements;
    console.log("shall we update?");
    var currentlyVisibleElements = elements.filter(function(v){
      return $(v.selector + ":visible").length>0 ;
    });
    if (currentlyVisibleElements.length !== elements.length) {
      console.log("no - wait a bit.");
      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css"></style>');
      }

      $('#addedCSS').text(base.getCssText(currentlyVisibleElements));
      setTimeout(function() {
        base.updateFixedHeightElements(elements);
      }, 100);
    } else {
//      console.log("yes");
      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css"></style>');
      }

      $('#addedCSS').text(base.getCssText());

      console.log("done");
    }
  }

};

module.exports = base;
