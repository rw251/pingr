(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("base.js", function(exports, require, module) {
var data = require('./data'),
  lookup = require('./lookup'),
  chart = require('./chart'),
  log = require('./log'),
  ZeroClipboard = require('zeroclipboard');

var base = {

  //object for keeping track what is in each panel to prevent unnecessary redraws
  panels: {},

  selectTab: function(id) {
    var href = $('#mainTab li.active a').data("href");
    $('#mainTab li.active').removeClass('active').find('a').attr("href", href);
    $('#mainTab li[data-id="' + id + '"]').addClass('active').find('a').removeAttr("href");
  },

  createPanel: function(templateFn, data, templates) {
    //var tempMust = templateSelector.html();
    //Mustache.parse(tempMust); // optional, speeds up future uses
    if (templates) {
      /**for (var o in templates) {
        if (templates.hasOwnProperty(o)) {
          Mustache.parse(templates[o]);
        }
      }*/
    }
    var rendered = templateFn(data); //Mustache.render(tempMust, data, templates);
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
    var tmpl = require("templates/modal-why");

    if (data.reasons && data.reasons.length > 0) data.hasReasons = true;

    $('#modal').html(tmpl(data));

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

  launchSuggestionModal: function() {
    var tmpl = require("templates/modal-suggestion");

    $('#modal').html(tmpl({text: lookup.suggestionModalText}));


    $('#modal .modal').off('submit', 'form').on('submit', 'form', function(e) {

      var suggestion = $('#modal textarea').val();

      var dataToSend = {
        event: {
          what: "suggestion",
          when: new Date().getTime(),
          who: (JSON.parse(localStorage.bb).email || "?"),
          detail: [
            { key: "text", value: suggestion }
          ]
        }
      };

      console.log(dataToSend);

      $.ajax({
        type: "POST",
        url: "http://130.88.250.206:9100/pingr",
        data: JSON.stringify(dataToSend),
        success: function(d) { console.log(d); },
        dataType: "json",
        contentType: "application/json"
      });

      e.preventDefault();
      $('#modal .modal').modal('hide');
    }).modal();
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

  updateTitle: function(title) {
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

  showLoading: function() {
    $('.loading-container').show();
    $('#title-row').hide();
  },

  hideLoading: function() {
    $('.loading-container').fadeOut(1000);
    $('#title-row').fadeIn(1000);
  },

};

module.exports = base;

});

require.register("chart.js", function(exports, require, module) {
var Highcharts = require('highcharts/highstock'),
  data = require('./data'),
  lookup = require('./lookup'),
  log = require('./log'),
  Mustache = require('mustache');

console.log("chart.js: data.lastloader= " + data.lastloader);
data.lastloader = "chart.js";

var cht = {

  destroyCharts: function(charts) {
    for (var i = 0; i < charts.length; i++) {
      if (lookup.charts[charts[i]]) {
        lookup.charts[charts[i]].destroy();
        delete lookup.charts[charts[i]];
      }
    }
  },

  drawTrendChart: function(patientId, pathwayId, pathwayStage, standard) {
    var i, j;
    cht.destroyCharts(['chart-demo-trend']);
    if (!data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]]) {
      $('#chart-demo-trend').html('No data for this patients');
      $('#chart-demo-trend').parent().find('.table-chart-toggle').hide();
      return;
    }

    var chartData = data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]];
    var tableData = [];
    for (i = 1; i < data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]][0].length; i++) {
      tableData.push({
        "item": data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]][1][0],
        "value": data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]][1][i],
        "date": data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]][0][i]
      });
    }
    for (i = 1; i < data[pathwayId][pathwayStage].standards[standard].chart.length; i++) {
      chartData.push(data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[i]][1]); //RW TODO assumption here that all dates are the same
      for (j = 1; j < data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]][0].length; j++) {
        tableData.push({
          "item": data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[i]][1][0],
          "value": data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[i]][1][j],
          "date": data.patients[patientId][data[pathwayId][pathwayStage].standards[standard].chart[0]][0][j]
        });
      }
    }
    var chartOptions = {
      bindto: '#chart-demo-trend',
      data: {
        xs: {},
        classes: {},
        columns: chartData.slice()
      },
      zoom: {
        enabled: true
      },
      line: {
        connectNull: false
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            fit: false,
            format: '%d-%m-%Y',
            count: 5
          },
          max: new Date()
        },
        y: {
          label: {
            text: data[pathwayId][pathwayStage].standards[standard].chartUnits,
            position: 'outer-middle'
          }
        }
      }
    };

    var maxValue = 0;
    var standardItems = [];

    for (i = 1; i < chartOptions.data.columns.length; i++) {
      chartOptions.data.xs[chartOptions.data.columns[i][0]] = "x";
      standardItems.push(chartOptions.data.columns[i][0]);

      for (j = 1; j < chartOptions.data.columns[i].length; j++) {
        if (parseFloat(chartOptions.data.columns[i][j]) > maxValue) maxValue = parseFloat(chartOptions.data.columns[i][j]);
      }
    }

    chartOptions.tooltip = {
      format: {
        value: function(value, ratio, id) {
          var text = standardItems.indexOf(id) > -1 ? value : "";
          return text;
        }
      }
    };

    var lines = null;
    var axisnum = 1;
    if (data.patients[patientId].contacts) {
      for (i = 0; i < data.patients[patientId].contacts.length; i++) {
        chartOptions.data.classes[data.patients[patientId].contacts[i].text] = 'larger';
        if (!chartOptions.data.xs[data.patients[patientId].contacts[i].text]) {
          chartOptions.data.xs[data.patients[patientId].contacts[i].text] = "x" + axisnum;
          chartOptions.data.columns.push(["x" + axisnum, data.patients[patientId].contacts[i].value]);
          chartOptions.data.columns.push([data.patients[patientId].contacts[i].text, (maxValue * 1.1).toString()]);
          axisnum++;
        } else {
          var axis = chartOptions.data.xs[data.patients[patientId].contacts[i].text];
          for (j = 1; j < chartOptions.data.columns.length; j++) {
            if (chartOptions.data.columns[j][0] === axis) {
              chartOptions.data.columns[j].push(data.patients[patientId].contacts[i].value);
            } else if (chartOptions.data.columns[j][0] === data.patients[patientId].contacts[i].text) {
              chartOptions.data.columns[j].push((maxValue * 1.1).toString());
            }
          }
        }
        tableData.push({
          "item": "Event",
          "value": data.patients[patientId].contacts[i].text,
          "date": data.patients[patientId].contacts[i].value
        });
      }
    }

    var patientEvents = log.getEvents().filter(function(val) {
      return val.id === patientId;
    });
    if (patientEvents.length > 0) {

      for (i = 0; i < patientEvents.length; i++) {
        chartOptions.data.classes[patientEvents[i].name] = 'larger';
        if (!chartOptions.data.xs[patientEvents[i].name]) {
          chartOptions.data.xs[patientEvents[i].name] = "x" + axisnum;
          chartOptions.data.columns.push(["x" + axisnum, patientEvents[i].date.substr(0, 10)]);
          chartOptions.data.columns.push([patientEvents[i].name, (maxValue * 1.1).toString()]);
          axisnum++;
        } else {
          var axis2 = chartOptions.data.xs[patientEvents[i].name];
          for (j = 1; j < chartOptions.data.columns.length; j++) {
            if (chartOptions.data.columns[j][0] === axis2) {
              chartOptions.data.columns[j].push(patientEvents[i].date.substr(0, 10));
            } else if (chartOptions.data.columns[j][0] === patientEvents[i].name) {
              chartOptions.data.columns[j].push((maxValue * 1.1).toString());
            }
          }
        }
        tableData.push({
          "item": "Event",
          "value": patientEvents[i].name,
          "date": patientEvents[i].date.substr(0, 10)
        });
      }
    }

    tableData.sort(function(a, b) {
      if (a.date === b.date) return 0;
      else return a.date < b.date ? 1 : -1;
    });
    //draw Table
    $('#table-demo-trend').html(Mustache.render($('#value-trend-panel-table').html(), {
      "items": tableData
    }, {
      "item-row": $('#value-trend-panel-table-row').html()
    }));

    //draw charts in separate thread and with delay to stop sluggish appearance
    setTimeout(function() {
      lookup.charts['chart-demo-trend'] = c3.generate(chartOptions);
    }, 1);
  },

  selectPieSlice: function(chart, d) {
    lookup.chartClicked = true;
    $('#' + chart + ' path.c3-bar').attr('class', function(index, classNames) {
      return classNames + ' _unselected_';
    });
    lookup.charts[chart].select([d.id], [d.index], true);

    farRightPanel.fadeOut(200, function() {
      var template = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(template)).show();
    });
  },

  drawOverviewChart: function(pathwayId, pathwayStage, enableHover) {
    cht.destroyCharts([pathwayStage + '-chart']);
    setTimeout(function() {
      lookup.charts[pathwayStage + '-chart'] = c3.generate({
        bindto: '#' + pathwayStage + '-chart',
        data: {
          x: 'x',
          columns: data[pathwayId][pathwayStage].trend
        },
        zoom: {
          enabled: true
        },
        tooltip: {
          format: {
            title: function(x) {
              return x.toDateString() + (enableHover ? '<br>Click for more detail' : '');
            },
            value: function(value) {
              return enableHover ? value + '%' : undefined;
            }
          }
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%d-%m-%Y',
              count: 7,
              culling: {
                max: 4
              }
            },
            label: {
              text: 'Date',
              position: 'outer-center'
            }
          },
          y: {
            min: 0,
            label: {
              text: 'Proportion (%)',
              position: 'outer-middle'
            }
          }
        },
        point: {
          show: false
        },
        size: {
          height: null
        }
      });
    }, 1);
  },

  drawBenchmarkChart: function(element, data) {
    cht.destroyCharts([element + '-chart']);
    setTimeout(function() {
      lookup.charts[element + '-chart'] = c3.generate({
        bindto: '#' + element,
        size: {
          height: 200
        },
        data: data,
        axis: {
          x: {
            type: 'category',
            tick: {
              rotate: 60,
              multiline: false
            }
          },
          y: {
            label: {
              text: '% of patients meeting the target',
              position: 'outer-middle'
            }
          }
        },
        grid: {
          y: {
            show: true
          }
        }
      });
    }, 1);
  },

  drawPerformanceTrendChart: function(element, data) {
    cht.destroyCharts([element + '-chart']);
    setTimeout(function() {
      lookup.charts[element + '-chart'] = c3.generate({
        bindto: '#' + element,
        size: {
          height: 200
        },
        data: data,
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%Y-%m-%d',
              rotate: 60,
              multiline: false
            },
            height: 60
          },
          y: {
            label: {
              text: "Performance",
              position: 'outer-middle'
            }
          }
        },
        grid: {
          x: {
            show: true
          },
          y: {
            show: true
          }
        }
      });
    }, 1);
  },

  drawBenchmarkChartHC: function(element, data) {

    data = [
      { x: 49.9, p: 'P1', local: true },
      { x: 71.5, p: 'P2', local: true },
      { x: 16.4, p: 'P3', local: true },
      { x: 29.2, p: 'P4', local: true },
      { x: 44.0, p: 'P5', local: true },
      { x: 76.0, p: 'P6', local: true },
      { x: 35.6, p: 'YOU', local: true },
      { x: 48.5, p: 'P7', local: true },
      { x: 26.4, p: 'P8', local: true },
      { x: 94.1, p: 'P9', local: true },
      { x: 95.6, p: 'P10' },
      { x: 54.0, p: 'P11' },
      { x: 39.9, p: 'P12' },
      { x: 61.5, p: 'P13' },
      { x: 6.4, p: 'P14' },
      { x: 19.2, p: 'P15' },
      { x: 34.0, p: 'P16' },
      { x: 66.0, p: 'P17' },
      { x: 25.6, p: 'P18' },
      { x: 38.5, p: 'P19' },
      { x: 36.4, p: 'P20' },
      { x: 84.1, p: 'P21' },
      { x: 85.6, p: 'P22' },
      { x: 64.0, p: 'P23' }
    ];
    data.sort(function(a, b) {
      return a.x - b.x;
    });

    var local = true;
    var bChart = $('#' + element).highcharts({
        chart: {
          type: 'column',
          events: {
            load: function() {
              var thisChart = this;
              thisChart.renderer.button('Toggle neighbourhood / CCG', thisChart.plotWidth - 100, 0, function() {
                local = !local;
                thisChart.xAxis[0].categories = data.filter(function(v) {
                  if (local) return v.local;
                  else return true;
                }).map(function(v) {
                  return v.p;
                });
                thisChart.series[0].setData(data.filter(function(v) {
                  if (local) return v.local;
                  else return true;
                }).map(function(v) {
                  if (v.p === "YOU") return { y: v.x, color: "red" };
                  else return v.x;
                }));
              }).add();
            }
          }
        },
        title: { text: 'Benchmark' },
        xAxis: {
          categories: data.filter(function(v) {
            return v.local === local;
          }).map(function(v) {
            return v.p;
          }),
          crosshair: true
        },
        yAxis: {
          min: 0,
          max: 100,
          title: { text: '% patients meeting target' }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">Practice: <b>{point.key}</b></span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        legend: {
          enabled: false
        },
        series: [{
          name: 'Performance',
          data: data.filter(function(v) {
            return v.local === local;
          }).map(function(v) {
            if (v.p === "YOU") return { y: v.x, color: "red" };
            else return v.x;
          })
      }]
      },
      function(chart) { // on complete
        var textX = chart.plotLeft + (chart.plotWidth * 0.5);
        var textY = chart.plotTop + (chart.plotHeight * 0.5);

        var span = '<span id="pieChartInfoText" style="position:absolute; text-align:center;-ms-transform: rotate(335deg);-webkit-transform: rotate(335deg);transform: rotate(335deg);">';
        span += '<span style="font-size: 64px">Coming Soon!</span>';
        span += '</span>';

        $("#benchmark-chart").append(span);
        span = $('#pieChartInfoText');
        span.css('left', textX + (span.width() * -0.5));
        span.css('top', textY + (span.height() * -0.5));
      });

  },

  drawPerformanceTrendChartHC: function(element, data) {

    /// data is
    // {
    //  "values":
    //    ["x", "2015-08-24", "2015-08-23",...
    //    ["numerator", 35, 37, 33, 32, 31,...
    //    ["denominator", 135, 133, 133, 13,...
    //    ["target", 0.3, 0.3, 0...
    // }

    var target = 75,
      maxValue = target,
      maxXvalue = 0;

    var series = [
      { type: 'line', name: 'Trend', data: [] },
      { type: 'line', name: 'Prediction', data: [], dashStyle: 'dot' }
    ];

    var today = new Date();
    var lastApril = new Date();
    var aprilBeforeThat = new Date();
    var nextApril = new Date();
    if (today.getMonth() < 3) {
      //after april
      lastApril.setYear(today.getFullYear() - 1);
      aprilBeforeThat.setYear(today.getFullYear() - 1);
    } else {
      nextApril.setYear(today.getFullYear() + 1);
    }
    aprilBeforeThat.setYear(aprilBeforeThat.getFullYear() - 1);
    lastApril.setMonth(3);
    aprilBeforeThat.setMonth(3);
    nextApril.setMonth(3);
    lastApril.setDate(1);
    aprilBeforeThat.setDate(1);
    nextApril.setDate(1);

    var n = 0,
      sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0,
      sumYY = 0,
      intercept, gradient, compDate;

    if (data.values[0].filter(function(v) {
        return new Date(v).getTime() > lastApril.getTime();
      }).length > 2) compDate = new Date(lastApril.getTime());
    else compDate = new Date(aprilBeforeThat.getTime());

    data.values[0].forEach(function(v, i) {
      if (i === 0) return;
      var time = new Date(v).getTime();
      var y = +data.values[1][i] * 100 / +data.values[2][i];
      if (time >= compDate.getTime()) {
        n++;
        sumX += time;
        sumY += y;
        sumXY += time * y;
        sumXX += time * time;
        sumYY += y * y;
      }
      series[0].data.push([time, y]);
      maxValue = Math.max(maxValue, y);
      maxXvalue = Math.max(maxXvalue, time);
    });

    intercept = (sumY * sumXX - sumX * sumXY) / (n * sumXX - sumX * sumX);
    gradient = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    var newCompDate = new Date(lastApril.getTime());
    series[1].data.push([maxXvalue, maxXvalue * gradient + intercept]);
    var newCompDate = new Date(lastApril.getTime());
    for (var i = 0; i < 13; i++) {
      var x = newCompDate.getTime();
      if (x < maxXvalue) {
        newCompDate.setMonth(newCompDate.getMonth() + 1);
        continue;
      }
      series[1].data.push([x, x * gradient + intercept]);
      var m = newCompDate.getMonth();
      newCompDate.setMonth(newCompDate.getMonth() + 1);
    }

    //Add line of best fit for latest data since april to next april


    //Default to last april - april


    var c = $('#' + element).highcharts({
      title: { text: '' },
      xAxis: {
        max: nextApril.getTime(),
        type: 'datetime'
      },
      yAxis: {
        title: { text: 'Quality standard performance' },
        max: maxValue + 5,
        min: 0,
        plotLines: [{
          value: target,
          color: 'green',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Target - ' + (target) + '%'
          },
        }]
      },
      legend: { enabled: true },
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:.2f}%</b><br/>'
      },

      navigator: {
        enabled: true
      },

      series: series
    });

    c.highcharts().axes[0].setExtremes(aprilBeforeThat.getTime(), lastApril.getTime(), undefined, false);

  },

  drawAnalytics: function(element, data, selectSeriesFn) {

    cht.cloneToolTip = null;
    cht.cloneToolTip2 = null;

    $('#' + element).highcharts({
      chart: {
        type: "column",
        backgroundColor: "#F3F9F9",
        height: 200,
        events: {
          click: function(event) {
            selectSeriesFn();

            /*if (cht.cloneToolTip) {
              this.container.firstChild.removeChild(cht.cloneToolTip);
              cht.cloneToolTip = null;
            }
            if (cht.cloneToolTip2) {
              cht.cloneToolTip2.remove();
              cht.cloneToolTip2 = null;
            }*/

            return false;
          }
        }
      },
      title: {
        text: 'Patients with improvement opportunities'
      },
      subtitle: {
        text: document.ontouchstart === undefined ?
          'Click a column to filter the patient list' : 'Tap a column to filter the patient list'
      },
      xAxis: {
        categories: data.map(function(v, i) {
          return v[0];
        })
      },
      yAxis: {
        title: {
          text: 'Number of patients'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        }
      },
      legend: {
        enabled: false
      },

      tooltip: {
        animation: false,

        formatter: function() {
          return this.point.desc.replace(/<a[^h]+href=[\"'].*?[\"'][^h]*>(.*?)<\/a>/,"$1").match(/.{1,40}[^ ]* ?/g).join("<br>");
        },

        style: {
          "whiteSpace": "normal"
        },

        useHTML: true
      },

      plotOptions: {

        column: {
          dataLabels: {
            enabled: true,
            color: 'black'
          }
        },

        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function(event) {
                var numPoints = this.series.points.length;

                selectSeriesFn(this.category);

                /*if (cht.cloneToolTip) {
                  this.series.chart.container.firstChild.removeChild(cht.cloneToolTip);
                }
                if (cht.cloneToolTip2) {
                  cht.cloneToolTip2.remove();
                }
                cht.cloneToolTip = this.series.chart.tooltip.label.element.cloneNode(true);
                this.series.chart.container.firstChild.appendChild(cht.cloneToolTip);

                cht.cloneToolTip2 = $('.highcharts-tooltip').clone();
                $(this.series.chart.container).append(cht.cloneToolTip2);*/

                return false;
              }
            }
          }
        }
      },

      series: [{
        data: data.map(function(v, i) {
          return {
            y: v[2],
            desc: v[1],
            color: Highcharts.getOptions().colors[i]
          };
        })
      }]
    });
  }

};

module.exports = cht;

});

