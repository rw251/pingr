var data = require('./data.js'),
  lookup = require('./lookup.js'),
  chart = require('./chart.js'),
  log = require('./log.js'),
  Mustache = require('mustache'),
  ZeroClipboard = require('zeroclipboard');

var base = {

  //object for keeping track what is in each panel to prevent unnecessary redraws
  panels: {},

  selectTab: function(id) {
    var href = $('#mainTab li.active a').data("href");
    $('#mainTab li.active').removeClass('active').find('a').attr("href", href);
    $('#mainTab li[data-id="' + id + '"]').addClass('active').find('a').removeAttr("href");
  },

  createPanel: function(templateSelector, data, templates) {
    var tempMust = templateSelector.html();
    Mustache.parse(tempMust); // optional, speeds up future uses
    if (templates) {
      for (var o in templates) {
        if (templates.hasOwnProperty(o)) {
          Mustache.parse(templates[o]);
        }
      }
    }
    var rendered = Mustache.render(tempMust, data, templates);
    return rendered;
  },

  createPanelShow: function(templateSelector, panelSelector, data, templates) {
    var rendered = base.createPanel(templateSelector, data, templates);
    panelSelector.html(rendered).show();
  },

  showPathwayStageOverviewPanel: function(location, enableHover, pathwayId, pathwayStage) {
    var standards = [];
    for (var standard in data[pathwayId][pathwayStage].standards) {
      var denom = data.getDenominatorForStandard(pathwayId, pathwayStage);
      var num = denom - data.getNumeratorForStandard(pathwayId, pathwayStage, standard);
      standards.push({
        "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
        "standardKey": standard,
        "tooltip": data[pathwayId][pathwayStage].standards[standard]["standard-met-tooltip"],
        "numerator": num,
        "denominator": denom,
        "percentage": (num * 100 / denom).toFixed(0)
      });
    }

    base.createPanelShow($('#pathway-stage-overview-panel'), location, {
      pathway: data.pathwayNames[pathwayId],
      pathwayStage: pathwayStage,
      pathwayStageName: lookup.categories[pathwayStage].display,
      pathwayNameShort: pathwayId,
      title: data[pathwayId][pathwayStage].text.panel.text,
      standards: standards
    }, {
      "row": $('#overview-panel-table-row').html()
    });

    $('#' + pathwayStage + '-trend-toggle').on('click', function(e) {
      if ($(this).text() === "Trend") {
        $(this).text("Table");
        $('#' + pathwayStage + '-chart-table').hide();
        $('#' + pathwayStage + '-chart-wrapper').show();
      } else {
        $(this).text("Trend");
        $('#' + pathwayStage + '-chart-table').show();
        $('#' + pathwayStage + '-chart-wrapper').hide();
      }
      e.stopPropagation();
    });

    chart.drawOverviewChart(pathwayId, pathwayStage, enableHover);

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

    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      delay: {
        "show": 500,
        "hide": 100
      },
      html: true
    });
    $('[data-toggle="lone-tooltip"]').tooltip({
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
        console.log('Copied text to clipboard: ' + event.data['text/plain']);
        $(event.target).tooltip('hide');
        $(event.target).popover({
          trigger: 'manual',
          template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
          delay: {
            show: 500,
            hide: 500
          }
        });
        clearTimeout(lookup.tmp);
        $(event.target).popover('show');
        lookup.tmp = setTimeout(function() {
          $(event.target).popover('hide');
        }, 600);
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

  launchModal: function(data, label, value, reasonText, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var template = $('#modal-why').html();
    Mustache.parse(template); // optional, speeds up future uses

    var reasonTemplate = $('#modal-why-item').html();
    Mustache.parse(reasonTemplate);

    if (data.reasons && data.reasons.length > 0) data.hasReasons = true;

    var rendered = Mustache.render(template, data, {
      "item": reasonTemplate
    });
    $('#modal').html(rendered);

    if (reasonText) {
      $('#modal textarea').val(reasonText);
    }
    lookup.modalSaved = false;
    lookup.modalUndo = false;

    $('#modal .modal').off('click', '.undo-plan').on('click', '.undo-plan', function(e) {
      lookup.modalUndo = true;
    }).off('submit', 'form').on('submit', 'form', {
      "label": label
    }, function(e) {
      if (!e.data.label) e.data.label = "team";
      var reason = $('input:radio[name=reason]:checked').val();
      var reasonText = $('#modal textarea').val();

      log.recordFeedback(data.pathwayId, e.data.label, value, reason, reasonText);

      lookup.modalSaved = true;

      e.preventDefault();
      $('#modal .modal').modal('hide');
    }).modal();

    $('#modal').off('hidden.bs.modal').on('hidden.bs.modal', {
      "label": label
    }, function(e) {
      if (lookup.modalSaved) {
        lookup.modalSaved = false;
        if (callbackOnSave) callbackOnSave();
      } else if (lookup.modalUndo) {
        lookup.modalUndo = false;
        if (callbackOnUndo) callbackOnUndo();
      } else {
        //uncheck as cancelled. - but not if value is empty as this unchecks everything - or if already checked
        if (callbackOnCancel) callbackOnCancel();
      }
    });
  },

  sortSuggestions: function(suggestions) {
    suggestions.sort(function(a, b) {
      if (a.agree && !a.done) {
        if (b.agree && !b.done) return 0;
        return -1;
      } else if (!a.agree && !a.disagree) {
        if (!b.agree && !b.disagree) return 0;
        if (b.agree && !b.done) return 1;
        return -1;
      } else if (a.agree && a.done) {
        if (b.agree && b.done) return 0;
        if (b.disagree) return -1;
        return 1;
      } else {
        if (b.disagree) return 0;
        return 1;
      }
    });

    return suggestions;
  },

  addDisagreePersonalTeam: function(plans) {
    for (var i = 0; i < plans.length; i++) {
      if (plans[i].agree) {
        plans[i].disagree = false;
      } else if (plans[i].agree === false) {
        plans[i].disagree = true;
      }
    }
    return plans;
  },

  suggestionList: function(ids) {
    return ids.map(function(val) {
      return {
        "id": val.id || val,
        "text": log.text[val.id || val].text,
        "subsection": val.subsection
      };
    }).filter(function(v, i) { //RW to always limit to 3
      return i < 3;
    });
  },

  mergeIndividualStuff: function(suggestions, patientId) {
    var localActions = log.listActions();
    if (!localActions[patientId]) return suggestions;

    for (var i = 0; i < suggestions.length; i++) {
      if (localActions[patientId][suggestions[i].id]) {
        if (localActions[patientId][suggestions[i].id].agree) {
          suggestions[i].agree = true;
        } else if (localActions[patientId][suggestions[i].id].agree === false) {
          suggestions[i].disagree = true;
        }
        if (localActions[patientId][suggestions[i].id].done) suggestions[i].done = localActions[patientId][suggestions[i].id].done;
      }
    }
    return suggestions;
  },

  switchTo110Layout: function() {
    if (base.layout === "110") return;
    base.layout = "110";
    farLeftPanel.removeClass('col-lg-3 col-lg-8').addClass('col-lg-6').show();
    topPanel.hide();
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    midPanel.hide();
    farRightPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
  },

  switchTo101Layout: function() {
    if (base.layout === "101") return;
    base.layout = "101";
    farLeftPanel.removeClass('col-lg-3 col-lg-6 col-xl-4').addClass('col-lg-8').show();
    topPanel.hide();
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    midPanel.hide();
    farRightPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
  },



  switchTo221Layout: function() {
    if (base.layout === "221") return;
    base.layout = "221";
    farLeftPanel.hide();
    topPanel.hide();
    topLeftPanel.addClass('col-xl-6').show();
    bottomLeftPanel.addClass('col-xl-6').show();
    topRightPanel.removeClass('col-xl-12').addClass('col-xl-6').show();
    bottomRightPanel.removeClass('col-xl-12').addClass('col-xl-6').show();
    midPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
    farRightPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
  },

  switchTo21Layout: function() {
    if (base.layout === "21") return;
    base.layout = "21";
    farLeftPanel.hide();
    topPanel.hide();
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.removeClass('col-xl-6').addClass('col-xl-12').show();
    bottomRightPanel.removeClass('col-xl-6').addClass('col-xl-12').show();
    midPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
    farRightPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
  },

  wireUpStandardDropDown: function(pathwayId, pathwayStage, standard, callback) {
    var breaches = data.options.filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard;
    });

    if (breaches.length > 0) $('select').val(breaches[0].value);

    $('select').select2({
      templateResult: base.formatStandard,
      minimumResultsForSearch: Infinity
    });
    $('span.select2-selection__rendered').attr("title", "");
    $('select').on('change', function() {
      var localData = $(this).find(':selected').data();
      callback(localData.pathwayId, localData.pathwayStage, localData.standard, data.patientId);
    }).on("select2:open", function(e) {
      base.wireUpTooltips();
    });
  },

  formatStandard: function(standard) {
    if (!standard.id) {
      return standard.text;
    }
    var localData = $(standard.element).data();
    // Not relevant
    var standardHtml = '';
    //if diagnosis opportunity then not relevant for other stages
    //if no mention anywhere then not relevant for that disease
    switch (data.getPatientStatus(data.patientId, localData.pathwayId, localData.pathwayStage, localData.standard)) {
      case "ok":
        standardHtml = '<span class="standard-achieved" data-toggle="tooltip" data-placement="left" title="' + data[localData.pathwayId][localData.pathwayStage].standards[localData.standard]["dropdown-tooltip"] + ' - QUALITY INDICATOR ACHIEVED">' + standard.text + ' <i class="fa fa-smile-o" style="color:green"></i></span>';
        break;
      case "missed":
        standardHtml = '<span class="standard-missed" data-toggle="tooltip" data-placement="left" title="' + data[localData.pathwayId][localData.pathwayStage].standards[localData.standard]["dropdown-tooltip"] + ' - IMPROVEMENT OPPORTUNITY EXISTS FOR THIS PATIENT">' + standard.text + ' <i class="fa fa-flag" style="color:red"></i></span>';
        break;
      case "not":
        standardHtml = '<span class="standard-not-relevant" data-toggle="tooltip" data-placement="left" title="' + data[localData.pathwayId][localData.pathwayStage].standards[localData.standard]["dropdown-tooltip"] + ' - STANDARD NOT RELEVANT TO THIS PATIENT">' + standard.text + ' <i class="fa fa-meh-o" style="color:gray"></i></span>';
        break;
    }
    var $standard = $(standardHtml);
    return $standard;
  },

  updateTitle: function(title){
    $('#title-left').html(title);
    $('#title-right').html("");
  },
  /*updateTitle: function(title, tooltip) {
    var titles = title;
    if (typeof title === "string") {
      titles = [{
        title: title,
        tooltip: tooltip
      }];
    }
    var content = titles.map(function(t, idx) {
      return idx === titles.length - 1 ? '<span title="' + t.tooltip + '">' + t.title + '</span>' : '<a href="' + t.url + '" title="' + t.tooltip + '">' + t.title + '</a>';
    }).join(" > ");

    $('.pagetitle').html(content);
  },*/

  hideAllPanels: function() {
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    farLeftPanel.hide();
    farRightPanel.hide();
    topPanel.hide();
  },

  hidePanels: function(panel) {
    panel.children().hide();
  },

  updateTab: function(tab, value, url) {
    var tabElement = $('#mainTab a[data-href="#' + tab + '"]');
    tabElement.html(tabElement.text().split(":")[0] + ":<br><span><strong>" + value + "</strong></span>");
    tabElement.data("href", "#" + tab + "/" + url);
  },

  addFullPage: function(panel) {
    panel.fullpage({ verticalCentered: false, paddingBottom: '80px', scrollBar: true });

    $('.fp-down').off('click').on('click', function() {
      $.fn.fullpage.moveSectionDown();
    });

    $('.fp-up').off('click').on('click', function() {
      $.fn.fullpage.moveSectionUp();
    });
  },

  removeFullPage: function(panel) {
    if (panel.children('.section').length === 0) return;
    if ($.fn.fullpage && $.fn.fullpage.destroy) $.fn.fullpage.destroy('all'); //tidy up before doing it again
  },

  showLoading: function(){
    $('.loading-container').show();
    $('#title-row').hide();
  },

  hideLoading: function(){
    $('.loading-container').fadeOut(1000);
    $('#title-row').fadeIn(1000);
  },

};

module.exports = base;
