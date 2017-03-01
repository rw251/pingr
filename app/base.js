var data = require('./data'),
  lookup = require('./lookup'),
  chart = require('./chart'),
  log = require('./log'),
  ZeroClipboard = require('zeroclipboard');

require('./helpers/jquery-smartresize');

$(window).smartresize(function() {
  $('#addedCSS').text(base.getCssText());
  base.updateFixedHeightElements();
});

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
    $('#mainTab li.active').removeClass('active').find('a').attr("href", href);
    $('#mainTab li[data-id="' + id + '"]').addClass('active').find('a').removeAttr("href");
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
    if (destroy) ZeroClipboard.destroy(); //tidy up

    var client = new ZeroClipboard(selector);

    client.on('ready', function() {
      client.on('aftercopy', function(event) {
        var dataText = event.data['text/plain'];
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
        $(event.target).tooltip('hide');
        $(event.target).popover({
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
        $(event.target).popover('show');
        lookup.tmp = { target: event.target };
        lookup.tmp.timeout = setTimeout(function() {
          delete lookup.tmp;
          $(event.target).popover('hide');
        }, 5000);
        $(event.target).blur();
        //event.stopPropagation();
        //event.preventDefault();
      });
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


    $('#modal .modal').off('submit', 'form').on('submit', 'form', function(e) {

      var suggestion = $('#modal textarea').val();

      log.event("suggestion", window.location.hash, [{ key: "text", value: suggestion }]);

      e.preventDefault();
      $('#modal .modal').modal('hide');
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

  updateTitle: function(title) {
    $('#title-left').html(title);
    $('#title-right').html("");
  },

  hidePanels: function(panel) {
    panel.children().hide();
  },

  updateTab: function(tab, value, url) {
    var tabElement = $('#mainTab a[data-href="#' + tab + '"]');
    tabElement.html(tabElement.text().split(":")[0] + ":<br><span><strong>" + value + "</strong></span>");
    tabElement.data("href", "#" + tab + "/" + url);
  },

  showLoading: function() {
    $('.loading-container').show();
    $('#title-row').hide();
  },

  hideLoading: function() {
    $('.loading-container').fadeOut(0);
    $('#title-row').fadeIn(0);
  },

  getCssText: function() {
    var cssText = base.elements.map(function(v) {
      return v.selector + " {max-height:" + Math.max(v.minHeight,Math.floor($(window).height() - $(v.selector).position().top - v.padding)) + 'px;}';
    }).join(" ");
    return cssText;
  },

  updateFixedHeightElements: function(elements) {
    console.log("update called");
    if (!elements) elements = base.elements;
    base.elements = elements;
    console.log("shall we update?");
    if ($(elements.map(function(v) { return v.selector + ":visible"; }).join(",")).length !== elements.length) {
      console.log("no - wait a bit.");
      setTimeout(function() {
        base.updateFixedHeightElements(elements);
      }, 100);
    } else {
      console.log("yes");
      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css"></style>');
      }

      $('#addedCSS').text(base.getCssText());

      console.log("done");
    }
  }

};

module.exports = base;