require.register("data.js", function(exports, require, module) {
var Highcharts = require('highcharts/highstock'),
  log = require('./log'),
  lookup = require('./lookup');

var _getFakePatientData = function(patient, callback) {
  var r = Math.random(),
    isAsync = typeof(callback) === "function";
  if (dt.patients && dt.patients.patient) {
    if (isAsync) return callback(dt.patients.patient);
    else return dt.patients.patient;
  }
  $.ajax({
    url: "data/patient.json?v=" + r,
    async: isAsync,
    success: function(file) {
      if (!dt.patients) dt.patients = {};
      dt.patients.patient = file;
      dt.patients[patient] = file;

      if (isAsync) callback(dt.patients.patient);
    }
  });
  if (!isAsync) return dt.patients.patient;
};

var _getPatientData = function(patient, callback) {
  //if callback provided do async - else do sync
  var r = Math.random(),
    isAsync = typeof(callback) === "function";

  if (dt.patients && dt.patients[patient]) {
    if (isAsync) return callback(dt.patients[patient]);
    else return dt.patients[patient];
  }

  $.ajax({
    url: "data/" + patient + ".json?v=" + r,
    async: isAsync,
    success: function(file) {
      if (!dt.patients) dt.patients = {};
      dt.patients[patient] = file;

      if (isAsync) callback(dt.patients[patient]);
    },
    error: function() {
      if (dt.patients.patient && isAsync) {
        dt.patients[patient] = dt.patients.patient;
        return callback(dt.patients.patient);
      } else if (!dt.patients.patient) {
        _getFakePatientData(patient, callback);
      }
    }
  });

  if (!isAsync) return dt.patients.patient;
};

var dt = {

  pathwayNames: {},
  diseases: [],
  options: [],
  patLookup: {},

  getPatietListForStandard: function(pathwayId, pathwayStage, standard) {
    var patients = dt.removeDuplicates(dt[pathwayId][pathwayStage].standards[standard].opportunities.reduce(function(a, b) {
      return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
    }));
    return patients;
  },

  getPatientStatus: function(patientId, pathwayId, pathwayStage, standard) {
    if (dt.patients[patientId].breach) {
      if (dt.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard;
        }).length > 0) {
        return "missed";
      } else if (dt.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId && val.pathwayStage === "diagnosis";
        }).length > 0 && pathwayStage !== "diagnosis") {
        return "not";
      } else if (dt.patients[patientId].breach.filter(function(val) {
          return val.pathwayId === pathwayId;
        }).length > 0) {
        return "ok";
      } else {
        return "not";
      }
    } else {
      return "not";
    }
  },

  getNumeratorForStandard: function(pathwayId, pathwayStage, standard) {
    var patients = dt.getPatietListForStandard(pathwayId, pathwayStage, standard);
    return patients.length;
  },

  getDenominatorForStandard: function(pathwayId, pathwayStage) {
    var patients = dt[pathwayId][pathwayStage].patientsOk;
    for (var standard in dt[pathwayId][pathwayStage].standards) {
      var newPatients = dt.getPatietListForStandard(pathwayId, pathwayStage, standard);
      patients = patients.concat(newPatients);
    }
    return dt.removeDuplicates(patients).length;
  },

  removeDuplicates: function(array) {
    var arrResult = {};
    var rtn = [];
    for (var i = 0; i < array.length; i++) {
      arrResult[array[i]] = array[i];
    }
    for (var item in arrResult) {
      rtn.push(arrResult[item]);
    }
    return rtn;
  },

  numberOfStandardsMissed: function(patientId) {
    if (!dt.patients[patientId].breach) return 0;
    var a = dt.patients[patientId].breach.map(function(val) {
      return val.pathwayId + val.pathwayStage + val.standard;
    });
    var obj = {};
    for (var i = 0; i < a.length; i++) {
      obj[a[i]] = "";
    }
    return Object.keys(obj).length;
  },

  getAllPatients: function() {
    var pList = [],
      i, k, prop;
    for (k = 0; k < dt.diseases.length; k++) {
      for (i in lookup.categories) {
        for (prop in dt[dt.diseases[k].id][i].bdown) {
          if (dt[dt.diseases[k].id][i].bdown.hasOwnProperty(prop)) {
            pList = pList.concat(dt[dt.diseases[k].id][i].bdown[prop].patients);
          }
        }
        pList = pList.concat(dt[dt.diseases[k].id][i].patientsOk);
      }
    }
    pList = dt.removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
      var ret = dt.patients[patientId];
      ret.nhsNumber = dt.patLookup ? dt.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(dt.numberOfStandardsMissed(patientId));
      return ret;
    });

    return patients;
  },

  get: function(callback, json) {
    //get text
    $.getJSON("data/text.json?v=" + Math.random(), function(textfile) {
      dt.text = textfile.pathways;

      if (json) {
        dt.newload(json);
        if (typeof callback === 'function') callback();
      } else {
        $.getJSON("data/data.json?v=" + Math.random(), function(file) {
          dt.newload(file);
          if (typeof callback === 'function') callback();
        }).fail(function(err) {
          alert("data/data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
        });
      }

    }).fail(function(err) {
      alert("data/text.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
    });
  },

  newload: function(file) {
    dt.indicators = file.indicators;
    dt.pathwayNames = {};

    if (file.text) dt.text = file.text;

    dt.indicators.forEach(function(indicator) {
      var last = indicator.values[0].length - 1;
      var pathwayId = indicator.id.split(".")[0];
      var pathwayStage = indicator.id.split(".")[1];
      var standard = indicator.id.split(".")[2];
      if (!dt.pathwayNames[pathwayId]) dt.pathwayNames[pathwayId] = "";
      var percentage = Math.round(100 * indicator.values[1][last] * 100 / indicator.values[2][last]) / 100;
      indicator.performance = {
        fraction: indicator.values[1][last] + "/" + indicator.values[2][last],
        percentage: percentage
      };
      indicator.benchmark = "90%"; //TODO magic number
      indicator.target = indicator.values[3][last] * 100 + "%";
      indicator.up = percentage > Math.round(100 * indicator.values[1][last - 1] * 100 / indicator.values[2][last - 1]) / 100;
      var trend = indicator.values[1].map(function(val, idx) {
        return Math.round(100 * val * 100 / indicator.values[2][idx]) / 100;
      }).slice(Math.max(1, last - 10), Math.max(1, last - 10) + 11);
      //trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].slice(Math.max(1, last - 10), Math.max(1, last - 10) + 11);
      //dates.reverse();
      indicator.dates = dates;
      if (dt.text.pathways[pathwayId] && dt.text.pathways[pathwayId][pathwayStage] && dt.text.pathways[pathwayId][pathwayStage].standards[standard]) {
        indicator.description = dt.text.pathways[pathwayId][pathwayStage].standards[standard].description;
        indicator.tagline = dt.text.pathways[pathwayId][pathwayStage].standards[standard].tagline;
        indicator.positiveMessage = dt.text.pathways[pathwayId][pathwayStage].standards[standard].positiveMessage;
      } else {
        indicator.description = "No description specified";
        indicator.tagline = "";
      }
      indicator.aboveTarget = indicator.performance.percentage > +indicator.values[3][last] * 100;

      dt.indicators[indicator.id] = { performance: indicator.performance, tagline: indicator.tagline, positiveMessage: indicator.positiveMessage, target: indicator.target, "opportunities": indicator.opportunities || [], "patients": {} };

      //apply which categories people belong to
      dt.patients = {};
      dt.patientArray = [];

      Object.keys(file.patients).forEach(function(patient) {
        dt.patientArray.push(patient);
        dt.patients[patient] = file.patients[patient];
        dt.indicators[indicator.id].patients[patient] = {};
        dt.indicators[indicator.id].patients[patient].opportunities = [];
        dt.indicators[indicator.id].opportunities.forEach(function(opp, idx) {
          if (opp.patients.indexOf(+patient) > -1) {
            dt.indicators[indicator.id].patients[patient].opportunities.push(idx);
          }
        });
      });
    });


  },

  load: function(file) {
    var d = "",
      j, k, key, data = file.diseases;

    dt = jQuery.extend(dt, data); //copy

    dt.patients = file.patients;
    dt.codes = file.codes;
    dt.patientArray = [];
    for (var o in file.patients) {
      if (file.patients.hasOwnProperty(o)) {
        dt.patientArray.push(o);
      }
    }

    for (d in data) {
      dt.pathwayNames[d] = data[d]["display-name"];
      var diseaseObject = {
        "id": d,
        "link": data[d].link ? data[d].link : "dt/" + d,
        "faIcon": data[d].icon,
        "name": data[d]["display-name"],
        "text": {
          "dt": {
            "tooltip": data[d]["side-panel-tooltip"]
          }
        }
      };
      if (data[d].monitoring.text) {
        diseaseObject.text.monitoring = data[d].monitoring.text.sidePanel;
      }
      if (data[d].treatment.text) {
        diseaseObject.text.treatment = data[d].treatment.text.sidePanel;
      }
      if (data[d].diagnosis.text) {
        diseaseObject.text.diagnosis = data[d].diagnosis.text.sidePanel;
      }
      if (data[d].exclusions.text) {
        diseaseObject.text.exclusions = data[d].exclusions.text.sidePanel;
      }
      this.diseases.push(diseaseObject);
      dt[d].suggestions = log.plan[d].team;
      $.extend(dt[d].monitoring, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(dt[d].treatment, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(dt[d].diagnosis, {
        "breakdown": [],
        "bdown": {}
      });
      $.extend(dt[d].exclusions, {
        "breakdown": [],
        "bdown": {}
      });

      if (!dt[d].monitoring.header) continue;
      for (key in dt[d].monitoring.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "monitoring",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Monitoring" + ' - ' + dt[d].monitoring.standards[key].tab.title
        });
        for (j = 0; j < dt[d].monitoring.standards[key].opportunities.length; j++) {
          dt[d].monitoring.bdown[dt[d].monitoring.standards[key].opportunities[j].name] = dt[d].monitoring.standards[key].opportunities[j];
          dt[d].monitoring.bdown[dt[d].monitoring.standards[key].opportunities[j].name].suggestions = log.plan[d].monitoring.individual[dt[d].monitoring.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].monitoring.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].monitoring.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].monitoring.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].monitoring.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "monitoring",
              "standard": key,
              "subsection": dt[d].monitoring.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in dt[d].diagnosis.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "diagnosis",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Diagnosis" + ' - ' + dt[d].diagnosis.standards[key].tab.title
        });
        for (j = 0; j < dt[d].diagnosis.standards[key].opportunities.length; j++) {
          dt[d].diagnosis.bdown[dt[d].diagnosis.standards[key].opportunities[j].name] = dt[d].diagnosis.standards[key].opportunities[j];
          dt[d].diagnosis.bdown[dt[d].diagnosis.standards[key].opportunities[j].name].suggestions = log.plan[d].diagnosis.individual[dt[d].diagnosis.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].diagnosis.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].diagnosis.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].diagnosis.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].diagnosis.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "diagnosis",
              "standard": key,
              "subsection": dt[d].diagnosis.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in dt[d].treatment.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "treatment",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Treatment" + ' - ' + dt[d].treatment.standards[key].tab.title
        });
        for (j = 0; j < dt[d].treatment.standards[key].opportunities.length; j++) {
          dt[d].treatment.bdown[dt[d].treatment.standards[key].opportunities[j].name] = dt[d].treatment.standards[key].opportunities[j];
          dt[d].treatment.bdown[dt[d].treatment.standards[key].opportunities[j].name].suggestions = log.plan[d].treatment.individual[dt[d].treatment.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].treatment.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].treatment.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].treatment.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].treatment.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "treatment",
              "standard": key,
              "subsection": dt[d].treatment.standards[key].opportunities[j].name
            });
          }
        }
      }
      for (key in dt[d].exclusions.standards) {
        this.options.push({
          "value": this.options.length,
          "pathwayId": d,
          "pathwayStage": "exclusions",
          "standard": key,
          "text": this.pathwayNames[d] + ' - ' + "Exclusions" + ' - ' + dt[d].exclusions.standards[key].tab.title
        });
        for (j = 0; j < dt[d].exclusions.standards[key].opportunities.length; j++) {
          dt[d].exclusions.bdown[dt[d].exclusions.standards[key].opportunities[j].name] = dt[d].exclusions.standards[key].opportunities[j];
          dt[d].exclusions.bdown[dt[d].exclusions.standards[key].opportunities[j].name].suggestions = log.plan[d].exclusions.individual[dt[d].exclusions.standards[key].opportunities[j].name];
          for (k = 0; k < dt[d].exclusions.standards[key].opportunities[j].patients.length; k++) {
            if (!dt.patients[dt[d].exclusions.standards[key].opportunities[j].patients[k]].breach) dt.patients[dt[d].exclusions.standards[key].opportunities[j].patients[k]].breach = [];
            dt.patients[dt[d].exclusions.standards[key].opportunities[j].patients[k]].breach.push({
              "pathwayId": d,
              "pathwayStage": "exclusions",
              "standard": key,
              "subsection": dt[d].exclusions.standards[key].opportunities[j].name
            });
          }
        }
      }
    }
  },

  getAllIndicatorData: function(practiceId, callback) {
    if (dt.indicators) {
      return callback(dt.indicators);
    } else {
      return callback(null);
    }
  },

  getAllIndicatorDataSync: function(practiceId) {
    if (dt.indicators) {
      return dt.indicators;
    } else {
      return null;
    }
  },

  getTrendData: function(practiceId, pathwayId, pathwayStage, standard) {
    if (dt.indicators) {
      return dt.indicators.filter(function(v) {
        return v.id === [pathwayId, pathwayStage, standard].join(".");
      })[0];
    }
    return null;
  },

  getIndicatorData: function(practiceId, indicator, callback) {
    if (dt.indicators && dt.indicators[indicator]) {
      return callback(dt.indicators[indicator]);
    }
  },

  getIndicatorDataSync: function(practiceId, indicator) {
    dt.getAllIndicatorDataSync(practiceId);
    if (dt.indicators[indicator]) {
      return dt.indicators[indicator];
    }
  },

  getPatientList: function(practiceId, pathwayId, pathwayStage, standard, subsection, callback) {
    var indicatorId = [pathwayId, pathwayStage, standard].join(".");
    if (!subsection) subsection = "all";
    if (!dt.patientList) dt.patientList = {};
    if (!dt.patientList[practiceId]) dt.patientList[practiceId] = {};
    if (!dt.patientList[practiceId][indicatorId]) dt.patientList[practiceId][indicatorId] = {};

    if (dt.patientList[practiceId][indicatorId][subsection]) {
      return callback(dt.patientList[practiceId][indicatorId][subsection]);
    } else {
      var i, k, prop, pList, header;

      if (subsection !== "all") {
        pList = dt.indicators[indicatorId].opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].patients;
        header = dt.indicators[indicatorId].opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].description;
      } else {
        pList = dt.indicators[indicatorId].opportunities.reduce(function(a, b) {
          return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
        });
        header = dt.text.pathways[pathwayId][pathwayStage].standards[standard].tableTitle;
      }

      pList = dt.removeDuplicates(pList);
      var vId = dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueId;
      var dOv = dt.text.pathways[pathwayId][pathwayStage].standards[standard].dateORvalue;
      var patients = pList.map(function(patientId) {
        var ret = dt.indicators[indicatorId].patients[patientId];
        ret.nhsNumber = dt.patLookup[patientId] || patientId;
        ret.patientId = patientId;
        ret.items = [dt.patients[patientId].characteristics.age]; //The fields in the patient list table

        var measures = dt.patients[patientId].measurements.filter(function(v) {
          return v.id === vId;
        });

        if (measures[0] && measures[0].data) {
          if (dOv === "date") {
            ret.items.push(new Date(measures[0].data[measures[0].data.length - 1][0]));
          } else {
            ret.items.push(measures[0].data[measures[0].data.length - 1][1]);
          }
        } else {
          ret.items.push("?");
        }
        ret.items.push(dt.indicators[indicatorId].patients[patientId].opportunities.map(function(v) {
          return '<span style="width:13px;height:13px;float:left;background-color:' + Highcharts.getOptions().colors[v] + '"></span>';
        }).join(""));
        //ret.items.push(data.numberOfStandardsMissed(patientId));
        return ret;
      });

      var rtn = {
        "patients": patients,
        "n": patients.length,
        "header": header,
        "header-items": [{
          "title": "NHS no.",
          "isSorted": false,
          "direction": "sort-asc",
          "tooltip": "NHS number of each patient"
        }, {
          "title": "Age",
          "isSorted": false,
          "direction": "sort-asc",
          "tooltip": "The age of the patient"
        }]
      };

      //middle column is either value or date
      if (dOv) {
        rtn["header-items"].push({
          "title": dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueName,
          "tooltip": dOv === "date" ? "Last date " + vId + " was measured" : "Last " + vId + " reading",
          "isSorted": false,
          "direction": "sort-asc"
        });
      } else {
        if (pathwayStage === lookup.categories.monitoring.name) {
          rtn["header-items"].push({
            "title": "Last BP Date",
            "isSorted": false,
            "direction": "sort-asc",
            "tooltip": "Last date BP was measured"
          });
        } else {
          rtn["header-items"].push({
            "title": "Last SBP",
            "tooltip": "Last systolic BP reading",
            "isSorted": false,
            "direction": "sort-asc"
          });
        }
      }

      //add qual standard column
      rtn["header-items"].push({
        "title": "Improvement opportunities",
        "titleHTML": 'Improvement opportunities',
        "isSorted": true,
        "tooltip": "Improvement opportunities from the bar chart above"
      });

      dt.patientList[practiceId][indicatorId][subsection] = rtn;
      return callback(rtn);
    }
  },

  getPatientData: function(patientId, callback) {
    return _getPatientData(patientId, callback);
  }

};

module.exports = dt;

});

require.register("layout.js", function(exports, require, module) {
var data = require('./data'),
Mustache = require('mustache');

var layout = {

  elements: {},

  //Side panel, navigation, header bar and main page
  showMainView: function() {
    //Set up navigation panel
    ////layout.showSidePanel();
    ////layout.showNavigation(data.diseases, idx, $('#main-dashboard'));

    $('#bottomnavbar').hide();
    layout.showHeaderBarItems();

    //Show main dashboard page
    layout.showPage('main-dashboard');
  },

  clearNavigation: function() {
    $("aside.left-panel nav.navigation > ul > li > ul").slideUp(300);
    $("aside.left-panel nav.navigation > ul > li").removeClass('active');
  },

  showNavigation: function(list, idx, parent) {
    if (layout.elements.navigation) {

      if (idx === -1) {
        layout.clearNavigation();
        $('aside a[href="#welcome"]:first').closest('li').addClass('active');
      } else if (idx >= list.length) {
        layout.clearNavigation();
        $('aside a[href="#patients"]').closest('li').addClass('active');
      } else if (!$('aside a[href="#' + list[idx].link + '"]:first').closest('li').hasClass('active')) {
        layout.clearNavigation();
        //set active
        $('aside a[href="#' + list[idx].link + '"]').next().slideToggle(300);
        $('aside a[href="#' + list[idx].link + '"]').closest('li').addClass('active');
      }

      return;
    }

    var tempMust = $('#pathway-picker').html();
    var itemTemplate = $('#pathway-picker-item').html();
    Mustache.parse(tempMust);
    Mustache.parse(itemTemplate);

    list = list.slice();
    list[0].isBreakAbovePractice = true;
    for (var i = 0; i < list.length; i++) {
      list[i].hasSubItems = true;
    }
    list.unshift({
      "link": "welcome",
      "faIcon": "fa-home",
      "name": "Agreed actions",
      "isBreakAboveHome": true,
      "text": {
        "main": {
          "tooltip": "Agreed tooltip - edit in script.js"
        }
      }
    });
    list.push({
      "link": "patients",
      "faIcon": "fa-users",
      "name": "All Patients",
      "isBreakAbovePatient": true,
      "text": {
        "main": {
          "tooltip": "All patients tooltip - edit in script.js"
        }
      }
    });

    list.map(function(v, i, arr) {
      v.isSelected = i === idx + 1;
      return v;
    });

    var renderedBefore = Mustache.render(tempMust, {
      "items": list
    }, {
      "item": itemTemplate,
      "subItem": $('#pathway-picker-sub-item').html()
    });
    $('#aside-toggle nav:first').html(renderedBefore);

    $('.user').on('click', function() {
      template.loadContent('#agreedactions');
    });

    layout.elements.navigation = true;
  },

  showPage: function(page) {
    if (layout.page === page) return;
    layout.page = page;
    $('.page').hide();
    $('#' + page).show();

    if (page !== 'main-dashboard') {
      ////layout.hideSidePanel();
      $('#bottomnavbar').show();
      layout.hideHeaderBarItems();
    }
  },

  showSidePanel: function() {
    if (layout.elements.navigtion) return;
    layout.elements.navigtion = true;
    $('#main').addClass('content');
    $('#topnavbar').addClass('full');
    $('#aside-toggle').show();
    $('#bottomnavbar').hide();
  },

  hideSidePanel: function() {
    if (layout.elements.navigtion === false) return;
    layout.elements.navigtion = false;
    $('#main').removeClass('content');
    $('#topnavbar').removeClass('full');
    $('#aside-toggle').hide();
    $('#bottomnavbar').show();
  },

  showHeaderBarItems: function() {
    if (layout.elements.headerbar) return;
    layout.elements.headerbar = true;
    $('.hide-if-logged-out').show();
  },

  hideHeaderBarItems: function() {
    if (layout.elements.headerbar === false) return;
    layout.elements.headerbar = false;
    $('.hide-if-logged-out').hide();
  }

};

module.exports = layout;

});

require.register("log.js", function(exports, require, module) {
var notify = require('./notify');

var log = {
  reason: {},

  getObj: function(options) {
    var obj = JSON.parse(localStorage.bb);

    if (options && options.length > 0) {
      options.forEach(function(opt) {
        if (!obj[opt.name]) {
          obj[opt.name] = opt.value;
          log.setObj(obj);
        }
      });
    }

    return obj;
  },

  setObj: function(obj) {
    localStorage.bb = JSON.stringify(obj);
  },

  loadActions: function(callback) {
    var r = Math.random();
    log.plan = [];
    log.text = [];
    callback();
    /*$.getJSON("action-plan.json?v=" + r, function(file) {
      log.plan = file.diseases;
      log.text = file.plans;
      callback();
    });*/
  },

  editAction: function(id, actionId, agree, done, reason) {
    var logText, obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    if (!id) alert("ACTION TEAM/IND ID");
    if (!actionId) alert("ACTION ID");

    if (!obj.actions[id]) {
      obj.actions[id] = {};
    }

    var dataToSend = {
      event: {
        what: "agree",
        when: new Date().getTime(),
        who: JSON.parse(localStorage.bb).email,
        detail: [
          { key: "patient", "value": id },
          { key: "action", "value": actionId }
          ]
      }
    };

    if (agree) {
      logText = "You agreed with this suggested action on " + (new Date()).toDateString();
    } else if (agree === false) {
      var reasonText = log.reason.reason === "" && log.reason.reasonText === "" ? " - no reason given" : " . You disagreed because you said: '" + log.reason.reason + "; " + log.reason.reasonText + ".'";
      logText = "You disagreed with this action on " + (new Date()).toDateString() + reasonText;

      dataToSend.event.whate = "disagree";
      if (reason && reason.reason) dataToSend.event.detail.push({ key: "reason", value: reason.reason });
      if (reason && reason.reasonText) dataToSend.event.detail.push({ key: "reasonText", value: reason.reasonText });
    }

    if (agree || agree === false) {
      console.log(dataToSend);
      $.ajax({
        type: "POST",
        url: "http://130.88.250.206:9100/pingr",
        data: JSON.stringify(dataToSend),
        success: function(d) { console.log(d); },
        dataType: "json",
        contentType: "application/json"
      });
    }

    if (done) {
      logText = "You agreed with this suggested action on " + (new Date()).toDateString();
    }

    if (!obj.actions[id][actionId]) {
      obj.actions[id][actionId] = {
        "agree": agree ? agree : false,
        "done": done ? done : false,
        "history": [logText]
      };
    } else {
      if (agree === true || agree === false) obj.actions[id][actionId].agree = agree;
      if (done === true || done === false) obj.actions[id][actionId].done = done;
      if (logText) {
        if (obj.actions[id][actionId].history) obj.actions[id][actionId].history.unshift(logText);
        else obj.actions[id][actionId].done.history = [logText];
      }
    }

    if (reason && obj.actions[id][actionId].agree === false) {
      obj.actions[id][actionId].reason = reason;
    } else {
      delete obj.actions[id][actionId].reason;
    }

    log.setObj(obj);
    notify.showSaved();
  },

  ignoreAction: function(id, actionId) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    obj.actions[id][actionId].agree = null;
    delete obj.actions[id][actionId].reason;
    log.setObj(obj);
  },

  getActions: function() {
    return log.getObj([{
      name: "actions",
      value: {}
    }]).actions;
  },

  listActions: function(id, pathwayId) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    arr = [];
    if (!id) return obj.actions;
    if (!obj.actions[id]) return arr;
    for (var prop in obj.actions[id]) {
      obj.actions[id][prop].id = prop;
      if (!obj.actions[id][prop].text)
        arr.push(obj.actions[id][prop]);
    }
    return arr;
  },

  //id is either "team" or the patientId
  recordFeedback: function(pathwayId, id, suggestion, reason, reasonText) {
    log.reason = {
      "reason": reason,
      "reasonText": reasonText
    };
    var obj = log.getObj([{
      name: "feedback",
      value: []
    }]);

    var item = {
      "pathwayId": pathwayId,
      "id": id,
      "val": suggestion
    };
    if (reasonText !== "") item.reasonText = reasonText;
    if (reason !== "") item.reason = reason;
    obj.feedback.push(item);
    log.setObj(obj);
  },

  getEvents: function() {
    return log.getObj([{
      name: "events",
      value: []
    }]).events;
  },

  recordEvent: function(pathwayId, id, name) {
    var obj = log.getObj([{
      name: "events",
      value: []
    }]);
    obj.events.push({
      "pathwayId": pathwayId,
      "id": id,
      "name": name,
      "date": new Date()
    });
    log.setObj(obj);
  },

  recordPlan: function(id, text, pathwayId) {
    if (!id) alert("PLAN");
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);

    var dataToSend = {
      event: {
        what: "recordIndividualPlan",
        when: new Date().getTime(),
        who: JSON.parse(localStorage.bb).email,
        detail: [
          { key: "text", value: text }
          ]
      }
    };
    if (id === "team") {
      dataToSend.event.what = "recordTeamPlan";
      dataToSend.event.detail.push({ key: "pathwayId", value: pathwayId });
    } else {
      dataToSend.event.detail.push({ key: "patientId", value: id });
    }

    console.log(dataToSend);
    $.ajax({
      type: "POST",
      url: "http://130.88.250.206:9100/pingr",
      data: JSON.stringify(dataToSend),
      success: function(d) { console.log(d); },
      dataType: "json",
      contentType: "application/json"
    });

    if (!obj.actions[id]) obj.actions[id] = {};
    var planId = Date.now() + "";
    obj.actions[id][planId] = {
      "text": text,
      "agree": null,
      "done": false,
      "pathwayId": pathwayId,
      "history": ["You added this on " + (new Date()).toDateString()]
    };

    log.setObj(obj);
    return planId;
  },

  findPlan: function(obj, planId) {
    for (var k in obj.actions) {
      if (obj.actions[k][planId] && obj.actions[k][planId].text) return k;
    }
    return -1;
  },

  editPlan: function(planId, text, done) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    var id = log.findPlan(obj, planId);
    if (text) obj.actions[id][planId].text = text;
    if (done === true || done === false) obj.actions[id][planId].done = done;
    log.setObj(obj);
  },

  deletePlan: function(planId) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);
    var id = log.findPlan(obj, planId);
    delete obj.actions[id][planId];
    log.setObj(obj);
  },

  listPlans: function(id, pathwayId) {
    var obj = log.getObj([{
        name: "actions",
        value: {}
      }]),
      arr = [];
    if (!id) return obj.actions;
    for (var prop in obj.actions[id]) {
      obj.actions[id][prop].id = prop;
      if ((!pathwayId || pathwayId === obj.actions[id][prop].pathwayId) && obj.actions[id][prop].text) arr.push(obj.actions[id][prop]);
    }
    return arr;
  },

  getReason: function(id, actionId) {
    var obj = log.getObj([{
      name: "actions",
      value: {}
    }]);

    if (obj.actions[id] && obj.actions[id][actionId]) return obj.actions[id][actionId].reason;
    return null;
  },

  getAgreeReason: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = log.getObj([{
      name: "agrees",
      value: {}
    }]);
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    return items.length === 1 ? items[0].reason || {} : {};
  },

  editPatientAgree: function(pathwayId, pathwayStage, standard, patientId, item, agree, reason) {
    var obj = log.getObj();
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    var logText = "You " + (agree ? "" : "dis") + "agreed with this on " + (new Date()).toDateString();

    if (items.length === 1) {
      items[0].agree = agree;
      items[0].history.push(logText);
      items[0].reason = reason;
    } else if (items.length === 0) {
      obj.agrees[patientId].push({
        "pathwayId": pathwayId,
        "pathwayStage": pathwayStage,
        "standard": standard,
        "item": item,
        "agree": agree,
        "reason": reason,
        "history": [logText]
      });
    } else {
      console.log("ERRORRR!!!!!!!");
    }

    log.setObj(obj);
    notify.showSaved();
  },

  getAgrees: function() {
    return log.getObj([{
      name: "agrees",
      value: {}
    }]).agrees;
  },

  getPatientAgreeObject: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = log.getObj([{
      name: "agrees",
      value: {}
    }]);
    if (!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if (!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });
    if (items.length === 1) return items[0];
    return {};
  },

  getPatientAgree: function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = log.getObj([{
      name: "agrees",
      value: {}
    }]);

    if (!obj.agrees[patientId]) return null;
    var item2 = obj.agrees[patientId].filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    if (item.length === 1) {
      return item[0].agree;
    }
    return null;
  }

};

module.exports = log;

});

require.register("lookup.js", function(exports, require, module) {
module.exports = {
  "currentUrl": "",
  "options": [],
  "categories": {
    "diagnosis": {
      "name": "diagnosis",
      "display": "Diagnosis"
    },
    "monitoring": {
      "name": "monitoring",
      "display": "Monitoring"
    },
    "treatment": {
      "name": "treatment",
      "display": "Control"
    },
    "exclusions": {
      "name": "exclusions",
      "display": "Exclusions"
    }
  },
  "charts": {},
  "pathwayId": "htn",
  "colors": ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
  "monitored": {
    "bp": "Blood Pressure",
    "asthma": "Peak Expiratory Flow"
  }
};

});

require.register("main.js", function(exports, require, module) {
var template = require('./template'),
  data = require('./data'),
  base = require('./base'),
  layout = require('./layout'),
  welcome = require('./panels/welcome'),
  log = require('./log'),
  patientView = require('./views/patient');

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
      /*var tempMust = $('#welcome-task-list').html();
      var rendered = Mustache.render(tempMust);*/
      //var tmpl = require("templates/action-plan-task-list");
      $('#welcome-tab-content').fadeOut(100, function() {
        //$(this).html(tmpl());
        welcome.populate();
        $(this).fadeIn(100);
      });
    });

    $('#completedTasks').on('click', function(e) {
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      /*var tempMust = $('#welcome-task-list').html();
      var rendered = Mustache.render(tempMust);*/
      //var tmpl = require("templates/action-plan-task-list");
      $('#welcome-tab-content').fadeOut(100, function() {
        //$(this).html(tmpl());
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

});

require.register("notify.js", function(exports, require, module) {
module.exports = {

  showSaved: function() {
    $("#saved-message").hide().toggleClass("in").fadeIn(300);
    window.setTimeout(function() {
      $("#saved-message").fadeOut(300, function() {
        $(this).toggleClass("in");
      });
    }, 2000);
  }

};

});

require.register("panels/confirm.js", function(exports, require, module) {
var base = require('../base.js'),
log = require('../log.js');

var confirm = {

  wireUp: function(agreeDivSelector, panelSelector, pathwayId, pathwayStage, standard, patientId, item, disagreeText) {
    confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));

    panelSelector.on('change', '.btn-toggle input[type=checkbox]', function() {
      confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
      base.wireUpTooltips();
    }).on('click', '.btn-toggle', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive")) {
        //unselecting
        if (checkbox.val() === "no") {
          confirm.launchStandardModal("Disagree with " + disagreeText, "?", log.getAgreeReason(pathwayId, pathwayStage, standard, patientId, item), true, function() {
            log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, false, log.reason.reasonText);
            confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            base.wireUpTooltips();
          }, null, function() {
            log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, null, "");
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, null);
          other.removeClass("inactive");
        }
      } else if (!$(this).hasClass("active") && other.hasClass("active")) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          confirm.launchStandardModal("Disagree with " + disagreeText, "", "", false, function() {
            log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, false, log.reason.reasonText);
            $(self).removeClass("inactive");
            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            confirm.wireUpAgreeDisagree(agreeDivSelector, log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });
  },

  wireUpAgreeDisagree: function(selector, agreeObject) {
    if (agreeObject.agree === true) {
      selector.children(':nth(0)').addClass('active');
      selector.children(':nth(1)').addClass('inactive');
      selector.children(':nth(0)').attr("title", confirm.getAgreeTooltip(agreeObject)).attr("data-original-title", confirm.getAgreeTooltip(agreeObject)).tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      selector.parent().addClass('success').removeClass('danger');
    } else if (agreeObject.agree === false) {
      selector.children(':nth(0)').addClass('inactive');
      selector.children(':nth(1)').addClass('active');
      selector.children(':nth(0)').attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title", confirm.getDisgreeTooltip(agreeObject)).attr("data-original-title", confirm.getDisgreeTooltip(agreeObject)).tooltip('fixTitle').tooltip('hide');
      selector.parent().addClass('danger').removeClass('success');
    } else {
      selector.children(':nth(0)').attr("title", "Click to agree").attr("data-original-title", "Click to agree").tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title", "Click to disagree").attr("data-original-title", "Click to disagree").tooltip('fixTitle').tooltip('hide');
      selector.parent().removeClass('success').removeClass('danger');
    }
  },

  getAgreeTooltip: function(agreeObject) {
    return agreeObject.history[agreeObject.history.length - 1];
  },

  getDisgreeTooltip: function(agreeObject) {
    return agreeObject.history[agreeObject.history.length - 1] + " You said: " + agreeObject.reason;
  },

  launchStandardModal: function(header, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    base.launchModal({
      "header": header,
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Provide more information here..."
    }, null, value, reason, callbackOnSave, callbackOnCancel, callbackOnUndo);
  }

};

module.exports = confirm;

});

require.register("panels/indicatorBenchmark.js", function(exports, require, module) {
var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js'),
  patientList = require('./patientList.js');

var ID = "INDICATOR_BENCHMARK";

var iTrend = {

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var elem = $("<div id='benchmark-chart' class='fit-to-scrolling-section-height'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawBenchmarkChartHC("benchmark-chart", null);

  },

  wireUp: function() {

  }

};

module.exports = iTrend;

});

require.register("panels/indicatorBreakdown.js", function(exports, require, module) {
var data = require('../data.js'),
  chart = require('../chart.js');

var bd = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard, selectSeriesFn) {

    var indicators = data.getIndicatorDataSync("P87024", [pathwayId, pathwayStage, standard].join("."));

    var dataObj = indicators.opportunities.map(function(opp) {
      return [opp.name, opp.description, opp.patients.length];
    });

    var elem = $("<div id='breakdown-chart'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawAnalytics("breakdown-chart", dataObj, selectSeriesFn);

    bd.wireUp();

  }

};

module.exports = bd;

});

require.register("panels/indicatorHeadlines.js", function(exports, require, module) {
var data = require('../data.js'),
  chart = require('../chart.js');/*,
  Mustache = require('mustache');
*/
var hl = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var indicators = data.getIndicatorDataSync("P87024", [pathwayId, pathwayStage, standard].join("."));

    var tmpl = require('templates/indicator-headline');
    var html = tmpl(indicators);

    if(isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = hl;

});

require.register("panels/indicatorList.js", function(exports, require, module) {
var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js'),
  sparkline = require('jquery-sparkline'),
  Mustache = require('mustache');

var indicatorList = {

  show: function(panel, isAppend, loadContentFn) {
    data.getAllIndicatorData("P87024", function(indicators) {
      indicators.sort(function(a,b){
        return a.performance.percentage - b.performance.percentage;
      });
      var tempMust = $('#overview-panel-table').html();
      var tmpl = require('templates/overview-table');
      var html = tmpl({
        "indicators": indicators
      });
      if (isAppend) {
        panel.append(html);
      } else {
        panel.html(html);
      }

      $('.inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          var dts = indicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return dts[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      indicatorList.wireUp(panel, loadContentFn);

    });
  },

  populate: function() {

  },

  wireUp: function(panel, loadContentFn) {
    panel.off('click', 'tr.show-more-row a');
    panel.on('click', 'tr.show-more-row a', function(e){
      e.stopPropagation();
    });
    panel.off('click', 'tr.standard-row,tr.show-more-row');
    panel.on('click', 'tr.standard-row,tr.show-more-row', function(e) {
      var url = $(this).data("id").replace(/\./g, "/");
      history.pushState(null, null, '#indicators/' + url);
      loadContentFn('#indicators/' + url);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    panel.off('mouseenter', '.show-more-row,.standard-row');
    panel.off('mouseleave', '.show-more-row,.standard-row');
    panel.on('mouseenter', '.show-more-row,.standard-row', function(e){
      var id = $(this).data("id");
      $('.show-more-row[data-id="' + id + '"],.standard-row[data-id="' + id + '"]').addClass('hover');
    });
    panel.on('mouseleave', '.show-more-row,.standard-row', function(e){
      var id = $(this).data("id");
      $('.show-more-row[data-id="' + id + '"],.standard-row[data-id="' + id + '"]').removeClass('hover');
    });

    panel.off('click', '.show-more');
    panel.on('click', '.show-more', function(e) {
      var id = $(this).data("id");
      var elem = $('.show-more-row[data-id="' + id + '"]');
      if(elem.is(':visible')){
        $('.show-more[data-id="' + id + '"]:first').show();
        elem.hide();
      } else {
        $(this).hide();
        elem.show('fast');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

};

module.exports = indicatorList;

});

require.register("panels/indicatorTrend.js", function(exports, require, module) {
var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js'),
  patientList = require('./patientList.js');

var ID = "INDICATOR_TREND";

var iTrend = {

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var trend = data.getTrendData("P87024", pathwayId, pathwayStage, standard);

    var elem = $("<div id='trend-chart' class='fit-to-scrolling-section-height'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawPerformanceTrendChartHC("trend-chart", trend);

  },

  wireUp: function() {

  }

};

module.exports = iTrend;

});

require.register("panels/individualActionPlan.js", function(exports, require, module) {
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var iap = {

  create: function(pathwayStage) {
    return require("templates/individual-action-plan")();
    /*return base.createPanel($('#individual-action-plan-panel'), {
      "pathwayStage": pathwayStage || "default",
      "noHeader": true
    });*/
  },

  show: function(panel, pathwayId, pathwayStage, standard, patientId) {
    panel.html(iap.create(pathwayStage));
    iap.wireUp(pathwayId, pathwayStage, standard, patientId);

    panel.find('div.fit-to-screen-height').niceScroll({
      cursoropacitymin: 0.3,
      cursorwidth: "7px",
      horizrailenabled: false
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    individualTab = $('#tab-plan-individual');

    //find [] and replace with copy button

    $('#advice-list').on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      log.editAction(data.patientId, ACTIONID, null, this.checked);

      if (this.checked) {
        log.recordEvent(pathwayId, data.patientId, "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            base.wireUpTooltips();
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              log.editAction(data.patientId, ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              iap.updateIndividualSapRows();
            });
          });
        }, 1000);
      }

      iap.updateIndividualSapRows();
    });

    $('#personalPlanIndividual').on('click', 'input[type=checkbox]', function() {
      var PLANID = $(this).closest('tr').data("id");
      log.editPlan(PLANID, null, this.checked);

      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
        log.recordEvent(pathwayId, data.patientId, "Personal plan item");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            base.wireUpTooltips();
            parent.find('button').on('click', function() {
              PLANID = $(this).closest('tr').data('id');
              log.editPlan(data.patientId, PLANID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              iap.updateIndividualSapRows();
            });
          });
        }, 1000);
      }
    }).on('click', '.btn-undo', function(e) {
      var PLANID = $(this).closest('tr').data('id');
      log.editPlan(PLANID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      iap.updateIndividualSapRows();
      e.stopPropagation();
    });

    individualTab.on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        iap.displayPersonalisedIndividualActionPlan(data.patientId, $('#personalPlanIndividual'));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {

        log.editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#modal-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        iap.displayPersonalisedIndividualActionPlan(data.patientId, $('#personalPlanIndividual'));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        log.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.add-plan', function() {
      log.recordPlan(data.patientId, $(this).parent().parent().find('textarea').val(), pathwayId);

      iap.displayPersonalisedIndividualActionPlan(data.patientId, $('#personalPlanIndividual'));
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      iap.updateIndividualSapRows();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      log.editAction(data.patientId, ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      iap.updateIndividualSapRows();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          iap.launchModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), log.getReason(data.patientId, ACTIONID), true, function() {
            log.editAction(data.patientId, ACTIONID, false, null, log.reason);
            iap.updateIndividualSapRows();
            base.wireUpTooltips();
          }, null, function() {
            log.ignoreAction(data.patientId, ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            iap.updateIndividualSapRows();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.ignoreAction(data.patientId, ACTIONID);
          other.removeClass("inactive");
        }
      } else if ((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          iap.launchModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), log.getReason(data.patientId, ACTIONID), false, function() {
            log.editAction(data.patientId, ACTIONID, false, null, log.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            iap.updateIndividualSapRows();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editAction(data.patientId, ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    }).on('keyup', 'input[type=text]', function(e) {
      if (e.which === 13) {
        individualTab.find('.add-plan').click();
      }
    });

    $('#advice-list').off('click', '.show-more');
    $('#advice-list').on('click', '.show-more', function(e) {
      var id = $(this).data("id");
      var elem = $('.show-more-row[data-id="' + id + '"]');
      if(elem.is(':visible')){
        $('.show-more[data-id="' + id + '"]:first').show();
        elem.hide();
      } else {
        $(this).hide();
        elem.show('fast');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    iap.populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard);
  },

  updateIndividualSapRows: function() {
    /*$('#advice-list').add('#personalPlanIndividual').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });*/

    /*$('#advice-list').add('#personalPlanIndividual').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });*/

    /*$('#advice-list').add('#personalPlanIndividual').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });*/

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text

    $('#advice-list').add('#personalPlanIndividual').find('tr.suggestion').each(function() {
      var self = $(this);
      var id = self.data("id");
      var all = $('.show-more-row[data-id="' + id + '"],.suggestion[data-id="' + id + '"]');
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          all.removeClass('danger');
          all.addClass('active');
          //self.find('td').last().children().show();
          if (log.getActions()[data.patientId][self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + log.getActions()[data.patientId][self.data("id")].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          all.removeClass('active');
          all.addClass('danger');
          all.removeClass('success');
          if (log.getActions()[data.patientId][self.data("id")] && log.getActions()[data.patientId][self.data("id")].history) {
            $(this).parent().attr("title", "<p>" + log.getActions()[data.patientId][self.data("id")].history[0] + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });
      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if (!any) {
        all.removeClass('danger');
        all.removeClass('active');
        all.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      base.wireUpTooltips();
    });
    base.wireUpTooltips();
  },

  displayPersonalisedIndividualActionPlan: function(id, parentElem) {
    var plans = base.sortSuggestions(base.addDisagreePersonalTeam(log.listPlans(id)));

    /*base.createPanelShow(actionPlanList, parentElem, {
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }, {
      "action-plan": $('#action-plan').html(),
      "action-plan-item": $('#action-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });*/

    var tmpl = require('templates/action-plan-list');
    parentElem.html(tmpl({
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }));

    iap.updateIndividualSapRows();
  },

  populateIndividualSuggestedActions: function(patientId, pathwayId, pathwayStage, standard) {
    var localData = {
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    };

    var patientData = data.getPatientData(patientId);

    var breaches = data.patients[patientId].breach ? data.patients[patientId].breach.filter(function(v) {
      return v.pathwayId === pathwayId && v.pathwayStage === pathwayStage && v.standard === standard;
    }) : [];

    var fn = function(val) {
      return {
        "id": val,
        "subsection": subsection
      };
    };

    if (patientData.actions.length === 0) {
      localData.noSuggestions = true;
    } else {
      /*var suggestions = [],
        subsection = "";
      for (var i = 0; i < breaches.length; i++) {
        subsection = breaches[i].subsection;
        suggestions = suggestions.concat(data[pathwayId][pathwayStage].bdown[subsection].suggestions ?
          data[pathwayId][pathwayStage].bdown[subsection].suggestions.map(fn) : []);
      }*/

      localData.suggestions = base.sortSuggestions(base.mergeIndividualStuff(patientData.actions, patientId));
      /*localData.section = {
        "name": data[pathwayId][pathwayStage].bdown[subsection].name,
        "agree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "section") === true,
        "disagree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "section") === false,
      };
      localData.category = {
        "name": data.patients[patientId].category,
        "agree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "category") === true,
        "disagree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "category") === false,
      };*/
    }

    $('#advice-placeholder').hide();
    $('#advice').show();

    //base.createPanelShow(individualPanel, $('#advice-list'), localData);
    var tmpl = require("templates/individual");
    $('#advice-list').html(tmpl(localData));

    //Wire up any clipboard stuff in the suggestions
    $('#advice-list').find('span:contains("[COPY")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[COPY:([^\]]*)\]/g, '$1 <button type="button" data-clipboard-text="$1" data-content="Copied" data-toggle="tooltip" data-placement="top" title="Copy $1 to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });
    $('#advice-list').find('span:contains("[")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[([^\]]*)\]/g, ' <button type="button" data-clipboard-text="$1" data-content="Copied" data-toggle="tooltip" data-placement="top" title="Copy $1 to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });

    $('#advice-list').find('span:contains("[INFO")').each(function() {
      var html = $(this).html();
      var subsection = $(this).data().subsection;
      var desc = data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
          return val.name === subsection;
        }).length > 0 ?
        data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].desc : subsection;
      var tooltip = subsection ? "This action is suggested because PINGR classified this patient as:'" + desc + "'" : '';
      var newHtml = ' <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="' + tooltip + '"></i>';
      $(this).html(html.replace(/\[INFO\]/g, newHtml));
    });

    $('#advice-list').find('span:contains("[MED-SUGGESTION")').each(function() {
      var html = $(this).html();
      var suggestion = Math.random() < 0.33 ? "Increase Ramipril to 10mg per day" : (Math.random() < 0.5 ? "Consider adding an ACE inhibior" : "Consider adding a thiazide-like diuretic");
      $(this).html(html.replace(/\[MED\-SUGGESTION\]/g, suggestion));
    });


    base.setupClipboard($('.btn-copy'), true);

    iap.displayPersonalisedIndividualActionPlan(patientId, $('#personalPlanIndividual'));
  },

  launchModal: function(label, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var reasons = [{
      "reason": "Already done this",
      "value": "done"
    }, {
      "reason": "Wouldn't work",
      "value": "nowork"
    }, {
      "reason": "Something else",
      "value": "else"
    }];
    if (reason && reason.reason) {
      for (var i = 0; i < reasons.length; i++) {
        if (reasons[i].reason === reason.reason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    base.launchModal({
      "header": "Disagree with a suggested action",
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Provide more information here...",
      "reasons": reasons
    }, label, value, reason ? reason.reasonText : null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  }

};

module.exports = iap;

});

require.register("panels/lifeline.js", function(exports, require, module) {
var Highcharts = require('highcharts/highstock'),
  base = require('../base.js');
require('highcharts/highcharts-more')(Highcharts);

var ID = "LIFELINE";

var colour = {
  index: 0,
  next: function() {
    if (this.index >= Highcharts.getOptions().colors.length) this.index = 0;
    return Highcharts.getOptions().colors[this.index++];
  },
  reset: function() {
    this.index = 0;
  }
};

var ll = {
  chartArray: [],

  destroy: function(elementId) {
    $(elementId).html('');
    $(elementId).off('mousemove touchmove touchstart', '.sync-chart');

    for (var i = 0; i < Highcharts.charts.length; i++) {
      if (Highcharts.charts[i] && Highcharts.charts[i].renderTo.className.indexOf("h-chart") > -1) Highcharts.charts[i].destroy();
    }
  },

  show: function(panel, isAppend, patientId, data) {

    var element = 'lifeline-chart';
    var elementId = '#' + element;

    //Most recent max date of series minus one month or 1 year whichever is most
    var minMaxDate=new Date();
    minMaxDate.setMonth(minMaxDate.getMonth()-11);

    ll.destroy(elementId);

    var htmlElement = $('<div class="panel panel-default"><div class="panel-body"><div id="' + element + '"></div></div></div>');

    if (isAppend) panel.append(htmlElement);
    else panel.html(htmlElement);

    colour.reset();
    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */

    $(elementId).on('mousemove touchmove touchstart', '.sync-chart', function(e) {
      var chart, point, i, event, series;

      for (i = 1; i < ll.chartArray.length - 2; i = i + 1) {
        chart = ll.chartArray[i];
        event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
        //if (i === 0) console.log(event.chartX + " --- " + event.chartY);
        series = i === 0 ? Math.max(Math.min(Math.floor((130 - event.chartY) / 34), chart.series.length - 1), 0) : 0;
        point = chart.series[series].searchPoint(event, true); // Get the hovered point

        if (point) {
          point.onMouseOver(); // Show the hover marker
          chart.tooltip.refresh(point); // Show the tooltip
          chart.xAxis[0].drawCrosshair(event, point); // Show the crosshair
        }
      }
    });

    /**
     * Synchronize zooming through the setExtremes event handler.
     */
    function syncExtremes(e) {
      var thisChart = this.chart;

      if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(ll.chartArray, function(chart) {
          if (chart !== thisChart) {
            if (chart.inverted) {
              if (chart.yAxis[0].setExtremes) { // It is null while updating
                chart.yAxis[0].setExtremes(e.min, e.max, undefined, false, {
                  trigger: 'syncExtremes'
                });
              }
            } else {
              if (chart.xAxis[0].setExtremes) { // It is null while updating
                chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
                  trigger: 'syncExtremes'
                });
              }
            }
          }
        });
      }
    }


    var plotConditions = function(conditions, importantCodes, contacts) {
      ll.charts = 1;
      var series = [];
      $.each(conditions.reverse(), function(i, task) {
        var item = {
          name: task.name,
          data: [],
          color: colour.next()
        };

        var latestIntervalEndDate;

        $.each(task.intervals, function(j, interval) {
          if(!latestIntervalEndDate) latestIntervalEndDate = interval.to;
          else latestIntervalEndDate = Math.max(latestIntervalEndDate, interval.to);
          item.data.push([i + 0.49, interval.from, interval.to]);
        });

        if(latestIntervalEndDate) minMaxDate = Math.min(latestIntervalEndDate, minMaxDate);

        series.push(item);
      });

      var markerTemplate = { "lineWidth": 1, "lineColor": "black", "radius": 8 };
      var markers = {
        "default": $.extend({ "symbol": "triangle" }, markerTemplate),
        "Face to face": $.extend({ "symbol": "square" }, markerTemplate),
        "Telephone": $.extend({ "symbol": "circle" }, markerTemplate),
        "Hospital admission": $.extend({ "symbol": "triangle" }, markerTemplate)
      };
      var contactSeries = {};
      var eventSeries = {};
      var latestContact;
      $.each(contacts, function(i, contact) {
        if(!latestContact) latestContact = contact.time;
        else latestContact = Math.max(latestContact, contact.time);
        if (!contactSeries[contact.name]) {
          contactSeries[contact.name] = Highcharts.extend(contact, {
            data: [],
            type: 'scatter',
            marker: markers[contact.name] || markers.default,
            color: colour.next()
          });
        }
        contactSeries[contact.name].data.push([
              contact.task,
              contact.time
          ]);
      });
      if(latestContact) minMaxDate = Math.min(latestContact, minMaxDate);

      var latestImportantCode;
      $.each(importantCodes, function(i, event) {
        if(!latestImportantCode) latestImportantCode = event.time;
        else latestImportantCode = Math.max(latestImportantCode, event.time);
        if (!eventSeries[event.name]) {
          eventSeries[event.name] = Highcharts.extend(event, {
            data: [],
            type: 'scatter',
            marker: markers[event.name] || markers.default,
            color: colour.next()
          });
        }
        eventSeries[event.name].data.push([
              event.task,
              event.time
          ]);
      });

      if(latestImportantCode) minMaxDate = Math.min(latestImportantCode, minMaxDate);

      series = series.concat(Object.keys(contactSeries).map(function(key) {
        return contactSeries[key];
      }));

      series = series.concat(Object.keys(eventSeries).map(function(key) {
        return eventSeries[key];
      }));

      $(elementId).append($('<div class="chart-title">Patient conditions and contacts</div>'));
      // create the chart
      $('<div class="h-chart h-condition-chart">')
        .appendTo(elementId)
        .highcharts({

          chart: {
            renderTo: element,
            marginLeft: 120, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            type: 'columnrange',
            inverted: true,
            backgroundColor: '#F9F3F9',
            borderWidth: 2,
            borderColor: '#ddd'
          },

          title: '',

          yAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: true,
            events: {
              setExtremes: syncExtremes
            },
            labels: {
              enabled: false
            },

            //things that are normally xAxis defaults
            endOnTick: false,
            gridLineWidth: 0,
            lineWidth: 1,
            maxPadding: 0.01,
            minPadding: 0.01,
            startOnTick: false,
            tickWidth: 0,
            title: {
              text: ''
            },
            tickPixelInterval: 100
          },

          xAxis: {
            labels: {
              enabled: false
            },
            startOnTick: false,
            endOnTick: false,
            title: {
              text: ''
            },
            tickWidth: 0,
            minPadding: 0.2,
            maxPadding: 0.2,

            //things that are normally yAxis defaults
            gridLineWidth: 0,
            lineWidth: 0

          },
          credits: {
            enabled: false
          },

          legend: {
            enabled: false
          },

          tooltip: {
            formatter: function() {
              if (this.series.data[0].x !== 1 && this.series.data[0].x !== 2) {
                //Range ergo condition
                var yCoord = this.y;
                var labelTmp = conditions[Math.floor(this.x)].intervals.filter(function(v) {
                  return yCoord >= v.from && yCoord <= v.to;
                });
                var label = labelTmp.length > 0 ? labelTmp[0].label : "No label A";
                return '<b>' + conditions[Math.floor(this.x)].name + (label ? ': ' + label : '') + '</b><br/>' +
                  Highcharts.dateFormat('%d/%m/%Y', this.point.options.low) +
                  ' - ' + Highcharts.dateFormat('%d/%m/%Y', this.point.options.high);
              } else {
                //Single value hence contact
                var time = this.y;
                return (this.series.data[0].x === 1 ? importantCodes : contacts).filter(function(val) {
                  return val.data && val.data.filter(function(v) {
                    return v[1] === time;
                  }).length > 0;
                }).map(function(val) {
                  return '<b>' + val.name + '</b><br/>' + Highcharts.dateFormat('%d/%m/%Y', time);
                }).join('<br/>');
              }
            },
            followPointer: true
          },

          plotOptions: {
            columnrange: {
              grouping: false,
              /*groupPadding: 0.3,*/
              dataLabels: {
                allowOverlap: true,
                enabled: true,
                formatter: function() {
                  var yCoord = this.y;
                  var idx = -1;
                  var labelTmp = conditions[Math.floor(this.x)].intervals.filter(function(v, i) {
                    if (yCoord >= v.from && yCoord <= v.to) {
                      idx = i;
                      return true;
                    }
                    return false;
                  });
                  var label = labelTmp.length > 0 ? labelTmp[0].label : "No label B";
                  return this.y === this.point.low &&
                    (conditions[Math.floor(this.x)].intervals.length - 1 === idx ||
                      (this.series.chart.yAxis[0].min <= yCoord && this.series.chart.yAxis[0].max >= yCoord) ||
                      (this.series.chart.yAxis[0].min >= this.point.low && this.series.chart.yAxis[0].max <= this.point.high)) ? conditions[Math.floor(this.x)].name + (label ? ': ' + label : '') : '';
                }
              }
            }
          },

          series: series

        });
    };

    var plotMeasurements = function(measurements) {
      $(elementId).append($('<div class="chart-title">Patient measurements</div>'));
      //Make measurements alphabetical so they are always in the same order
      measurements.sort(function(a,b){
        if(a.name<b.name) return -1;
        if(a.name>b.name) return 1;
        return 0;
      });
      $.each(measurements, function(i, dataset) {
        ll.charts++;
        var maxMeasurementDate=0;
        dataset.data.forEach(function(v){
          maxMeasurementDate = Math.max(maxMeasurementDate, v[0]);
        });
        minMaxDate = Math.min(minMaxDate, maxMeasurementDate);
        var chartOptions = {
          chart: {
            marginLeft: 120, // Keep all charts left aligned
            spacingTop: 0,
            spacingBottom: 8,
            backgroundColor: '#F9F9F3',
            borderWidth: 2,
            borderColor: '#ddd'
          },
          title: {
            text: '',
            align: 'left',
            margin: 0,
            x: 30
          },
          marker: {
            enabled: true
          },
          credits: {
            enabled: false
          },
          legend: {
            enabled: false
          },
          xAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: {
              snap: false
            },
            events: {
              setExtremes: syncExtremes
            },
            labels: {
              enabled: false
            },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0
          },
          yAxis: {
            title: {
              text: dataset.name + "<br>" + dataset.unit.replace(/\^([0-9]+)/, "<sup>$1</sup>") + "",
              margin: 60,
              rotation: 0
            },
            startOnTick: false,
            endOnTick: false,
            labels: {
              style: {
                "textOverflow": "none"
              }
            },
            tickPixelInterval: 25,
            maxPadding: 0.1,
            minPadding: 0.1
          },
          tooltip: {
            positioner: function(labelWidth, labelHeight, point) {
              return {
                x: Math.max(50, point.plotX - labelWidth), // left aligned
                y: -1 // align to title
              };
            },
            useHTML: true,
            pointFormat: '<b>' + dataset.name + ':</b> {point.y} ' + dataset.unit.replace(/\^([0-9]+)/, "<sup>$1</sup>"),
            valueDecimals: dataset.valueDecimals
          },
          plotOptions: {
            series: {
              events: {
                mouseOut: function() {
                  var chart, i;
                  for (i = 1; i < ll.chartArray.length - 2; i = i + 1) {
                    chart = ll.chartArray[i];
                    chart.tooltip.hide();
                  }
                }
              }
            }
          },
          series: [{
            data: dataset.data,
            name: dataset.name,
            type: dataset.type,
            color: colour.next(),
            fillOpacity: 0.3
            }]
        };

        if (dataset.name === "BP") {
          chartOptions.tooltip.pointFormat = "<b>BP:</b> {point.low}/{point.high} mmHg<br/>";
          //chartOptions.series[0].tooltip = {};
          chartOptions.series[0].stemWidth = 3;
          chartOptions.series[0].whiskerWidth = 5;
        }

        /*if (i === 0) {
          chartOptions.title = {
            text: 'Patient measurements',
            align: 'left',
            margin: 1,
            style: {
              color: "#333333",
              fontSize: "12px",
              fontWeight: "bold"
            }
          };
        }*/

        /*if (i === measurements.datasets.length - 1) {
          chartOptions.xAxis = {
            crosshair: true,
            events: {
              setExtremes: syncExtremes
            },
            type: 'datetime'
          };
        }*/
        $('<div class="sync-chart h-chart' + (i === measurements.length - 1 ? " h-last-measurement-chart" : "") + '">')
          .appendTo(elementId)
          .highcharts(chartOptions);

      });
    };

    var plotNavigator = function() {
      ll.charts++;
      var chart = $('<div class="h-chart h-navigator-chart">')
        .appendTo(elementId)
        .highcharts({

          chart: {
            renderTo: element,
            marginLeft: 120, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            ignoreHiddenSeries: false,
            borderWidth: 2,
            borderColor: '#ddd'
          },

          title: {
            text: ''
          },

          xAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: false,
            events: {
              setExtremes: syncExtremes
            },
            labels: {
              enabled: false
            },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0
          },

          yAxis: {
            min: 0,
            max: 1,
            tickInterval: 1,
            startOnTick: false,
            endOnTick: false,
            title: {
              text: ''
            },
            minPadding: 0.2,
            maxPadding: 0.2,
            labels: {
              enabled: false
            }
          },

          legend: {
            enabled: false
          },

          navigator: {
            enabled: true
          },

          plotOptions: {
            line: {
              lineWidth: 0,
              marker: {
                enabled: false
              },
              dataLabels: {
                enabled: false
              }
            }
          },

          series: [{
            "name": "HTN",
            "data": [{
              "x": 1373587200000,
              "y": 0,
              "from": 1373587200000,
              "to": 1459814400000
              }]
            }]

        });
      chart.highcharts().series[0].hide();
    };

    var plotMedications = function(medications) {
      ll.charts++;
      var series = [];
      $.each(medications.reverse(), function(i, task) {
        var item = {
          name: task.name,
          data: [],
          color: colour.next()
        };
        $.each(task.intervals, function(j, interval) {
          item.data.push([i + 0.49, interval.from, interval.to]);
        });

        series.push(item);
      });
      var noData = false;
      if (series.length === 0) {
        series.push({
          type: 'line',
          name: 'Random data',
          data: []
        });
        noData = true;
      }

      //$(elementId).append($('<div class="chart-title"' + (noData ? 'style="display:none"' : '') + '>Patient medications</div>'));
      $(elementId).append($('<div class="chart-title">Patient medications</div>'));
      // create the chart
      //return $('<div class="h-chart h-medication-chart"' + (noData ? 'style="display:none"' : '') + '>')
      return $('<div class="h-chart h-medication-chart">')
        .appendTo(elementId)
        .highcharts({

          chart: {
            renderTo: element,
            marginLeft: 120, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            type: 'columnrange',
            inverted: true,
            backgroundColor: '#F3F9F9'
          },
          lang: {
            noData: "No relevant medications"
          },
          noData: {
            style: {
              fontWeight: 'bold',
              fontSize: '15px',
              color: '#303030'
            }
          },

          title: '',
          /*{
                      text: 'Patient medications',
                      align: 'left',
                      margin: 1,
                      style: {
                        color: "#333333",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }
                    },*/


          yAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: {
              snap: false
            },
            events: {
              setExtremes: syncExtremes
            },



            //things that are normally xAxis defaults
            endOnTick: false,
            gridLineWidth: 0,
            lineWidth: 1,
            maxPadding: 0.01,
            minPadding: 0.01,
            startOnTick: false,
            tickWidth: 1,
            title: {
              text: ''
            },
            tickPixelInterval: 100
          },

          xAxis: {
            labels: {
              enabled: false
            },
            startOnTick: false,
            endOnTick: false,
            title: {
              text: ''
            },
            tickWidth: 0,
            minPadding: 0.2,
            maxPadding: 0.2,

            //things that are normally yAxis defaults
            gridLineWidth: 0,
            lineWidth: 0
          },
          credits: {
            enabled: false
          },

          legend: {
            enabled: false
          },

          tooltip: {
            formatter: function() {
              var yCoord = this.y;
              var labelTmp = medications[Math.floor(this.x)].intervals.filter(function(v) {
                return yCoord >= v.from && yCoord <= v.to;
              });
              var label = labelTmp.length > 0 ? labelTmp[0].label : "No label C";
              return '<b>' + medications[Math.floor(this.x)].name + (label ? ': ' + label : '') + '</b><br/>' +
                Highcharts.dateFormat('%d/%m/%Y', this.point.options.low) +
                ' - ' + Highcharts.dateFormat('%d/%m/%Y', this.point.options.high);
            },
            followPointer: true
          },

          plotOptions: {
            columnrange: {
              grouping: false,
              dataLabels: {
                allowOverlap: true,
                enabled: true,
                formatter: function() {
                  var yCoord = this.y;
                  var idx = -1;
                  var labelTmp = medications[Math.floor(this.x)].intervals.filter(function(v, i) {
                    if (yCoord >= v.from && yCoord <= v.to) {
                      idx = i;
                      return true;
                    }
                    return false;
                  });
                  var label = labelTmp.length > 0 ? labelTmp[0].label : "No label D";
                  return this.y === this.point.low &&
                    (medications[Math.floor(this.x)].intervals.length - 1 === idx ||
                      (this.series.chart.yAxis[0].min <= yCoord && this.series.chart.yAxis[0].max >= yCoord) ||
                      (this.series.chart.yAxis[0].min >= this.point.low && this.series.chart.yAxis[0].max <= this.point.high)) ? medications[Math.floor(this.x)].name + (label ? ': ' + label : '') : '';
                }
              }
            }
          },

          series: series

        });
    };

    minMaxDate.setMonth(minMaxDate.getMonth()-1); //gives 1 month padding

    plotConditions(data.conditions, data.events, data.contacts);
    plotMeasurements(data.measurements);
    var c = plotMedications(data.medications);
    plotNavigator();
    var today = new Date().getTime();
    c.highcharts().axes[1].setExtremes(minMaxDate, today, undefined, false, {
      trigger: 'syncExtremes'
    });

    ll.chartArray = Highcharts.charts.slice(Highcharts.charts.length - ll.charts, Highcharts.charts.length);

    var s = syncExtremes.bind(c.highcharts().series[0]);
    s({
      trigger: 'navigator',
      min: minMaxDate,
      max: today
    });
  }

};

module.exports = ll;

});

require.register("panels/patientCharacteristics.js", function(exports, require, module) {
var data = require('../data.js'),
  Mustache = require('mustache');

var pc = {

  show: function(panel, isAppend, patientId) {

    var patientData = data.getPatientData(patientId);

    var tempMust = $('#patient-characteristics-panel').html();
    var html = Mustache.render(tempMust, patientData.characteristics);

    if (isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = pc;

});

require.register("panels/patientList.js", function(exports, require, module) {
var Highcharts = require('highcharts/highstock'),
  base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  Mustache = require('mustache');

var ID = "PATIENT_LIST";

var pl = {

  wireUp: function(onPatientSelected) {
    patientsPanel = $('#patients');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pl.populate(pl.state[0], pl.state[1], pl.state[2], pl.state[3], $(this).index(), sortAsc);
    }).on('click', 'tbody tr', function(e) { //Select individual patient when row clicked#
      var callback = onPatientSelected.bind(this);
      var patientId = $(this).find('td button').attr('data-patient-id');
      callback(patientId);
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });
  },

  selectSubsection: function(section) {
    pl.populate(pl.state[0], pl.state[1], pl.state[2], section, pl.state[4], pl.state[5]);
  },

  populate: function(pathwayId, pathwayStage, standard, subsection, sortField, sortAsc) {
    pl.state = [pathwayId, pathwayStage, standard, subsection, sortField, sortAsc];
    patientsPanel = $('#patients');
    //Remove scroll if exists
    patientsPanel.find('div.table-scroll').getNiceScroll().remove();

    var i, k, prop, header, pList = [];

    data.getPatientList("P87024", pathwayId, pathwayStage, standard, subsection, function(list) {

      if (sortField === undefined) sortField = 2;
      if (sortField !== undefined) {
        list.patients.sort(function(a, b) {
          if (sortField === 0) { //NHS number
            if (a.nhsNumber === b.nhsNumber) {
              return 0;
            }

            if (a.nhsNumber > b.nhsNumber) {
              return sortAsc ? 1 : -1;
            } else if (a.nhsNumber < b.nhsNumber) {
              return sortAsc ? -1 : 1;
            }
          } else {
            if (a.items[sortField - 1] === b.items[sortField - 1]) {
              return 0;
            }

            if (a.items[sortField - 1] == "?") return 1;
            if (b.items[sortField - 1] == "?") return -1;

            var A = Number(a.items[sortField - 1]);
            var B = Number(b.items[sortField - 1]);
            if (isNaN(A) || isNaN(B)) {
              A = a.items[sortField - 1];
              B = b.items[sortField - 1];
            }
            if (A > B) {
              return sortAsc ? 1 : -1;
            } else if (A < B) {
              return sortAsc ? -1 : 1;
            }
          }
        });

        for (i = 0; i < list["header-items"].length; i++) {
          if (i === sortField) {
            list["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
            list["header-items"][i].isAsc = sortAsc;
            list["header-items"][i].isSorted = true;
          } else {
            list["header-items"][i].isSorted = false;
          }
        }
      }

      base.createPanelShow(require('templates/patient-list'), patientsPanel, list);/*, {
        "header-item": require('src/templates/partials/_patient-list-header-item')(),
        "item": require('src/templates/partials/_patient-list-item')()
      });*/

      $('#patients-placeholder').hide();

      base.setupClipboard($('.btn-copy'), true);

      base.wireUpTooltips();

      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });

      base.hideLoading();

    });

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard, loadContentFn) {

    //var tempMust = $('#patients-panel-yes').html();
    var tmpl = require('templates/patient-list-wrapper');

    if(isAppend) panel.append(tmpl());
    else panel.html(tmpl());

    pl.wireUp(function(patientId) {
      history.pushState(null, null, '#patient/' + patientId);
      loadContentFn('#patient/' + patientId);
    });
    pl.populate(pathwayId, pathwayStage, standard, null);
  }

};

module.exports = pl;

});

require.register("panels/patientSearch.js", function(exports, require, module) {
var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js');
var states, loadContFn, ID = "PATIENT_SEARCH";

var ps = {

  wireUp: function() {
    if (states) {
      states.clearPrefetchCache();
    }

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
  },

  onSelected: function($e, nhsNumberObject) {
    //Hide the suggestions panel
    $('#search-box').find('.tt-dropdown-menu').css('display', 'none');

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

});

require.register("panels/qualityStandards.js", function(exports, require, module) {
var data = require('../data.js');

var qs = {

  show: function(panel, isAppend, patientId) {

    var patientData = data.getPatientData(patientId);

    var tmpl = require("templates/quality-standard");
    var html = tmpl({
      "standards": patientData.standards
    });

    if (isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = qs;

});

require.register("panels/teamActionPlan.js", function(exports, require, module) {
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var tap = {

  show: function(location) {
    location.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    //base.createPanelShow($('#team-action-plan-panel'), location);
    var tmpl = require('templates/team-action-plan');
    location.html(tmpl());

    suggestedPlanTeam = $('#suggestedPlanTeam');

    suggestedPlanTeam.on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      log.editAction("team", ACTIONID, null, this.checked);

      if (this.checked) {
        log.recordEvent(data.pathwayId, "team", "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        base.wireUpTooltips();
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              log.editAction("team", ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              tap.updateTeamSapRows();
            });
          });
        }, 1000);
      }

      tap.updateTeamSapRows();
    });

    $('#personalPlanTeam').on('click', 'input[type=checkbox]', function() {
      var PLANID = $(this).closest('tr').data("id");
      editPlan(PLANID, null, this.checked);

      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
        recordEvent(data.pathwayId, "team", "Personal plan item");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            base.wireUpTooltips();
            parent.find('button').on('click', function() {
              PLANID = $(this).closest('tr').data('id');
              editPlan("team", PLANID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              tap.updateTeamSapRows();
            });
          });
        }, 1000);
      }

    }).on('click', '.btn-undo', function(e) {
      var PLANID = $(this).closest('tr').data('id');
      log.editPlan(PLANID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      tap.updateTeamSapRows();
      e.stopPropagation();
    });

    var teamTab = $('#tab-plan-team'),
      current;
    teamTab.on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {

        log.editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#modal-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        log.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.add-plan', function() {
      log.recordPlan("team", $(this).parent().parent().find('textarea').val(), data.pathwayId);

      tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      tap.updateTeamSapRows();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      log.editAction("team", ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      tap.updateTeamSapRows();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          tap.launchModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), log.getReason("team", ACTIONID), true, function() {
            log.editAction("team", ACTIONID, false, null, log.reason);
            tap.updateTeamSapRows();
            base.wireUpTooltips();
          }, null, function() {
            log.ignoreAction("team", ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            tap.updateTeamSapRows();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.ignoreAction("team", ACTIONID);
          other.removeClass("inactive");
        }
      } else if ((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          tap.launchModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), log.getReason("team", ACTIONID), false, function() {
            log.editAction("team", ACTIONID, false, null, log.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            tap.updateTeamSapRows();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editAction("team", ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    }).on('keyup', 'input[type=text]', function(e) {
      if (e.which === 13) {
        teamTab.find('.add-plan').click();
      }
    });

    tap.populateTeamSuggestedActionsPanel();

    location.find('div.fit-to-screen-height').niceScroll({
      cursoropacitymin: 0.3,
      cursorwidth: "7px",
      horizrailenabled: false
    });
  },

  populateTeamSuggestedActionsPanel: function() {
    /*var suggestions = base.suggestionList(log.plan[data.pathwayId].team);
    suggestions = base.sortSuggestions(tap.mergeTeamStuff(suggestions));*/
    var suggestions=[];

    /*base.createPanelShow(suggestedPlanTemplate, suggestedPlanTeam, {
      "suggestions": suggestions
    }, {
      "item": $('#suggested-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });*/

    var tmpl = require('templates/suggested-plan');
    suggestedPlanTeam.html(tmpl({
      "suggestions": suggestions
    }));
    tap.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
  },

  updateTeamSapRows: function() {
    suggestedPlanTeam.add('#personalPlanTeam').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });

    suggestedPlanTeam.add('#personalPlanTeam').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    suggestedPlanTeam.add('#personalPlanTeam').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text
    suggestedPlanTeam.add('#personalPlanTeam').find('tr').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          self.removeClass('danger');
          self.addClass('active');
          self.find('td').last().children().show();
          if (log.getActions().team[self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + log.getActions().team[self.data("id")].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          self.removeClass('active');
          self.addClass('danger');
          self.removeClass('success');
          if (log.getActions().team[self.data("id")] && log.getActions().team[self.data("id")].history) {
            $(this).parent().attr("title", "<p>" + log.getActions().team[self.data("id")].history[0] + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });
      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if (!any) {
        self.removeClass('danger');
        self.removeClass('active');
        self.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      base.wireUpTooltips();
    });

    base.wireUpTooltips();
  },

  displayPersonalisedTeamActionPlan: function(parentElem) {
    var plans = base.sortSuggestions(base.addDisagreePersonalTeam(log.listPlans("team", data.pathwayId)));

    /*base.createPanelShow(actionPlanList, parentElem, {
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }, {
      "action-plan": $('#action-plan').html(),
      "action-plan-item": $('#action-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });*/

    var tmpl = require('templates/action-plan-list');
    parentElem.html(tmpl({
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }));

    tap.updateTeamSapRows();
  },

  mergeTeamStuff: function(suggestions) {
    var teamActions = log.listActions();
    if (!teamActions.team) return suggestions;

    suggestions = tap.addDisagree(suggestions, teamActions, "team");
    return suggestions;
  },

  launchModal: function(label, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var reasons = [{
      "reason": "We've already done this",
      "value": "done"
    }, {
      "reason": "It wouldn't work",
      "value": "nowork"
    }, {
      "reason": "Other",
      "value": "else"
    }];
    if (reason && reason.reason) {
      for (var i = 0; i < reasons.length; i++) {
        if (reasons[i].reason === reason.reason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    base.launchModal({
      "header": "Disagree with a suggested action",
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Enter free-text here...",
      "reasons": reasons
    }, label, value, reason ? reason.reasonText : null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  },

  addDisagree: function(suggestions, actions, id) {
    for (var i = 0; i < suggestions.length; i++) {
      if (actions[id][suggestions[i].id]) {
        if (actions[id][suggestions[i].id].agree) {
          suggestions[i].agree = true;
          suggestions[i].disagree = false;
        } else if (actions[id][suggestions[i].id].agree === false) {
          suggestions[i].agree = false;
          suggestions[i].disagree = true;
        }
        if (actions[id][suggestions[i].id].done) suggestions[i].done = actions[id][suggestions[i].id].done;
        else suggestions[i].done = false;
      }
    }
    return suggestions;
  }

};

module.exports = tap;

});

require.register("panels/welcome.js", function(exports, require, module) {
var base = require('../base.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  individualActionPlan = require('./individualActionPlan.js'),
  teamActionPlan = require('./teamActionPlan.js'),
  Mustache = require('mustache');

var welcome = {

  wireUpWelcomePage: function(pathwayId, pathwayStage) {
    $('#team-task-panel').on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      log.editAction("team", ACTIONID, null, this.checked);

      if (this.checked) {
        log.recordEvent(pathwayId, "team", "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        base.wireUpTooltips();
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              log.editAction("team", ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              welcome.updateWelcomePage();
            });
          });
        }, 1000);
      }
      welcome.updateWelcomePage();
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      welcome.updateWelcomePage();
    }).on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[1]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        welcome.populate(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {

        log.editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#modal-delete-item').html($($(this).closest('tr').children('td')[1]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        welcome.populate(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        log.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      log.editAction("team", ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      welcome.updateWelcomePage();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          teamActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), log.getReason("team", ACTIONID), true, function() {
            log.editAction("team", ACTIONID, false, null, log.reason);
            welcome.updateWelcomePage();
            base.wireUpTooltips();
          }, null, function() {
            log.ignoreAction("team", ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            welcome.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.ignoreAction("team", ACTIONID);
          other.removeClass("inactive");
        }
      } else if ((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          teamActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), log.getReason("team", ACTIONID), false, function() {
            log.editAction("team", ACTIONID, false, null, log.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            welcome.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editAction("team", ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });

    $('#individual-task-panel').on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      log.editAction(patientId, ACTIONID, null, this.checked);

      if (this.checked) {
        log.recordEvent(pathwayId, patientId, "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        base.wireUpTooltips();
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              log.editAction(patientId, ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              welcome.updateWelcomePage();
            });
          });
        }, 1000);
      }
      welcome.updateWelcomePage();
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      welcome.updateWelcomePage();
    }).on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[2]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        welcome.populate(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {

        log.editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#modal-delete-item').html($($(this).closest('tr').children('td')[2]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        welcome.populate(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        log.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      log.editAction(patientId, ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      welcome.updateWelcomePage();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          individualActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), log.getReason(patientId, ACTIONID), true, function() {
            log.editAction(patientId, ACTIONID, false, null, log.reason);
            welcome.updateWelcomePage();
            base.wireUpTooltips();
          }, null, function() {
            log.ignoreAction(patientId, ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            welcome.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.ignoreAction(patientId, ACTIONID);
          other.removeClass("inactive");
        }
      } else if ((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          individualActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), log.getReason(patientId, ACTIONID), false, function() {
            log.editAction(patientId, ACTIONID, false, null, log.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            welcome.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          log.editAction(patientId, ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });

    welcome.updateWelcomePage();
  },

  updateWelcomePage: function() {
    $('#team-task-panel').add('#individual-task-panel').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });

    $('#team-task-panel').add('#individual-task-panel').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    $('#team-task-panel').add('#individual-task-panel').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text
    $('#team-task-panel').add('#individual-task-panel').find('tr').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          self.removeClass('danger');
          self.addClass('active');
          self.find('td').last().children().show();
          if (log.getActions().team[self.data("id")] && log.getActions().team[self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + log.getActions().team[self.data("id")].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          self.removeClass('active');
          self.addClass('danger');
          self.removeClass('success');
          if (log.getActions().team[self.data("id")] && log.getActions().team[self.data("id")].history) {
            $(this).parent().attr("title", "<p>" + log.getActions().team[self.data("id")].history[0] + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });
      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if (!any) {
        self.removeClass('danger');
        self.removeClass('active');
        self.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      base.wireUpTooltips();
    });

    base.wireUpTooltips();
  },

  populate: function(complete) {

    var k,l;
    //add tasks
    var teamTasks = [];
    var individualTasks = [];

    //Add the team tasks
    for (k in log.listActions("team")) {
      if (log.listActions("team")[k].agree && ((!log.listActions("team")[k].done && !complete) || (log.listActions("team")[k].done && complete))) {
        teamTasks.push({
          "pathway": "N/A",
          "task": {short:log.text[log.listActions("team")[k].id].text},
          "data": log.listActions("team")[k].id,
          "tpId": "team",
          "agree": true,
          "done": complete
        });
      }
    }

    //Add the user added team tasks
    for (k in log.listPlans("team")) {
      if ((!log.listPlans("team")[k].done && !complete) || (log.listPlans("team")[k].done && complete)) {
        teamTasks.push({
          "canEdit": true,
          "pathway": data.pathwayNames[log.listPlans("team")[k].pathwayId],
          "pathwayId": log.listPlans("team")[k].pathwayId,
          "task": {short:log.listPlans("team")[k].text},
          "data": log.listPlans("team")[k].id,
          "agree": log.listPlans("team")[k].agree,
          "disagree": log.listPlans("team")[k].agree === false,
          "done": complete
        });
      }
    }

    //Add individual
    for (k in log.listActions()) {
      if (k === "team") continue;
      for (l in log.listActions()[k]) {
        if (log.listActions()[k][l].agree && ((!log.listActions()[k][l].done && !complete) || (log.listActions()[k][l].done && complete))) {
          individualTasks.push({
            "pathway": "N/A",
            "patientId": k,
            "task": data.patients[k].actions.filter(function(v){
              return v.id === l;
            })[0],
            "pathwayId": log.listPlans()[k][l].pathwayId,
            "data": l,
            "tpId": k,
            "agree": true,
            "done": complete
          });
        }
      }
    }

    //Add custom individual
    for (k in log.listPlans()) {
      if (k === "team") continue;
      for (l in log.listPlans()[k]) {
        if (log.listPlans()[k][l].text && (!log.listPlans()[k][l].done && !complete) || (log.listPlans()[k][l].done && complete)) {
          individualTasks.push({
            "canEdit": true,
            "pathway": data.pathwayNames[log.listPlans()[k][l].pathwayId],
            "pathwayId": log.listPlans()[k][l].pathwayId,
            "patientId": k,
            "tpId": k,
            "task": {short: log.listPlans()[k][l].text},
            "data": l,
            "agree": true,
            "done": complete
          });
        }
      }
    }

    /*var listTemplate = $('#welcome-task-list').html();
    Mustache.parse(listTemplate);
    $('#welcome-tab-content').html(Mustache.render(listTemplate));*/
    var tmpl = require("templates/action-plan-task-list");
    $('#welcome-tab-content').html(tmpl({
      team:{
        "tasks": teamTasks,
        "hasTasks": teamTasks.length > 0
      },
      individual:{
        "tasks": individualTasks,
        "isPatientTable": true,
        "hasTasks": individualTasks.length > 0
      }
    }));

    /*var addTemplate = $('#action-plan').html();
    Mustache.parse(addTemplate);
    var rendered = Mustache.render(addTemplate);
    $('#team-add-plan').html(rendered);*/

    /*var tempMust = $('#welcome-task-items').html();
    var itemTemplate = $('#welcome-task-item').html();
    Mustache.parse(tempMust);
    Mustache.parse(itemTemplate);*/

    $('#team-add-plan').off('click').on('click', '.add-plan', function() {
      var plan = $(this).parent().parent().find('textarea').val();
      var planId = recordPlan("team", plan, "custom");
      $('#team-task-panel').find('table tbody').append(Mustache.render(itemTemplate, {
        "pathway": "",
        "pathwayId": "custom",
        "canEdit": true,
        "task": plan,
        "data": planId,
        "agree": null,
        "done": null
      }, {
        "chk": $('#checkbox-template').html()
      }));
    });

/*
    rendered = Mustache.render(tempMust, {
      "tasks": teamTasks,
      "hasTasks": teamTasks.length > 0
    }, {
      "task-item": itemTemplate,
      "chk": $('#checkbox-template').html()
    });
    $('#team-task-panel').children().not(":first").remove();
    $('#team-task-panel').append(rendered);

    rendered = Mustache.render(tempMust, {
      "tasks": individualTasks,
      "isPatientTable": true,
      "hasTasks": individualTasks.length > 0
    }, {
      "task-item": itemTemplate,
      "chk": $('#checkbox-template').html()
    });
    $('#individual-task-panel').children().not(":first").remove();
    $('#individual-task-panel').append(rendered);*/

    welcome.wireUpWelcomePage();
  }

};

module.exports = welcome;

});

require.register("panels/wrapper.js", function(exports, require, module) {
var data = require('../data.js'),
  chart = require('../chart.js');

var bd = {

  wireUp: function() {

  },

  show: function(panel, isAppend, subPanels, isDownText, isUpText) {

    var sectionElement = $('<div class="section"></div>');

    if (isAppend) panel.append(sectionElement);
    else panel.html(sectionElement);

    subPanels.forEach(function(v) {
      var args = v.args;
      args.unshift(true);
      args.unshift(sectionElement);
      v.show.apply(null, args);
    });

    if (isUpText) sectionElement.prepend($('<div class="fp-controlArrow fp-up"><div>' + isUpText + '</div></div>'));
    if (isDownText) sectionElement.append($('<div class="fp-controlArrow fp-down"><div>' + isDownText + '</div></div>'));

  }

};

module.exports = bd;

});

require.register("script.js", function(exports, require, module) {
/*jslint browser: true*/
/*jshint -W055 */
/*global console, alert*/

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar in layout and content
 *  to all the others.
 */

var template = require('./template'),
  main = require('./main');

//TODO not sure why i did this - was in local variable
//maybe a separate module
//window.location = window.history.location || window.location;
/********************************************************
 *** Shows the pre-load image and slowly fades it out. ***
 ********************************************************/

var App = {
  init: function init() {
    $(window).load(function() {
      $('.loading-container').fadeOut(1000, function() {
        //$(this).remove();
      });
    });

    /******************************************
     *** This happens when the page is ready ***
     ******************************************/
    $(document).on('ready', function() {
      //Grab the hash if exists - IE seems to forget it
      main.hash = location.hash;

      //CHANGE THIS - added to spoof login
      location.hash = "";
      main.hash = "";
      $('#signin').on('click', function() {
        if ($('#inpEmail').val().length < 8) alert("Please enter your email address.");
        else {
          var dataToSend = {
            event: {
              what: "login",
              when: new Date().getTime(),
              who: $("#inpEmail").val(),
              detail: [
                { key: "href", value: location.href }
              ]
            }
          };
          console.log(dataToSend);
          $.ajax({
            type: "POST",
            url: "http://130.88.250.206:9100/pingr",
            data: JSON.stringify(dataToSend),
            success: function(d) { console.log(d); },
            dataType: "json",
            contentType: "application/json"
          });

          var obj = JSON.parse(localStorage.bb);
          obj.email = $('#inpEmail').val();
          localStorage.bb = JSON.stringify(obj);


          history.pushState(null, null, '#overview');
          template.loadContent('#overview');
        }
      });
      $('#inpEmail').on('keyup', function(e) {
        var code = e.which;
        if (code == 13) {
          $('#signin').click();
        }
      });

      //Load the data then wire up the events on the page
      main.init();

      //Sorts out the data held locally in the user's browser
      if (!localStorage.bb) localStorage.bb = JSON.stringify({});
      var obj = JSON.parse(localStorage.bb);
      if (!obj.version || obj.version !== main.version) {
        localStorage.bb = JSON.stringify({
          "version": main.version
        });
      }

      if (JSON.parse(localStorage.bb).email) {
        $('#inpEmail').val(JSON.parse(localStorage.bb).email);
      }

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

      //ensure on first load the login screen is cached to the history
      history.pushState(null, null, '');
    });
  }
};

module.exports = App;

});

require.register("template.js", function(exports, require, module) {
var data = require('./data'),
  lookup = require('./lookup'),
  base = require('./base'),
  patientList = require('./panels/patientList'),
  teamActionPlan = require('./panels/teamActionPlan'),
  welcome = require('./panels/welcome'),
  layout = require('./layout'),
  overview = require('./views/overview'),
  indicatorView = require('./views/indicator'),
  patientView = require('./views/patient'),
  actionPlan = require('./views/actions'),
  Mustache = require('mustache');

var template = {

  loadContent: function(hash, isPoppingState) {
    base.hideTooltips();

    var i, pathwayId, pathwayStage, standard, indicator, patientId;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    if (hash === '') {
      base.clearBox();
      base.showFooter();
      layout.showPage('login');
      $('html').removeClass('scroll-bar');
    } else {
      base.hideFooter();
      $('html').addClass('scroll-bar');
      var params = {};
      var urlBits = hash.split('/');

      if (hash.indexOf('?') > -1) {
        hash.split('?')[1].split('&').forEach(function(param) {
          var elems = param.split("=");
          params[elems[0]] = elems[1];
        });
        urlBits = hash.split('?')[0].split('/');
      }

      if (urlBits[0] === "#overview" && !urlBits[1]) {

        overview.create(template.loadContent);

      } else if (urlBits[0] === "#indicators") {

        indicatorView.create(urlBits[1], urlBits[2], urlBits[3], params.tab || "trend", template.loadContent);

      } else if (urlBits[0] === "#help") {
        layout.view="HELP";
        lookup.suggestionModalText = "Screen: Help\n===========\n";
        base.clearBox();
        base.selectTab("");
        layout.showPage('help-page');

        layout.showHeaderBarItems();

      } else if (urlBits[0] === "#contact") {
        layout.view="CONTACT";
        lookup.suggestionModalText = "Screen: Contact us\n===========\n";
        base.clearBox();
        base.selectTab("");
        layout.showPage('contact-page');

        layout.showHeaderBarItems();

      } else if (urlBits[0] === "#patient") {

        //create(pathwayId, pathwayStage, standard, patientId)
        patientView.create(urlBits[2], urlBits[3], urlBits[4], urlBits[1], template.loadContent);

      } else if (urlBits[0] === "#patients") {

        patientId = urlBits[1];

        patientView.create(null, null, null, patientId, template.loadContent);

      } else if (urlBits[0] === "#agreedactions") {

        actionPlan.create();

      } else {
        //if screen not in correct segment then select it
        alert("shouldn't get here");

        base.wireUpTooltips();
      }

      $('#suggs').off('click').on('click', function(e){
        base.launchSuggestionModal();
        e.preventDefault();
      });
    }

    lookup.currentUrl = hash;
  },

  //Show the overview page for a disease
  showOverview: function(disease) {
    data.pathwayId = disease;

    layout.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(disease));

    $('aside li ul li').removeClass('active');
    $('aside a[href="#main/' + disease + '"]:contains("Overview")').parent().addClass('active');

    $('#mainTitle').show();
    base.updateTitle(data.text.pathways[data.pathwayId]["display-name"] + ": Overview (practice-level data)");

    //Show overview panels
    template.showOverviewPanels();
    teamActionPlan.show(farRightPanel);
  },

  showOverviewPanels: function() {
    base.switchTo221Layout();

    template.showPanel(lookup.categories.diagnosis.name, topLeftPanel, true);
    template.showPanel(lookup.categories.monitoring.name, topRightPanel, true);
    template.showPanel(lookup.categories.treatment.name, bottomLeftPanel, true);
    template.showPanel(lookup.categories.exclusions.name, bottomRightPanel, true);

    base.wireUpTooltips();
  },

  showPanel: function(pathwayStage, location, enableHover) {
    base.showPathwayStageOverviewPanel(location, enableHover, data.pathwayId, pathwayStage);

    if (enableHover) template.highlightOnHoverAndEnableSelectByClick(location);
    else location.children('div').addClass('unclickable');
  },

  highlightOnHoverAndEnableSelectByClick: function(panelSelector) {
    panelSelector.children('div').removeClass('unclickable').on('mouseover', function() {
      $(this).removeClass('panel-default');
    }).on('mouseout', function(e) {
      $(this).addClass('panel-default');
    }).on('click', 'tr.standard-row', function(e) {
      history.pushState(null, null, '#main/' + data.pathwayId + '/' + $(this).closest('.panel').data('stage') + '/no/' + $(this).data('standard'));
      template.loadContent('#main/' + data.pathwayId + '/' + $(this).closest('.panel').data('stage') + '/no/' + $(this).data('standard'), true);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    }).on('click', function(e) {
      // keep the link in the browser history
      history.pushState(null, null, '#main/' + data.pathwayId + '/' + $(this).data('stage') + '/no');
      template.loadContent('#main/' + data.pathwayId + '/' + $(this).data('stage') + '/no', true);
      // do not give a default action
      return false;
    });

  },

  displaySelectedPatient: function(id) {
    var nhs = data.patLookup ? data.patLookup[id] : id;

    history.pushState(null, null, '#patients/' + id);
    template.loadContent('#patients/' + id, true);

    $('.list-item').removeClass('highlighted');
    $('.list-item:has(button[data-clipboard-text=' + nhs + '])').addClass('highlighted');

    //scroll to patients
    $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0, $('#patients td').filter(function() {
      return $(this).text().trim() === nhs;
    }).position().top - 140);
  },

  shouldWeFade: function(oldHash, newHash) {
    oldHash = oldHash.split('/');
    newHash = newHash.split('/');

    if (oldHash[0] === newHash[0] && oldHash[1] === newHash[1] && oldHash[2] === newHash[2] && oldHash[0] && newHash[0]) return false;
    return true;
  }

};

module.exports = template;

});

require.register("templates/action-plan-list.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (hasSuggestions, suggestions, undefined) {
jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};
jade_mixins["actionPlanItem"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.attr("data-team-or-patient-id", suggestion.tpid ? suggestion.tpId : undefined, true, false)) + (jade.cls(['suggestion','active',suggestion.done ? 'success' : ''], [null,null,true])) + "><td><span>" + (null == (jade_interp = suggestion.text) ? "" : jade_interp) + "</span><div data-toggle=\"buttons\" class=\"btn-group btn-hover-show-group pull-right\"><i data-toggle=\"tooltip\" data-placement=\"top\" title=\"Edit plan\" class=\"fa fa-pencil edit-plan clickable\"></i><i data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete plan\" class=\"fa fa-trash delete-plan clickable\"></i></div></td><td>");
jade_mixins["thumbs"](suggestion);
buf.push("</td></tr>");
};
if ( hasSuggestions)
{
buf.push("<table class=\"table\"><thead><tr><th>Suggested by you</th><th style=\"width: 105px\">Add to action plan?</th></tr></thead><tbody>");
// iterate suggestions
;(function(){
  var $$obj = suggestions;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var suggestion = $$obj[$index];

jade_mixins["actionPlanItem"](suggestion);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var suggestion = $$obj[$index];

jade_mixins["actionPlanItem"](suggestion);
    }

  }
}).call(this);

buf.push("</tbody></table>");
}}.call(this,"hasSuggestions" in locals_for_with?locals_for_with.hasSuggestions:typeof hasSuggestions!=="undefined"?hasSuggestions:undefined,"suggestions" in locals_for_with?locals_for_with.suggestions:typeof suggestions!=="undefined"?suggestions:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/action-plan-task-list.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (individual, team) {
jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};
jade_mixins["checkbox"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ( !suggestion.done)
{
buf.push("<label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to indicate you have implemented this action in your practice and remove it from your awaiting implementation list\" class=\"cr-styled\"><input type=\"checkbox\"" + (jade.attr("checked", suggestion.done ? 'checked' : undefined, true, false)) + "/><i class=\"fa\"></i></label>");
}
else
{
buf.push("<button data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"You marked this as complete - click to undo\" class=\"btn btn-xs btn-warning btn-undo\">Undo</button>");
}
};
jade_mixins["actionPlanTaskListItem"] = jade_interp = function(thing){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ( thing.task)
{
buf.push("<tr" + (jade.attr("data-pathway-id", thing.pathwayId, true, false)) + (jade.attr("data-id", thing.task.id, true, false)) + (jade.attr("data-team-or-patient-id", thing.tpid ? thing.tpId : undefined, true, false)) + " class=\"suggestion\"><td><span>" + (jade.escape(null == (jade_interp = thing.pathway) ? "" : jade_interp)) + "</span></td>");
if ( thing.patientId)
{
buf.push("<td><span>" + (jade.escape(null == (jade_interp = thing.patientId) ? "" : jade_interp)) + "</span></td>");
}
buf.push("<td><span" + (jade.attr("data-subsection", thing.subsection, true, false)) + "><strong class=\"black f20\">" + (null == (jade_interp = thing.task.short) ? "" : jade_interp) + "</strong>");
if ( thing.canEdit)
{
buf.push("<div data-toggle=\"buttons\" class=\"btn-group btn-hover-show-group pull-right\"><i data-toggle=\"tooltip\" data-placement=\"top\" title=\"Edit plan\" class=\"fa fa-pencil edit-plan clickable\"></i><i data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete plan\" class=\"fa fa-trash delete-plan clickable\"></i></div>");
}
if ( thing.task.long || thing.task.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more\">Show more <i class=\"fa fa-caret-down\"></i></a>");
}
buf.push("</span></td><td>");
jade_mixins["thumbs"](thing);
buf.push("</td><td>");
jade_mixins["checkbox"](thing);
buf.push("</td></tr>");
if ( thing.task.long)
{
buf.push("<tr" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more-row\"><td colspan=\"3\">" + (null == (jade_interp = thing.task.long) ? "" : jade_interp) + "</td>");
if ( !thing.task.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a>");
}
buf.push("</tr>");
}
if ( thing.task.reason)
{
buf.push("<tr" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more-row\"><td colspan=\"3\">" + (null == (jade_interp = thing.task.reason) ? "" : jade_interp) + "<br/><a" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a></td></tr>");
}
}
else
{
buf.push(jade.escape(null == (jade_interp = thing.task) ? "" : jade_interp));
}
};
jade_mixins["actionPlanTaskList"] = jade_interp = function(thing){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ( thing.hasTasks)
{
buf.push("<table class=\"table\"><thead><tr><th style=\"width: 150px\">Condition</th>");
if ( thing.isPatientTable)
{
buf.push("<th>NHS number</th>");
}
buf.push("<th>Planned action</th><th style=\"width: 105px\">Agree?</th><th style=\"width: 106px\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to indicate you have implemented this action in your practice and remove it from your awaiting implementation list\">Action implemented?</th></tr></thead><tbody>");
// iterate thing.tasks
;(function(){
  var $$obj = thing.tasks;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var task = $$obj[$index];

jade_mixins["actionPlanTaskListItem"](task);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var task = $$obj[$index];

jade_mixins["actionPlanTaskListItem"](task);
    }

  }
}).call(this);

buf.push("</tbody></table>");
}
else
{
buf.push("<div class=\"panel-body\">You currently have no outstanding planned actions</div>");
}
};
buf.push("<div class=\"container-fluid\"><div class=\"row\"><div id=\"team-task-panel\" class=\"panel panel-info\"><div class=\"panel-heading\">Practice-level      </div>");
jade_mixins["actionPlanTaskList"](team);
buf.push("</div></div><div class=\"row\"><div id=\"team-add-plan\" style=\"padding-bottom: 15px;margin-top: -10px;\"><form onsubmit=\"return false;\"><div class=\"form-group\"><textarea rows=\"3\" style=\"resize:none\" placeholder=\"Enter your own improvement action then click 'add' below...\" class=\"form-control\"></textarea></div><button class=\"btn btn-info add-plan\">Add</button></form></div></div><div class=\"row\"><div id=\"individual-task-panel\" class=\"panel panel-warning\"><div class=\"panel-heading\">Individual patient</div>");
jade_mixins["actionPlanTaskList"](individual);
buf.push("</div></div></div><div id=\"editPlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"exampleModalLabel\" class=\"modal-title\">Edit Plan</h4></div><div class=\"modal-body\"><div class=\"form-group\"><input id=\"editActionPlanItem\" type=\"text\" class=\"form-control\"/></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary save-plan\">Save</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div><div id=\"deletePlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"deleteModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"deleteModalLabel\" class=\"modal-title\">Delete a suggested action you added</h4></div><div class=\"modal-body\"><p><strong>You indicated that you want to delete:</strong></p><span id=\"modal-delete-item\" style=\"font-style:italic\"></span><br/><p><strong>Are you sure?</strong></p></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-danger delete-plan\">Delete</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div>");}.call(this,"individual" in locals_for_with?locals_for_with.individual:typeof individual!=="undefined"?individual:undefined,"team" in locals_for_with?locals_for_with.team:typeof team!=="undefined"?team:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/indicator-headline.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (performance, positiveMessage, tagline, target) {
buf.push("<ul><li class=\"perf-bullet\"><b>" + (null == (jade_interp = performance.percentage + '%') ? "" : jade_interp) + "</b><span>" + (null == (jade_interp = ' (' + performance.fraction + ') ' + tagline) ? "" : jade_interp) + "</span></li><li class=\"perf-bullet\">The target for this quality indicator is <b>" + (jade.escape(null == (jade_interp = target) ? "" : jade_interp)) + "</b></li><li class=\"perf-bullet perf-bullet-msg\">" + (null == (jade_interp = positiveMessage) ? "" : jade_interp) + "</li></ul>");}.call(this,"performance" in locals_for_with?locals_for_with.performance:typeof performance!=="undefined"?performance:undefined,"positiveMessage" in locals_for_with?locals_for_with.positiveMessage:typeof positiveMessage!=="undefined"?positiveMessage:undefined,"tagline" in locals_for_with?locals_for_with.tagline:typeof tagline!=="undefined"?tagline:undefined,"target" in locals_for_with?locals_for_with.target:typeof target!=="undefined"?target:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/individual-action-plan.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"affix panel panel-default\"><div class=\"clearfix panel-heading\">Recommended actions: <span style=\"color: black;font-weight:bold\"> Patient-level </span></div><div id=\"tab-plan-individual\" class=\"panel-body fit-to-screen-height\"><div id=\"advice-placeholder\">Select an individual patient from the patient panel to view advice</div><div id=\"advice-list\"></div><div id=\"personalPlanIndividual\"></div></div></div><div id=\"editPlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"exampleModalLabel\" class=\"modal-title\">Edit Plan</h4></div><div class=\"modal-body\"><div class=\"form-group\"><input id=\"editActionPlanItem\" type=\"text\" class=\"form-control\"/></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary save-plan\">Save</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div><div id=\"deletePlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"deleteModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"deleteModalLabel\" class=\"modal-title\">Delete a suggested action you added</h4></div><div class=\"modal-body\"><p><strong>You indicated that you want to delete:</strong></p><span id=\"modal-delete-item\" style=\"font-style:italic\"></span><br/><p><strong>Are you sure?</strong></p></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-danger delete-plan\">Delete</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/individual.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (noSuggestions, suggestions, undefined) {
jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};
if ( noSuggestions)
{
buf.push("<p>There are no improvement action suggestions from PINGR because this patient has either met the quality standard or it is not relevant to them.</p>");
}
else
{
buf.push("<table id=\"individual-suggested-actions-table\" class=\"table\"><thead><tr><th></th><th style=\"width: 105px\"></th></tr></thead><tbody>");
var alt = false
// iterate suggestions
;(function(){
  var $$obj = suggestions;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var suggestion = $$obj[$index];

buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.attr("data-team-or-patient-id", suggestion.tpid ? suggestion.tpId : undefined, true, false)) + (jade.cls(['suggestion',alt ? 'alternate-row': ''], [null,true])) + "><td><span" + (jade.attr("data-subsection", suggestion.subsection, true, false)) + "><strong class=\"black f20\">" + (null == (jade_interp = suggestion.short) ? "" : jade_interp) + "</strong>");
if ( suggestion.long || suggestion.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", suggestion.id, true, false)) + " class=\"show-more\">Show more <i class=\"fa fa-caret-down\"></i></a>");
}
buf.push("</span></td><td>");
jade_mixins["thumbs"](suggestion);
buf.push("</td></tr>");
if ( suggestion.long)
{
buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.cls(['show-more-row',alt ? 'alternate-row': ''], [null,true])) + "><td colspan=\"2\">" + (null == (jade_interp = suggestion.long) ? "" : jade_interp) + "</td>");
if ( !suggestion.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", suggestion.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a>");
}
buf.push("</tr>");
}
if ( suggestion.reason)
{
buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.cls(['show-more-row',alt ? 'alternate-row': ''], [null,true])) + "><td colspan=\"2\">" + (null == (jade_interp = suggestion.reason) ? "" : jade_interp) + "<br/><a" + (jade.attr("data-id", suggestion.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a></td></tr>");
}
alt = !alt
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var suggestion = $$obj[$index];

buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.attr("data-team-or-patient-id", suggestion.tpid ? suggestion.tpId : undefined, true, false)) + (jade.cls(['suggestion',alt ? 'alternate-row': ''], [null,true])) + "><td><span" + (jade.attr("data-subsection", suggestion.subsection, true, false)) + "><strong class=\"black f20\">" + (null == (jade_interp = suggestion.short) ? "" : jade_interp) + "</strong>");
if ( suggestion.long || suggestion.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", suggestion.id, true, false)) + " class=\"show-more\">Show more <i class=\"fa fa-caret-down\"></i></a>");
}
buf.push("</span></td><td>");
jade_mixins["thumbs"](suggestion);
buf.push("</td></tr>");
if ( suggestion.long)
{
buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.cls(['show-more-row',alt ? 'alternate-row': ''], [null,true])) + "><td colspan=\"2\">" + (null == (jade_interp = suggestion.long) ? "" : jade_interp) + "</td>");
if ( !suggestion.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", suggestion.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a>");
}
buf.push("</tr>");
}
if ( suggestion.reason)
{
buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.cls(['show-more-row',alt ? 'alternate-row': ''], [null,true])) + "><td colspan=\"2\">" + (null == (jade_interp = suggestion.reason) ? "" : jade_interp) + "<br/><a" + (jade.attr("data-id", suggestion.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a></td></tr>");
}
alt = !alt
    }

  }
}).call(this);

buf.push("</tbody></table>");
}
buf.push("<form onsubmit=\"return false;\"><div class=\"form-group\"><textarea rows=\"3\" style=\"resize:none\" placeholder=\"Enter your own improvement action then click 'add' below...\" class=\"form-control\"></textarea></div><button class=\"btn btn-info add-plan\">Add</button></form>");}.call(this,"noSuggestions" in locals_for_with?locals_for_with.noSuggestions:typeof noSuggestions!=="undefined"?noSuggestions:undefined,"suggestions" in locals_for_with?locals_for_with.suggestions:typeof suggestions!=="undefined"?suggestions:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/action-plan-item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};





;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/action-plan-task-list-item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};
jade_mixins["checkbox"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ( !suggestion.done)
{
buf.push("<label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to indicate you have implemented this action in your practice and remove it from your awaiting implementation list\" class=\"cr-styled\"><input type=\"checkbox\"" + (jade.attr("checked", suggestion.done ? 'checked' : undefined, true, false)) + "/><i class=\"fa\"></i></label>");
}
else
{
buf.push("<button data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"You marked this as complete - click to undo\" class=\"btn btn-xs btn-warning btn-undo\">Undo</button>");
}
};









































;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/action-plan-task-list.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};
jade_mixins["checkbox"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ( !suggestion.done)
{
buf.push("<label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to indicate you have implemented this action in your practice and remove it from your awaiting implementation list\" class=\"cr-styled\"><input type=\"checkbox\"" + (jade.attr("checked", suggestion.done ? 'checked' : undefined, true, false)) + "/><i class=\"fa\"></i></label>");
}
else
{
buf.push("<button data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"You marked this as complete - click to undo\" class=\"btn btn-xs btn-warning btn-undo\">Undo</button>");
}
};
jade_mixins["actionPlanTaskListItem"] = jade_interp = function(thing){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ( thing.task)
{
buf.push("<tr" + (jade.attr("data-pathway-id", thing.pathwayId, true, false)) + (jade.attr("data-id", thing.task.id, true, false)) + (jade.attr("data-team-or-patient-id", thing.tpid ? thing.tpId : undefined, true, false)) + " class=\"suggestion\"><td><span>" + (jade.escape(null == (jade_interp = thing.pathway) ? "" : jade_interp)) + "</span></td>");
if ( thing.patientId)
{
buf.push("<td><span>" + (jade.escape(null == (jade_interp = thing.patientId) ? "" : jade_interp)) + "</span></td>");
}
buf.push("<td><span" + (jade.attr("data-subsection", thing.subsection, true, false)) + "><strong class=\"black f20\">" + (null == (jade_interp = thing.task.short) ? "" : jade_interp) + "</strong>");
if ( thing.canEdit)
{
buf.push("<div data-toggle=\"buttons\" class=\"btn-group btn-hover-show-group pull-right\"><i data-toggle=\"tooltip\" data-placement=\"top\" title=\"Edit plan\" class=\"fa fa-pencil edit-plan clickable\"></i><i data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete plan\" class=\"fa fa-trash delete-plan clickable\"></i></div>");
}
if ( thing.task.long || thing.task.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more\">Show more <i class=\"fa fa-caret-down\"></i></a>");
}
buf.push("</span></td><td>");
jade_mixins["thumbs"](thing);
buf.push("</td><td>");
jade_mixins["checkbox"](thing);
buf.push("</td></tr>");
if ( thing.task.long)
{
buf.push("<tr" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more-row\"><td colspan=\"3\">" + (null == (jade_interp = thing.task.long) ? "" : jade_interp) + "</td>");
if ( !thing.task.reason)
{
buf.push("<br/><a" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a>");
}
buf.push("</tr>");
}
if ( thing.task.reason)
{
buf.push("<tr" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more-row\"><td colspan=\"3\">" + (null == (jade_interp = thing.task.reason) ? "" : jade_interp) + "<br/><a" + (jade.attr("data-id", thing.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a></td></tr>");
}
}
else
{
buf.push(jade.escape(null == (jade_interp = thing.task) ? "" : jade_interp));
}
};
























;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/checkbox.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;











;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/delete-plan-modal.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"deletePlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"deleteModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"deleteModalLabel\" class=\"modal-title\">Delete a suggested action you added</h4></div><div class=\"modal-body\"><p><strong>You indicated that you want to delete:</strong></p><span id=\"modal-delete-item\" style=\"font-style:italic\"></span><br/><p><strong>Are you sure?</strong></p></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-danger delete-plan\">Delete</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/edit-plan-modal.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"editPlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"exampleModalLabel\" class=\"modal-title\">Edit Plan</h4></div><div class=\"modal-body\"><div class=\"form-group\"><input id=\"editActionPlanItem\" type=\"text\" class=\"form-control\"/></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary save-plan\">Save</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/patient-list-header-item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;































;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/personal-action-plan.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<form onsubmit=\"return false;\"><div class=\"form-group\"><textarea rows=\"3\" style=\"resize:none\" placeholder=\"Enter your own improvement action then click 'add' below...\" class=\"form-control\"></textarea></div><button class=\"btn btn-info add-plan\">Add</button></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/mixins/thumbs.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;




;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/modal-suggestion.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (text) {
buf.push("<div tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog modal-dialog-top\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"modalLabel\" class=\"modal-title\">Suggestions, comments and bugs</h4></div><div class=\"modal-body\"><form><div class=\"form-group\"><div class=\"no\">Please send us any suggestions, comments or bugs you find with PINGR. This could be problems with the data or ideas on how we could improve it</div><div class=\"text-danger small\">But please don't send us any patient identifiable information - e.g. NHS number, name, date of birth.</div><textarea rows=\"10\" style=\"resize:none\" class=\"form-control\">" + (jade.escape(null == (jade_interp = '===========\nThis text tells us which part of PINGR you’re referring to – please don’t delete it!\n' + text) ? "" : jade_interp)) + "</textarea></div><button type=\"submit\" class=\"btn btn-primary save-plan\">Send</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></form></div><div class=\"modal-footer\"></div></div></div></div>");}.call(this,"text" in locals_for_with?locals_for_with.text:typeof text!=="undefined"?text:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/modal-why.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (hasReasons, header, isUndo, item, placeholder, reasons, undefined) {
buf.push("<div tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"modalLabel\" class=\"modal-title\">" + (jade.escape(null == (jade_interp = header) ? "" : jade_interp)) + "</h4></div><div class=\"modal-body\">");
if ( item)
{
buf.push("<label>You have disagreed with the following suggested action:</label><p></p><span style=\"font-style:italic\">" + (jade.escape(null == (jade_interp = item) ? "" : jade_interp)) + "</span>");
}
buf.push("<form><div class=\"form-group\"><p></p><label>Why?");
// iterate reasons
;(function(){
  var $$obj = reasons;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var reason = $$obj[$index];

buf.push("<div class=\"radio\"><label><input type=\"radio\" name=\"reason\"" + (jade.attr("value", reason.reason, true, false)) + (jade.attr("checked", reason.checked ? 'checked' : undefined, true, false)) + " required=\"\"/>" + (jade.escape(null == (jade_interp = reason.reason) ? "" : jade_interp)) + "</label></div>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var reason = $$obj[$index];

buf.push("<div class=\"radio\"><label><input type=\"radio\" name=\"reason\"" + (jade.attr("value", reason.reason, true, false)) + (jade.attr("checked", reason.checked ? 'checked' : undefined, true, false)) + " required=\"\"/>" + (jade.escape(null == (jade_interp = reason.reason) ? "" : jade_interp)) + "</label></div>");
    }

  }
}).call(this);

buf.push("</label></div><div class=\"form-group\"><label>" + (jade.escape(null == (jade_interp = 'Please tell us more' + hasReasons ? '- whatever your selection above:' : '') ? "" : jade_interp)) + "</label><textarea rows=\"3\" style=\"resize:none\"" + (jade.attr("placeholder", placeholder, true, false)) + " class=\"form-control\"></textarea></div><button type=\"submit\" class=\"btn btn-primary save-plan\">Save</button>");
if ( isUndo)
{
buf.push("<button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-warning undo-plan\">Undo disagree</button>");
}
buf.push("<button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></form></div><div class=\"modal-footer\"></div></div></div></div>");}.call(this,"hasReasons" in locals_for_with?locals_for_with.hasReasons:typeof hasReasons!=="undefined"?hasReasons:undefined,"header" in locals_for_with?locals_for_with.header:typeof header!=="undefined"?header:undefined,"isUndo" in locals_for_with?locals_for_with.isUndo:typeof isUndo!=="undefined"?isUndo:undefined,"item" in locals_for_with?locals_for_with.item:typeof item!=="undefined"?item:undefined,"placeholder" in locals_for_with?locals_for_with.placeholder:typeof placeholder!=="undefined"?placeholder:undefined,"reasons" in locals_for_with?locals_for_with.reasons:typeof reasons!=="undefined"?reasons:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/overview-table.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (indicators, undefined) {
buf.push("<div class=\"panel panel-default\"><div class=\"panel-body pastel-pink\"><table class=\"table\"><thead><tr><th>Indicator</th><th>Performance</th><th>Target</th><th>Benchmark</th><th>Change</th><th>Trend</th></tr></thead><tbody>");
var alt=false
// iterate indicators
;(function(){
  var $$obj = indicators;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var indicator = $$obj[$index];

buf.push("<tr" + (jade.attr("data-id", indicator.id, true, false)) + " data-toggle=\"tooltip\" data-placement=\"left\" title=\"Click for more detail\"" + (jade.cls(['standard-row',alt ? 'alternate-row': ''], [null,true])) + "><td><strong>" + (jade.escape(null == (jade_interp = indicator.name) ? "" : jade_interp)) + "</strong><br/><a" + (jade.attr("data-id", indicator.id, true, false)) + " class=\"show-more\">Show more <i class=\"fa fa-caret-down\"></i></a></td><td><strong" + (jade.cls([indicator.aboveTarget ? 'text-success' : 'text-danger'], [true])) + ">" + (jade.escape(null == (jade_interp = indicator.performance.percentage + '%') ? "" : jade_interp)) + "</strong><span>" + (jade.escape(null == (jade_interp = ' (' + indicator.performance.fraction + ')') ? "" : jade_interp)) + "</span></td><td>" + (jade.escape(null == (jade_interp = indicator.target) ? "" : jade_interp)) + "</td><td>" + (jade.escape(null == (jade_interp = indicator.benchmark) ? "" : jade_interp)) + "</td><td>");
if ( indicator.up)
{
buf.push("<i class=\"fa fa-2x fa-caret-up\"></i>");
}
else
{
buf.push("<i class=\"fa fa-2x fa-caret-down\"></i>");
}
buf.push("</td><td><span class=\"inlinesparkline\">" + (jade.escape(null == (jade_interp = indicator.trend) ? "" : jade_interp)) + "</span></td></tr><tr" + (jade.attr("data-id", indicator.id, true, false)) + (jade.cls(['show-more-row',alt ? 'alternate-row': ''], [null,true])) + "><td colspan=\"6\">" + (null == (jade_interp = indicator.description) ? "" : jade_interp) + "<br/><a" + (jade.attr("data-id", indicator.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a></td></tr>");
alt = !alt
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var indicator = $$obj[$index];

buf.push("<tr" + (jade.attr("data-id", indicator.id, true, false)) + " data-toggle=\"tooltip\" data-placement=\"left\" title=\"Click for more detail\"" + (jade.cls(['standard-row',alt ? 'alternate-row': ''], [null,true])) + "><td><strong>" + (jade.escape(null == (jade_interp = indicator.name) ? "" : jade_interp)) + "</strong><br/><a" + (jade.attr("data-id", indicator.id, true, false)) + " class=\"show-more\">Show more <i class=\"fa fa-caret-down\"></i></a></td><td><strong" + (jade.cls([indicator.aboveTarget ? 'text-success' : 'text-danger'], [true])) + ">" + (jade.escape(null == (jade_interp = indicator.performance.percentage + '%') ? "" : jade_interp)) + "</strong><span>" + (jade.escape(null == (jade_interp = ' (' + indicator.performance.fraction + ')') ? "" : jade_interp)) + "</span></td><td>" + (jade.escape(null == (jade_interp = indicator.target) ? "" : jade_interp)) + "</td><td>" + (jade.escape(null == (jade_interp = indicator.benchmark) ? "" : jade_interp)) + "</td><td>");
if ( indicator.up)
{
buf.push("<i class=\"fa fa-2x fa-caret-up\"></i>");
}
else
{
buf.push("<i class=\"fa fa-2x fa-caret-down\"></i>");
}
buf.push("</td><td><span class=\"inlinesparkline\">" + (jade.escape(null == (jade_interp = indicator.trend) ? "" : jade_interp)) + "</span></td></tr><tr" + (jade.attr("data-id", indicator.id, true, false)) + (jade.cls(['show-more-row',alt ? 'alternate-row': ''], [null,true])) + "><td colspan=\"6\">" + (null == (jade_interp = indicator.description) ? "" : jade_interp) + "<br/><a" + (jade.attr("data-id", indicator.id, true, false)) + " class=\"show-more\">Show less <i class=\"fa fa-caret-up\"></i></a></td></tr>");
alt = !alt
    }

  }
}).call(this);

buf.push("</tbody></table></div></div>");}.call(this,"indicators" in locals_for_with?locals_for_with.indicators:typeof indicators!=="undefined"?indicators:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/patient-list-wrapper.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"panel panel-default\"><div class=\"panel-body\"><div id=\"patients\"></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/patient-list.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (header, n, patients, undefined) {
jade_mixins["header"] = jade_interp = function(item){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<th style=\"min-width:90px\" data-toggle=\"tooltip\"" + (jade.attr("title", item.tooltip, true, false)) + (jade.cls(['sortable',item.direction], [null,true])) + ">");
if ( item.titleHTML)
{
buf.push(null == (jade_interp = item.titleHTML) ? "" : jade_interp);
}
else
{
buf.push(null == (jade_interp = item.title + ' ') ? "" : jade_interp);
}
if ( !item.isUnSortable)
{
if ( item.isSorted)
{
if ( item.isAsc)
{
buf.push("<i data-toggle=\"tooltip\"" + (jade.attr("title", 'Order patients by'+item.title, true, false)) + " class=\"fa fa-sort-asc\"></i>");
}
else
{
buf.push("<i data-toggle=\"tooltip\"" + (jade.attr("title", 'Order patients by'+item.title, true, false)) + " class=\"fa fa-sort-desc\"></i>");
}
}
else
{
buf.push("<i data-toggle=\"tooltip\"" + (jade.attr("title", 'Order patients by'+item.title, true, false)) + " class=\"fa fa-sort\"></i>");
}
}
buf.push("</th>");
};
buf.push("<h4>" + (null == (jade_interp = header + '(n=' + n + ')') ? "" : jade_interp) + "</h4><table class=\"table patient-list table-body-hidden\"><thead><tr>");
// iterate locals['header-items']
;(function(){
  var $$obj = locals['header-items'];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

jade_mixins["header"](item);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

jade_mixins["header"](item);
    }

  }
}).call(this);

buf.push("</tr></thead><tbody><tr data-toggle=\"tooltip\" data-placement=\"left\" title=\"Click for more information about this patient\" class=\"list-item\"><td style=\"min-width:130px\"><button type=\"button\" data-content=\"Copied\" data-toggle=\"tooltip\" data-placement=\"right\" class=\"btn btn-xs btn-default btn-copy\"><span class=\"fa fa-clipboard\"></span></button>        1234567890</td><td>2014-06-10</td></tr></tbody></table><div class=\"table-scroll\"><table class=\"table patient-list table-head-hidden\"><thead><tr>");
// iterate locals['header-items']
;(function(){
  var $$obj = locals['header-items'];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

jade_mixins["header"](item);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

jade_mixins["header"](item);
    }

  }
}).call(this);

buf.push("</tr></thead><tbody>");
// iterate patients
;(function(){
  var $$obj = patients;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var patient = $$obj[$index];

buf.push("<tr data-toggle=\"tooltip\" data-placement=\"left\" title=\"Click for more information about this patient\" class=\"list-item patient-row-tooltip\"><td style=\"min-width:130px\">");
var nhs = patient.nhsNumber.toString().replace(/ /g,"")
buf.push("<button type=\"button\"" + (jade.attr("data-patient-id", patient.patientId, true, false)) + (jade.attr("data-clipboard-text", nhs, true, false)) + " data-content=\"Copied\" data-toggle=\"lone-tooltip\" data-placement=\"right\"" + (jade.attr("title", 'Copy ' + nhs + ' to clipboard.', true, false)) + " class=\"btn btn-xs btn-default btn-copy\"><span class=\"fa fa-clipboard\"></span></button>" + (jade.escape(null == (jade_interp = ' ' + patient.nhsNumber) ? "" : jade_interp)) + "</td>");
// iterate patient.items
;(function(){
  var $$obj = patient.items;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<td>" + (null == (jade_interp = item) ? "" : jade_interp) + "</td>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<td>" + (null == (jade_interp = item) ? "" : jade_interp) + "</td>");
    }

  }
}).call(this);

buf.push("</tr>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var patient = $$obj[$index];

buf.push("<tr data-toggle=\"tooltip\" data-placement=\"left\" title=\"Click for more information about this patient\" class=\"list-item patient-row-tooltip\"><td style=\"min-width:130px\">");
var nhs = patient.nhsNumber.toString().replace(/ /g,"")
buf.push("<button type=\"button\"" + (jade.attr("data-patient-id", patient.patientId, true, false)) + (jade.attr("data-clipboard-text", nhs, true, false)) + " data-content=\"Copied\" data-toggle=\"lone-tooltip\" data-placement=\"right\"" + (jade.attr("title", 'Copy ' + nhs + ' to clipboard.', true, false)) + " class=\"btn btn-xs btn-default btn-copy\"><span class=\"fa fa-clipboard\"></span></button>" + (jade.escape(null == (jade_interp = ' ' + patient.nhsNumber) ? "" : jade_interp)) + "</td>");
// iterate patient.items
;(function(){
  var $$obj = patient.items;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<td>" + (null == (jade_interp = item) ? "" : jade_interp) + "</td>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<td>" + (null == (jade_interp = item) ? "" : jade_interp) + "</td>");
    }

  }
}).call(this);

buf.push("</tr>");
    }

  }
}).call(this);

buf.push("</tbody></table></div>");}.call(this,"header" in locals_for_with?locals_for_with.header:typeof header!=="undefined"?header:undefined,"n" in locals_for_with?locals_for_with.n:typeof n!=="undefined"?n:undefined,"patients" in locals_for_with?locals_for_with.patients:typeof patients!=="undefined"?patients:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/patient-search.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<form id=\"search-box\" role=\"search\" class=\"app-search hidden-xs ng-pristine ng-valid\"><input type=\"text\" placeholder=\"Search by patients NHS number...\" class=\"typeahead form-control form-control-circle\"/></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/patient-title.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (age, nhs, patid, sex) {
buf.push((jade.escape(null == (jade_interp = 'Patient ' + patid + ' ') ? "" : jade_interp)) + "<button type=\"button\"" + (jade.attr("data-clipboard-text", nhs, true, false)) + " data-content=\"Copied\" data-toggle=\"lone-tooltip\" data-placement=\"right\"" + (jade.attr("title", 'Copy ' + nhs + ' to clipboard.', true, false)) + " class=\"btn btn-xs btn-default btn-copy\"><span class=\"fa fa-clipboard\"></span></button>" + (jade.escape(null == (jade_interp = ' - ' + age + ' year old ' + sex) ? "" : jade_interp)));}.call(this,"age" in locals_for_with?locals_for_with.age:typeof age!=="undefined"?age:undefined,"nhs" in locals_for_with?locals_for_with.nhs:typeof nhs!=="undefined"?nhs:undefined,"patid" in locals_for_with?locals_for_with.patid:typeof patid!=="undefined"?patid:undefined,"sex" in locals_for_with?locals_for_with.sex:typeof sex!=="undefined"?sex:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/quality-standard.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (standards, undefined) {
buf.push("<div class=\"panel panel-default\"><table class=\"table table-condensed\"><thead><tr><th>Quality indicator</th><th>Target met?</th></tr></thead><tbody>");
// iterate standards
;(function(){
  var $$obj = standards;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var standard = $$obj[$index];

buf.push("<tr" + (jade.cls([standard.targetMet ? 'success' : 'danger'], [true])) + "><td>" + (jade.escape(null == (jade_interp = standard.display) ? "" : jade_interp)) + "</td><td>");
if ( standard.targetMet)
{
buf.push("<i class=\"fa fa-check text-success\"></i>");
}
else
{
buf.push("<i class=\"fa fa-times text-danger\"></i>");
}
buf.push("</td></tr>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var standard = $$obj[$index];

buf.push("<tr" + (jade.cls([standard.targetMet ? 'success' : 'danger'], [true])) + "><td>" + (jade.escape(null == (jade_interp = standard.display) ? "" : jade_interp)) + "</td><td>");
if ( standard.targetMet)
{
buf.push("<i class=\"fa fa-check text-success\"></i>");
}
else
{
buf.push("<i class=\"fa fa-times text-danger\"></i>");
}
buf.push("</td></tr>");
    }

  }
}).call(this);

buf.push("</tbody></table></div>");}.call(this,"standards" in locals_for_with?locals_for_with.standards:typeof standards!=="undefined"?standards:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/suggested-plan.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (suggestions, undefined) {
jade_mixins["thumbs"] = jade_interp = function(suggestion){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div data-toggle=\"buttons\" class=\"btn-group\"><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to agree with this action and save it in your agreed actions list \"" + (jade.cls(['btn','btn-xs','btn-yes','btn-toggle','btn-success',suggestion.agree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"yes\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.agree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-up\"></span></label><label data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Click to disagree with this action and remove it from your suggested actions list \"" + (jade.cls(['btn','btn-xs','btn-no','btn-toggle','btn-danger',suggestion.disagree ? 'active' : ''], [null,null,null,null,null,true])) + "><input type=\"checkbox\" value=\"no\" autocomplete=\"off\"" + (jade.attr("checked", suggestion.disagree ? 'checked' : undefined, true, false)) + "/><span class=\"fa fa-2x fa-thumbs-down\"></span></label></div>");
};
buf.push("<table class=\"table\"><thead><tr><th>Recommended actions</th><th style=\"width: 105px\">Add to action plan?</th></tr></thead><tbody>");
// iterate suggestions
;(function(){
  var $$obj = suggestions;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var suggestion = $$obj[$index];

buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.attr("data-team-or-patient-id", suggestion.tpid ? suggestion.tpId : undefined, true, false)) + " class=\"suggestion\"><td><span>" + (null == (jade_interp = suggestion.text) ? "" : jade_interp) + "</span></td><td>");
jade_mixins["thumbs"](suggestion);
buf.push("</td></tr>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var suggestion = $$obj[$index];

buf.push("<tr" + (jade.attr("data-id", suggestion.id, true, false)) + (jade.attr("data-team-or-patient-id", suggestion.tpid ? suggestion.tpId : undefined, true, false)) + " class=\"suggestion\"><td><span>" + (null == (jade_interp = suggestion.text) ? "" : jade_interp) + "</span></td><td>");
jade_mixins["thumbs"](suggestion);
buf.push("</td></tr>");
    }

  }
}).call(this);

buf.push("</tbody></table><form onsubmit=\"return false;\"><div class=\"form-group\"><textarea rows=\"3\" style=\"resize:none\" placeholder=\"Enter your own improvement action then click 'add' below...\" class=\"form-control\"></textarea></div><button class=\"btn btn-info add-plan\">Add</button></form>");}.call(this,"suggestions" in locals_for_with?locals_for_with.suggestions:typeof suggestions!=="undefined"?suggestions:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/team-action-plan.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"affix panel panel-default\"><div id=\"tab-plan-team\" class=\"panel-body fit-to-screen-height\"><div id=\"suggestedPlanTeam\"></div><div id=\"personalPlanTeam\"></div></div></div><div id=\"editPlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"exampleModalLabel\" class=\"modal-title\">Edit Plan</h4></div><div class=\"modal-body\"><div class=\"form-group\"><input id=\"editActionPlanItem\" type=\"text\" class=\"form-control\"/></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-primary save-plan\">Save</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div><div id=\"deletePlan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"deleteModalLabel\" aria-hidden=\"true\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" data-dismiss=\"modal\" aria-label=\"Close\" class=\"close\"><span aria-hidden=\"true\">×</span></button><h4 id=\"deleteModalLabel\" class=\"modal-title\">Delete a suggested action you added</h4></div><div class=\"modal-body\"><p><strong>You indicated that you want to delete:</strong></p><span id=\"modal-delete-item\" style=\"font-style:italic\"></span><br/><p><strong>Are you sure?</strong></p></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-danger delete-plan\">Delete</button><button type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cancel</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/actions.js", function(exports, require, module) {
var base = require('../base'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  welcome = require('../panels/welcome');

var ID = "ACTION_PLAN_VIEW";

var ap = {

  create: function() {
    lookup.suggestionModalText = "Screen: Action plan\n===========\n";

    base.selectTab("actions");

    if (layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      layout.showPage('welcome');
      layout.showHeaderBarItems();

      $('#welcome-tabs li').removeClass('active');
      $('#outstandingTasks').closest('li').addClass('active');

      layout.view = ID;
    }

    welcome.populate();

  }

};

module.exports = ap;

});

require.register("views/indicator.js", function(exports, require, module) {
var base = require('../base'),
  data = require('../data'),
  patientList = require('../panels/patientList'),
  indicatorBreakdown = require('../panels/indicatorBreakdown'),
  indicatorBenchmark = require('../panels/indicatorBenchmark'),
  indicatorTrend = require('../panels/indicatorTrend'),
  indicatorHeadlines = require('../panels/indicatorHeadlines'),
  teamActionPlan = require('../panels/teamActionPlan'),
  wrapper = require('../panels/wrapper'),
  layout = require('../layout'),
  lookup = require('../lookup');

var ID = "INDICATOR";
/*
 * The indicator page consists of the panels:
 *   Tabbed panel
 *     - performance trend
 *     - performance benchmark
 *   Patient groups
 *   Patient list
 *   Team action plan
 */

var ind = {

  create: function(pathwayId, pathwayStage, standard, tab, loadContentFn) {

    base.selectTab("indicator");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {
      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        //base.switchTo21Layout();
        layout.showMainView();

        base.removeFullPage(farRightPanel);
        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      if (!pathwayId) {
        if (layout.pathwayId) pathwayId = layout.pathwayId;
        else pathwayId = Object.keys(data.pathwayNames)[0];
      }

      if (!pathwayStage) {
        if (layout.pathwayStage) pathwayStage = layout.pathwayStage;
        else pathwayStage = Object.keys(data.text.pathways[pathwayId])[0];
      }

      if (!standard) {
        if (layout.standard) standard = layout.standard;
        else standard = Object.keys(data.text.pathways[pathwayId][pathwayStage].standards)[0];
      }

      //if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage) {
      //different pathway or stage so title needs updating
      base.updateTitle(data.text.pathways[pathwayId][pathwayStage].standards[standard].name);
      lookup.suggestionModalText="Screen: Indicator\nIndicator: " + data.text.pathways[pathwayId][pathwayStage].standards[standard].name + "\n===========\n";
      /*base.updateTitle([{
        title: "Overview",
        url: "#overview"
      }, {
        title: data.text.pathways[pathwayId][pathwayStage].text.page.text,
        tooltip: data.text.pathways[pathwayId][pathwayStage].text.page.tooltip
      }]);
      $('#mainTitle').show();*/
      //}

      layout.pathwayId = pathwayId;
      layout.pathwayStage = pathwayStage;
      layout.standard = standard;

      //TODO not sure if this needs moving..?
      data.pathwayId = pathwayId;

      //The three panels we need to show
      //Panels decide whether they need to redraw themselves
      teamActionPlan.show(farLeftPanel);

      base.updateTab("indicators", data.text.pathways[pathwayId][pathwayStage].standards[standard].tabText, [pathwayId, pathwayStage, standard].join("/"));

      wrapper.show(farRightPanel, false, [
        {
          show: indicatorHeadlines.show,
          args: [pathwayId, pathwayStage, standard]
        }, {
          show: indicatorBreakdown.show,
          args: [pathwayId, pathwayStage, standard, patientList.selectSubsection]
        }, {
          show: patientList.show,
          args: [pathwayId, pathwayStage, standard, loadContentFn]
        }
      ], "Performance over time", false);
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorTrend.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], "Benchmarking", "Patients at risk");
      wrapper.show(farRightPanel, true, [
        {
          show: indicatorBenchmark.show,
          args: [pathwayId, pathwayStage, standard]
        }
      ], false, "Performance over time");

      if ($('#addedCSS').length === 0) {
        $('head').append('<style id="addedCSS" type="text/css">.table-scroll {max-height:170px;}');
      }

      base.addFullPage(farRightPanel);
      /*console.log("WINDOW HEIGHT: " + $(window).height());
      console.log("TABLE TOP: " + $('.table-scroll').position().top);
      console.log("CSS: " + Math.floor($(window).height()-$('.table-scroll').position().top-200)+"px");*/
      $('#addedCSS').text('.table-scroll {max-height:' + Math.floor($(window).height() - $('.table-scroll').position().top - 200) + 'px;}');

      $(window).off('resize').on('resize', function() {
        var win = $(this); //this = window
        $('#addedCSS').text('.table-scroll {max-height:' + Math.floor(win.height() - $('.table-scroll').position().top - 200) + 'px;}');
      });

      $('#indicator-pane').show();

      base.wireUpTooltips();

      /*setTimeout($('.fp-controlArrow').each(function(idx, el) {
        if(el.is(":visible"))
      }), 2000);*/

      base.hideLoading();
    }, 0);
  }

};

module.exports = ind;

});

require.register("views/overview.js", function(exports, require, module) {
var base = require('../base'),
  data = require('../data'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  indicatorList = require('../panels/indicatorList'),
  teamActionPlan = require('../panels/teamActionPlan');

var ID = "OVERVIEW";
/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
var overview = {

  create: function(loadContentFn) {

    lookup.suggestionModalText="Screen: Overview\n===========\n";

    base.selectTab("overview");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        //base.switchTo101Layout();
        layout.showMainView();

        $('#mainTitle').show();
        base.updateTitle("Overview of your practice performance");

        base.removeFullPage(farRightPanel);
        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      data.pathwayId = "htn"; //TODO fudge

      //The two panels we need to show
      //Panels decide whether they need to redraw themselves
      teamActionPlan.show(farLeftPanel);
      indicatorList.show(farRightPanel, false, loadContentFn);

      $('#overview-pane').show();

      base.wireUpTooltips();
      base.hideLoading();
    }, 0);

  }

};

module.exports = overview;

});

require.register("views/patient.js", function(exports, require, module) {
var lifeline = require('../panels/lifeline'),
  data = require('../data'),
  base = require('../base'),
  layout = require('../layout'),
  lookup = require('../lookup'),
  individualActionPlan = require('../panels/individualActionPlan'),
  qualityStandards = require('../panels/qualityStandards'),
  patientCharacteristics = require('../panels/patientCharacteristics'),
  patientSearch = require('../panels/patientSearch');

var ID = "PATIENT_VIEW";
/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

var pv = {

  wireUp: function() {

  },

  create: function(pathwayId, pathwayStage, standard, patientId, loadContentFn) {

    base.selectTab("patient");
    base.showLoading();

    //use a setTimeout to force the UI to change e.g. show the loading-container
    //before further execution
    setTimeout(function() {

      if (layout.view !== ID) {
        //Not already in this view so we need to rejig a few things
        base.clearBox();
        //base.switchTo21Layout();
        layout.showMainView();

        base.removeFullPage(farRightPanel);
        base.hidePanels(farRightPanel);

        layout.view = ID;
      }

      base.hidePanels(farLeftPanel);

      if (patientId) {
        lookup.suggestionModalText = "Screen: Patient\nPatient ID: " + patientId + "  - NB this helps us identify the patient but is NOT their NHS number.\n===========\n";

        data.getPatientData(patientId, function(patientData) {

          if (layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage ||
            layout.standard !== standard || layout.patientId !== patientId) {
            //different pathway or stage or patientId so title needs updating
            $('#mainTitle').show();

            var patid = (data.patLookup && data.patLookup[patientId] ? data.patLookup[patientId] : patientId);
            var sex = patientData.characteristics.sex.toLowerCase() === "m" ?
              "male" : (patientData.characteristics.sex.toLowerCase() === "f" ? "female" : patientData.characteristics.sex.toLowerCase());
            var titleTmpl = require("templates/patient-title");
            base.updateTitle(titleTmpl({
              patid: patid,
              nhs: patid.toString().replace(/ /g, ""),
              age: patientData.characteristics.age,
              sex: sex
            }));
          }

          base.updateTab("patients", data.patLookup[patientId] || patientId, patientId);

          layout.patientId = patientId;
          data.patientId = patientId;
          data.pathwayId = pathwayId;

          patientSearch.show($('#title-right'), true, loadContentFn);
          qualityStandards.show(farRightPanel, false, patientId);

          lifeline.show(farRightPanel, true, patientId, patientData);
          individualActionPlan.show(farLeftPanel, pathwayId, pathwayStage, standard, patientId);

          patientSearch.wireUp();
          $('#patient-pane').show();

          base.wireUpTooltips();
          base.hideLoading();

        });
      } else {
        base.updateTitle("No patient currently selected");
        patientSearch.show(farRightPanel, true, loadContentFn);

        lookup.suggestionModalText = "Screen: Patient\nPatient ID: None selected\n===========\n";

        base.wireUpTooltips();
        base.hideLoading();
      }

    }, 0);

  },

  populate: function() {

  }

};

module.exports = pv;

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

