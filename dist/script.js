(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint browser: true*/
/*jshint -W055 */
/*global $, c3, Mustache, ZeroClipboard, console, jsPDF, Bloodhound, bb, alert*/

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar in layout and content
 *  to all the others.
 */

var template = require('./src/template.js'),
  main = require('./src/main.js');

//TODO not sure why i did this - was in local variable
//maybe a separate module
//window.location = window.history.location || window.location;
/********************************************************
 *** Shows the pre-load image and slowly fades it out. ***
 ********************************************************/
$(window).load(function() {
  $('.loading-container').fadeOut(1000, function() {
    $(this).remove();
  });
});

/******************************************
 *** This happens when the page is ready ***
 ******************************************/
$(document).on('ready', function() {
  //Grab the hash if exists - IE seems to forget it
  main.hash = location.hash;
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

},{"./src/main.js":8,"./src/template.js":25}],2:[function(require,module,exports){
var data = require('./data.js'),
  lookup = require('./lookup.js'),
  chart = require('./chart.js'),
  log = require('./log.js');

var base = {

  //object for keeping track what is in each panel to prevent unnecessary redraws
  panels: {},

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

  updateTitle: function(title, tooltip) {
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
  },

  hideAllPanels: function() {
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    farLeftPanel.hide();
    farRightPanel.hide();
    topPanel.hide();
  }

};

module.exports = base;

},{"./chart.js":3,"./data.js":4,"./log.js":6,"./lookup.js":7}],3:[function(require,module,exports){
var data = require('./data.js'),
  lookup = require('./lookup.js'),
  log = require('./log.js');

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
    $('#' + element).highcharts({
      chart: {
        type: 'column',
        height: 300
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: [
                    'P1',
                    'P2',
                    'P3',
                    'P4',
                    'P5',
                    'P6',
                    'YOU',
                    'P7',
                    'P8',
                    'P9',
                    'P10',
                    'P11'
                ],
        crosshair: true
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: '% patients meeting target'
        }
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
        data: [49.9, 71.5, 16.4, 29.2, 44.0, 76.0, {
          y: 35.6,
          color: "red"
        }, 48.5, 26.4, 94.1, 95.6, 54.4]
      }]
    });
  },

  drawPerformanceTrendChartHC: function(element, data, selectSeriesFn) {

    var series = [];

    data.forEach(function(v, i) {
      if (i === 0) return;
      series.push({
        type: 'line',
        name: v[0],
        data: []
      });
    });
    data[0].forEach(function(v, i) {
      if (i === 0) return;
      var time = new Date(v).getTime();
      series.forEach(function(vv, ii) {
        vv.data.push([time, +data[ii + 1][i]]);
      });
    });

    $('#' + element).highcharts({
      chart: {
        zoomType: 'x',
        height: 300
      },
      title: {
        text: ''
      },
      subtitle: {
        text: document.ontouchstart === undefined ?
          'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: 'Quality standard performance'
        }
      },
      legend: {
        enabled: true
      },

      plotOptions: {
        series: {
          states: {
            /*hover : {
              enabled: false
            },*/
            select: {
              lineWidthPlus: 2
            },
            faded: {
              lineWidth: 1
            }
          },
          events: {
            click: function(event) {
              var numSeries = this.chart.series.length;
              var numVisible = this.chart.series.filter(function(v){return v.visible;}).length;

              if (this.visible && numVisible === 1) {
                //show all
                this.chart.series.forEach(function(series) {
                  series.show();
                });
                selectSeriesFn();
              } else {
                this.chart.series.forEach(function(series) {
                  series.hide();
                });
                this.show();
                selectSeriesFn(this.name);
              }

              return false;
            },
            legendItemClick: function(event) {
              var numSeries = this.chart.series.length;
              var numVisible = this.chart.series.filter(function(v){return v.visible;}).length;

              if (this.visible && numVisible === 1) {
                //show all
                this.chart.series.forEach(function(series) {
                  series.show();
                });
                selectSeriesFn();
              } else {
                this.chart.series.forEach(function(series) {
                  series.hide();
                });
                this.show();
                selectSeriesFn(this.name);
              }

              return false;
            }
          }
        }
      },

      series: series
    });
  }

};

module.exports = cht;

},{"./data.js":4,"./log.js":6,"./lookup.js":7}],4:[function(require,module,exports){
var log = require('./log.js'),
  lookup = require('./lookup.js');

var _getAllIndicatorData = function(callback){
  var r = Math.random();
  $.getJSON("data/indicators.json?v=" + r, function(file) {
    dt.indicators = file;

    dt.indicators.forEach(function(indicator){
      var percentage = Math.round(100*indicator.values[1][1]*100/indicator.values[2][1])/100;
      indicator.performance = indicator.values[1][1] + " / " + indicator.values[2][1] + " (" + percentage + "%)";
      indicator.target = indicator.values[3][1]*100 + "%";
      indicator.up = percentage > Math.round(100*indicator.values[1][2]*100/indicator.values[2][2])/100;
      var trend = indicator.values[1].map(function(val, idx) {
        return Math.round(100*val*100/indicator.values[2][idx])/100;
      }).slice(1,10);
      trend.reverse();
      indicator.trend = trend.join(",");
      var dates = indicator.values[0].slice(1,10);
      dates.reverse();
      indicator.dates = dates;
    });


    callback(dt.indicators);
  });
};

var _getIndicatorData = function(indicator, callback) {
  var r = Math.random();
  $.getJSON("data/idata." + indicator + ".json?v=" + r, function(file) {
    dt.indicators[indicator] = file;

    //apply which categories people belong to
    Object.keys(dt.indicators[indicator].patients).forEach(function(patient){
      dt.indicators[indicator].patients[patient].opportunities = [];
      dt.indicators[indicator].opportunities.forEach(function(opp, idx){
        if(opp.patients.indexOf(+patient)>-1) {
          dt.indicators[indicator].patients[patient].opportunities.push(idx);
        }
      });
    });

    callback(dt.indicators[indicator]);
  });
};

var _getFakePatientData = function(callback){
  var r = Math.random();
  $.getJSON("data/patient.json?v=" + r, function(file) {
    if(!dt.patients) dt.patients = {};
    dt.patients.patient = file;

    callback(dt.patients.patient);
  });
};

var _getPatientData = function(patient, callback) {
  var r = Math.random();
  $.getJSON("data/" + patient + ".json?v=" + r, function(file) {
    if(!dt.patients) dt.patients = {};
    dt.patients[patient] = file;

    callback(dt.patients[patient]);
  }).fail(function(){
    if(dt.patients.patient) return callback(dt.patients.patient);
    else _getFakePatientData(callback);
  });
};

var dt = {

  pathwayNames: {},
  diseases: [],
  options: [],

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
    if (json) {
      dt.load(json);
      if (typeof callback === 'function') callback();
    } else {
      var r = Math.random();
      $.getJSON("data.json?v=" + r, function(file) {
        dt.load(file);
        if (typeof callback === 'function') callback();
      }).fail(function(err) {
        alert("data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
      });
    }
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

  getAllIndicatorData: function(callback){
    if(dt.indicators) {
      return callback(dt.indicators);
    } else {
      _getAllIndicatorData(callback);
    }
  },

  getIndicatorData: function(indicator, callback) {
    if(!dt.indicators) {
      _getAllIndicatorData(function(data){
        _getIndicatorData(indicator, callback);
      });
    } else if(dt.indicators && dt.indicators[indicator]) {
      return callback(dt.indicators[indicator]);
    } else {
      _getIndicatorData(indicator, callback);
    }
  },

  getPatientData: function(patientId, callback) {
    /*if(dt.patients && dt.patients[patientId]) {
      return callback(dt.patients[patientId]);
    } else {*/
      _getPatientData(patientId, callback);
  /*  }*/
  }

};

module.exports = dt;

},{"./log.js":6,"./lookup.js":7}],5:[function(require,module,exports){
var data = require('./data.js');

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

},{"./data.js":4}],6:[function(require,module,exports){
var notify = require('./notify.js');

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
    $.getJSON("action-plan.json?v=" + r, function(file) {
      log.plan = file.diseases;
      log.text = file.plans;
      callback();
    });
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


    if (agree) {
      logText = "You agreed with this suggested action on " + (new Date()).toDateString();
    } else if (agree === false) {
      var reasonText = log.reason.reason === "" && log.reason.reasonText === "" ? " - no reason given" : " . You disagreed because you said: '" + log.reason.reason + "; " + log.reason.reasonText + ".'";
      logText = "You disagreed with this action on " + (new Date()).toDateString() + reasonText;
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

  getAgrees: function(){
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

},{"./notify.js":9}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
var template = require('./template.js'),
  data = require('./data.js'),
  base = require('./base.js'),
  layout = require('./layout.js'),
  welcome = require('./panels/welcome.js'),
  log = require('./log.js');

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

    template.displaySelectedPatient(nhsNumberObject.id);
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
          value: patLookup ? patLookup[state] : state
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
          getData(null, JsonObj);
          console.log(JsonObj);

          main.wireUpSearchBox();

          setTimeout(function() {
            $('#data-file-wrapper').hide(500);
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
          patLookup = {};
          for (var i = 0; i < lines.length; i++) {
            var fields = lines[i].split(",");
            if (fields.length !== 2) continue;
            patLookup[fields[0].trim()] = fields[1].trim();
          }

          main.wireUpSearchBox();

          setTimeout(function() {
            $('#patient-file-wrapper').hide(500);
          }, 1000);
        };
      })(file);

      reader.readAsText(file);
    });

    $('#outstandingTasks').on('click', function(e) {
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      var tempMust = $('#welcome-task-list').html();
      var rendered = Mustache.render(tempMust);
      $('#welcome-tab-content').fadeOut(100, function() {
        $(this).html(rendered);
        welcome.populate();
        $(this).fadeIn(100);
      });
    });

    $('#completedTasks').on('click', function(e) {
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      var tempMust = $('#welcome-task-list').html();
      var rendered = Mustache.render(tempMust);
      $('#welcome-tab-content').fadeOut(100, function() {
        $(this).html(rendered);
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

},{"./base.js":2,"./data.js":4,"./layout.js":5,"./log.js":6,"./panels/welcome.js":24,"./template.js":25}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  qualityStandard = require('./qualityStandard.js'),
  otherCodes = require('./otherCodes.js'),
  medication = require('./medication.js'),
  trend = require('./trend.js'),
  individualActionPlan = require('./individualActionPlan.js'),
  layout = require('../layout.js'),
  chart = require('../chart.js');

var all = {

  populate: function() {
    var patients = data.getAllPatients();

    var localData = {
      "patients": patients,
      "n": patients.length,
      "header-items": [{
        "title": "NHS no.",
        "isUnSortable": true
      }, {
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isUnSortable": true,
        "tooltip": "Total number of improvement opportunities available across all conditions"
      }]
    };

    localData.patients.sort(function(a, b) {
      if (a.items[0] === b.items[0]) {
        return 0;
      }
      var A = Number(a.items[0]);
      var B = Number(b.items[0]);
      if (isNaN(A) || isNaN(B)) {
        A = a.items[0];
        B = b.items[0];
      }
      if (A > B) {
        return -1;
      } else if (A < B) {
        return 1;
      }
    });

    base.createPanelShow(patientList, patientsPanel, localData, {
      "header-item": $("#patient-list-header-item").html(),
      "item": $('#patient-list-item').html()
    });

    $('#patients-placeholder').hide();

    base.setupClipboard($('.btn-copy'), true);

    base.wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if (c && c.length > 0) {
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });
    }
  },

  //Show patient view from the all patient screen
  showIndividualPatientView: function(pathwayId, pathwayStage, standard, patientId) {
    data.patientId = patientId;

    data.options.sort(function(a, b) {
      a = data.getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = data.getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if (a === b) return 0;
      if (a === "not") return 1;
      if (b === "not") return -1;
      if (a === "ok") return 1;
      if (b === "ok") return -1;
      alert("!!!!!!!");
    });

    if (pathwayId === null) {
      //Show patient but don't select
      var p = base.createPanel($('#patient-panel'), {
        "options": data.options,
        "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
        "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
        "patientId": patientId
      }, {
        "option": $('#patient-panel-drop-down-options').html()
      });
      farRightPanel.html(p).show();
      farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');

      $('select').select2({
        templateResult: base.formatStandard,
        minimumResultsForSearch: Infinity,
        placeholder: "Please select an improvement opportunity area..."
      });
      $('span.select2-selection__rendered').attr("title", "");
      $('select').on('change', function() {
        var localData = $(this).find(':selected').data();
        all.showIndividualPatientView(localData.pathwayId, localData.pathwayStage, localData.standard, data.patientId);
      }).on("select2:open", function(e) {
        base.wireUpTooltips();
      });
      return;
    }

    var panel = base.createPanel($('#patient-panel'), {
      "options": data.options,
      "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "pathwayStage": pathwayStage,
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    }, {
      "option": $('#patient-panel-drop-down-options').html()
    });

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = individualActionPlan.create(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = qualityStandard.create(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = trend.create(pathwayId, pathwayStage, standard, patientId);
    var medPanel = medication.create(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = otherCodes.create(pathwayId, pathwayStage, standard, patientId);
    var medCodeWrapperPanel = base.createPanel($('#other-codes-and-meds-wrapper-panel'));
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medCodeWrapperPanel);
    $('#temp-hidden #medCodeWrapperPanel').append(medPanel).append(codesPanel);

    if (farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(100, function() {
        $(this).html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        individualActionPlan.wireUp(pathwayId, pathwayStage, standard, patientId);
        qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
        base.wireUpStandardDropDown(pathwayId, pathwayStage, standard, all.showIndividualPatientView);
        trend.wireUp(pathwayId, pathwayStage, standard, patientId);
        medication.wireUp(pathwayId, pathwayStage, standard, patientId);
        otherCodes.wireUp(pathwayId, pathwayStage, standard, patientId);
        chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        $(this).fadeIn(100, function() {});
      });
    } else {
      farRightPanel.html($('#temp-hidden').html());
      $('#temp-hidden').html("");
      individualActionPlan.wireUp(pathwayId, pathwayStage, standard, patientId);
      qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
      base.wireUpStandardDropDown(pathwayId, pathwayStage, standard, all.showIndividualPatientView);
      trend.wireUp(pathwayId, pathwayStage, standard, patientId);
      medication.wireUp(pathwayId, pathwayStage, standard, patientId);
      otherCodes.wireUp(pathwayId, pathwayStage, standard, patientId);
      chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
      farRightPanel.fadeIn(100, function() {});
    }
  },

  show: function(location) {
    base.createPanelShow($('#all-patients-panel'), location, {
      "n": data.getAllPatients().length
    });

    patientsPanel = $('#patients');

    patientsPanel.on('click', 'tbody tr', function(e) { //Select individual patient when row clicked
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      all.showIndividualPatientView(null, null, null, patientId);

      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });
  },

  showView: function(patientId, reload) {
    $('#mainTitle').hide();
    base.updateTitle("List of all patients at your practice");

    if (!patientId) data.pathwayId = "";
    if (!patientId || reload) {

      layout.showMainView(data.diseases.length);

      base.switchTo110Layout();
      base.hideAllPanels();

      all.show(farLeftPanel);
      all.populate();
    }

    if (patientId) {
      all.showIndividualPatientView(null, null, null, patientId);
    } else {
      var tempMust = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(tempMust)).show();
    }
  }

};

module.exports = all;

},{"../base.js":2,"../chart.js":3,"../data.js":4,"../layout.js":5,"./individualActionPlan.js":15,"./medication.js":17,"./otherCodes.js":18,"./qualityStandard.js":21,"./trend.js":23}],11:[function(require,module,exports){
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

},{"../base.js":2,"../log.js":6}],12:[function(require,module,exports){
var bd = {};

module.exports = bd;

},{}],13:[function(require,module,exports){
var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js');

var indicatorList = {

  create: function(panel, loadContentFn) {
    data.getAllIndicatorData(function(indicators) {

      var tempMust = $('#overview-panel-table').html();
      panel.html(Mustache.render(tempMust, {
        "indicators": indicators
      }));

      $('.inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          return indicators[$('.inlinesparkline').index(sparkline.el)].dates[fields.x] + ": " + fields.y + "%";
        },
        width:"100px"
      });

      indicatorList.wireUp(panel, loadContentFn);

    });
  },

  populate: function() {

  },

  wireUp: function(panel, loadContentFn) {
    panel.off('click', 'tr.standard-row');
    panel.on('click', 'tr.standard-row', function(e) {
      var url = $(this).data("id").replace(/\./g, "/");
      history.pushState(null, null, '#overview/' + url);
      loadContentFn('#overview/' + url);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

};

module.exports = indicatorList;

},{"../base.js":2,"../data.js":4,"../log.js":6}],14:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js');

var ID = "INDICATOR_TREND";

var iTrend = {

  create: function(panel, pathwayId, pathwayStage, standard, tab, selectSeriesFn) {

    var panelId = panel.attr("id");

    if (base.panels[panelId] &&
      base.panels[panelId].id === ID &&
      base.panels[panelId].pathwayId === pathwayId &&
      base.panels[panelId].pathwayStage === pathwayStage &&
      base.panels[panelId].standard === standard) {
      //Already showing the right thing
      return;
    }

    base.panels[panelId] = {
      id: ID,
      pathwayId: pathwayId,
      pathwayStage: pathwayStage,
      standard: standard
    };

    data.getIndicatorData([pathwayId, pathwayStage, standard].join("."), function(indicators) {

      var tempMust = $('#indicator-overview-panel').html();
      panel.html(Mustache.render(tempMust));

      chart.drawBenchmarkChartHC("benchmark-chart", null);

      var dataObj = indicators.opportunities.map(function(opp) {
        var c = opp.values[0].slice();
        c.splice(0, 1, opp.name);
        return c;
      });
      dataObj.splice(0, 0, indicators.opportunities[0].values[1]);
      chart.drawPerformanceTrendChartHC("trend-chart", dataObj, selectSeriesFn);

      iTrend.wireUp();

    });
  },

  wireUp: function(){
    $('a[data-toggle="tab"]').off('shown.bs.tab');
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $('.tab-pane.active div:first').highcharts().reflow();
    });
  }

};

module.exports = iTrend;

},{"../base.js":2,"../chart.js":3,"../data.js":4}],15:[function(require,module,exports){
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var iap = {

  create: function(pathwayStage) {
    return base.createPanel($('#individual-action-plan-panel'), {
      "pathwayStage": pathwayStage || "default",
      "noHeader": true
    });
  },

  show: function(panel, pathwayId, pathwayStage, standard, patientId) {
    panel.html(iap.create(pathwayStage));
    iap.wireUp(pathwayId, pathwayStage, standard, patientId);
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    individualTab = $('#tab-plan-individual');

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

      $('#individual-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

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

    iap.populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard);
  },

  updateIndividualSapRows: function() {
    $('#advice-list').add('#personalPlanIndividual').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });

    $('#advice-list').add('#personalPlanIndividual').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    $('#advice-list').add('#personalPlanIndividual').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text

    $('#advice-list').add('#personalPlanIndividual').find('tr').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          self.removeClass('danger');
          self.addClass('active');
          self.find('td').last().children().show();
          if (log.getActions()[data.patientId][self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + log.getActions()[data.patientId][self.data("id")].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          self.removeClass('active');
          self.addClass('danger');
          self.removeClass('success');
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

  displayPersonalisedIndividualActionPlan: function(id, parentElem) {
    var plans = base.sortSuggestions(base.addDisagreePersonalTeam(log.listPlans(id)));

    base.createPanelShow(actionPlanList, parentElem, {
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }, {
      "action-plan": $('#action-plan').html(),
      "action-plan-item": $('#action-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });

    iap.updateIndividualSapRows();
  },

  populateIndividualSuggestedActions: function(patientId, pathwayId, pathwayStage, standard) {
    var localData = {
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    };
    var breaches = data.patients[patientId].breach ? data.patients[patientId].breach.filter(function(v) {
      return v.pathwayId === pathwayId && v.pathwayStage === pathwayStage && v.standard === standard;
    }) : [];

    var fn = function(val) {
      return {
        "id": val,
        "subsection": subsection
      };
    };

    if (breaches.length === 0) {
      localData.noSuggestions = true;
    } else {
      var suggestions = [],
        subsection = "";
      for (var i = 0; i < breaches.length; i++) {
        subsection = breaches[i].subsection;
        suggestions = suggestions.concat(data[pathwayId][pathwayStage].bdown[subsection].suggestions ?
          data[pathwayId][pathwayStage].bdown[subsection].suggestions.map(fn) : []);
      }

      localData.suggestions = base.sortSuggestions(base.mergeIndividualStuff(base.suggestionList(suggestions), patientId));
      localData.section = {
        "name": data[pathwayId][pathwayStage].bdown[subsection].name,
        "agree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "section") === true,
        "disagree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "section") === false,
      };
      localData.category = {
        "name": data.patients[patientId].category,
        "agree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "category") === true,
        "disagree": log.getPatientAgree(pathwayId, pathwayStage, patientId, "category") === false,
      };
    }

    $('#advice-placeholder').hide();
    $('#advice').show();

    base.createPanelShow(individualPanel, $('#advice-list'), localData, {
      "chk": $('#checkbox-template').html()
    });

    //Wire up any clipboard stuff in the suggestions
    $('#advice-list').find('span:contains("[COPY")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[COPY:([^\]]*)\]/g, '$1 <button type="button" data-clipboard-text="$1" data-content="Copied" data-toggle="tooltip" data-placement="top" title="Copy $1 to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
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

},{"../base.js":2,"../data.js":4,"../log.js":6,"./confirm.js":11}],16:[function(require,module,exports){
var base = require('../base.js');

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

  destroy: function(element) {
    var elementId = '#' + element;
    $(elementId).html('');
    $(elementId).off('mousemove touchmove touchstart', '.sync-chart');

    for (var i = 0; i < Highcharts.charts.length; i++) {
      if (Highcharts.charts[i] && Highcharts.charts[i].renderTo.className.indexOf("h-chart") > -1) Highcharts.charts[i].destroy();
    }
  },

  create: function(element, patientId, data) {
    var elementId = '#' + element;

    var panelId = element;

    if (base.panels[panelId] &&
      base.panels[panelId].id === ID &&
      base.panels[panelId].patientId === patientId) {
        //Already showing the right thing
        return;
    }

    base.panels[panelId] = {
      id: ID,
      patientId: patientId
    };

    ll.destroy(element);

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
     * Override the reset function, we don't need to hide the tooltips and crosshairs.
     */
    /*Highcharts.Pointer.prototype.reset = function() {
      return undefined;
    };*/

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


    var plotConditions = function(conditions, contacts) {
      var series = [];
      $.each(conditions.reverse(), function(i, task) {
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

      var markers = {
        "Face to face": {
          "symbol": "square",
          "lineWidth": 1,
          "lineColor": "black",
          "radius": 8
        },
        "Telephone": {
          "symbol": "circle",
          "lineWidth": 1,
          "lineColor": "black",
          "radius": 8
        },
        "Hospital admission": {
          "symbol": "triangle",
          "lineWidth": 1,
          "lineColor": "black",
          "radius": 8
        }
      };
      var contactSeries = {};
      $.each(contacts, function(i, contact) {
        if (!contactSeries[contact.name]) {
          contactSeries[contact.name] = Highcharts.extend(contact, {
            data: [],
            type: 'scatter',
            marker: markers[contact.name],
            color: colour.next()
          });
        }
        contactSeries[contact.name].data.push([
              contact.task,
              contact.time
          ]);
      });

      series = series.concat(Object.keys(contactSeries).map(function(key) {
        return contactSeries[key];
      }));

      // create the chart
      $('<div class="h-chart h-condition-chart">')
        .appendTo(elementId)
        .highcharts({

          chart: {
            renderTo: element,
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            type: 'columnrange',
            inverted: true
          },

          title: {
            text: ''
          },


          yAxis: {
            type: 'datetime',
            min: Date.UTC(2013, 6, 12),
            max: Date.UTC(2016, 3, 5),
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
              if (this.series.data[0].x !== 1) {
                //Range ergo condition
                var yCoord = this.y;
                var label = conditions[Math.floor(this.x)].intervals.filter(function(v) {
                  return yCoord >= v.from && yCoord <= v.to;
                })[0].label;
                return '<b>' + conditions[Math.floor(this.x)].name + (label ? ': ' + label : '') + '</b><br/>' +
                  Highcharts.dateFormat('%Y:%m:%d', this.point.options.low) +
                  ' - ' + Highcharts.dateFormat('%Y:%m:%d', this.point.options.high);
              } else {
                //Single value hence contact
                var time = this.y;
                return contacts.filter(function(val) {
                  return val.data && val.data.filter(function(v) {
                    return v[1] === time;
                  }).length > 0;
                }).map(function(val) {
                  return '<b>' + val.name + '</b><br/>' + Highcharts.dateFormat('%Y:%m:%d', val.time);
                }).join('<br/>');
              }
            },
            followPointer: true
          },

          plotOptions: {
            columnrange: {
              grouping: false,
              groupPadding: 0.3,
              dataLabels: {
                allowOverlap: true,
                enabled: true,
                formatter: function() {
                  var yCoord = this.y;
                  var idx = -1;
                  var label = conditions[Math.floor(this.x)].intervals.filter(function(v, i) {
                    if (yCoord >= v.from && yCoord <= v.to) {
                      idx = i;
                      return true;
                    }
                    return false;
                  })[0].label;
                  return this.y === this.point.low &&
                    (conditions[Math.floor(this.x)].intervals.length - 1 === idx ||
                      (this.series.chart.yAxis[0].min <= yCoord && this.series.chart.yAxis[0].max >= yCoord) ||
                      (this.series.chart.yAxis[0].min >= this.point.low && this.series.chart.yAxis[0].max <= this.point.high)) ? conditions[Math.floor(this.x)].name + (label ? ': ' + label : '') : '';
                }
              }
            }
          },
          /*plotOptions: {
            line: {
              lineWidth: 9,
              marker: {
                enabled: false
              },
              dataLabels: {
                enabled: true,
                align: 'left',
                formatter: function() {
                  return this.point.options && this.point.options.label;
                }
              }
            }
          },*/

          series: series

        });
    };

    var plotMeasurements = function(measurements) {
      $.each(measurements.datasets, function(i, dataset) {

        // Add X values
        if (dataset.data && typeof dataset.data[0] !== "object") {
          dataset.data = Highcharts.map(dataset.data, function(val, j) {
            return [measurements.xData[j], val];
          });
        }

        var chartOptions = {
          chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 0,
            spacingBottom: 8,
          },
          title: {
            text: '',
            align: 'left',
            margin: 0,
            x: 30
          },
          credits: {
            enabled: false
          },
          legend: {
            enabled: false
          },
          xAxis: {
            type: 'datetime',
            min: Date.UTC(2013, 6, 12),
            max: Date.UTC(2016, 3, 5),
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
              text: null
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
            borderWidth: 0,
            backgroundColor: 'rgba(252, 255, 197, 0.65)',
            pointFormat: '<b>' + dataset.name + ':</b> {point.y} ' + dataset.unit,
            headerFormat: '',
            shadow: true,
            style: {
              fontSize: '18px'
            },
            valueDecimals: dataset.valueDecimals
          },
          plotOptions:{
            series: {
                events: {
                    mouseOut: function () {
                      var chart,i;
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

        if (dataset.name === "Blood pressure") {
          chartOptions.tooltip.pointFormat = "<b>BP:</b> {point.low}/{point.high} mmHg<br/>";
          //chartOptions.series[0].tooltip = {};
          chartOptions.series[0].stemWidth = 3;
          chartOptions.series[0].whiskerWidth = 5;
        }

        /*if (i === measurements.datasets.length - 1) {
          chartOptions.xAxis = {
            crosshair: true,
            events: {
              setExtremes: syncExtremes
            },
            type: 'datetime'
          };
        }*/
        $('<div class="sync-chart h-chart' + (i === measurements.datasets.length - 1 ? " h-last-measurement-chart" : "") + '">')
          .appendTo(elementId)
          .highcharts(chartOptions);

      });
    };

    var plotNavigator = function() {
      var chart = $('<div class="h-chart h-navigator-chart">')
        .appendTo(elementId)
        .highcharts({

          chart: {
            renderTo: element,
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            ignoreHiddenSeries: false
          },

          title: {
            text: ''
          },

          xAxis: {
            type: 'datetime',
            min: Date.UTC(2013, 6, 12),
            max: Date.UTC(2016, 3, 5),
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

      // create the chart
      return $('<div class="h-chart h-condition-chart">')
        .appendTo(elementId)
        .highcharts({

          chart: {
            renderTo: element,
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            type: 'columnrange',
            inverted: true
          },

          title: {
            text: ''
          },


          yAxis: {
            type: 'datetime',
            min: Date.UTC(2013, 6, 12),
            max: Date.UTC(2016, 3, 5),
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
              var label = medications[Math.floor(this.x)].intervals.filter(function(v) {
                return yCoord >= v.from && yCoord <= v.to;
              })[0].label;
              return '<b>' + medications[Math.floor(this.x)].name + (label ? ': ' + label : '') + '</b><br/>' +
                Highcharts.dateFormat('%Y:%m:%d', this.point.options.low) +
                ' - ' + Highcharts.dateFormat('%Y:%m:%d', this.point.options.high);
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
                  var label = medications[Math.floor(this.x)].intervals.filter(function(v, i) {
                    if (yCoord >= v.from && yCoord <= v.to) {
                      idx = i;
                      return true;
                    }
                    return false;
                  })[0].label;
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

    plotConditions(data.conditions, data.contacts);
    plotMeasurements(data.measurements);
    var c = plotMedications(data.medications);
    plotNavigator();
    c.highcharts().axes[1].setExtremes(1434864000000, 1459814400000, undefined, false, {
      trigger: 'syncExtremes'
    });

    ll.chartArray = Highcharts.charts.slice(Highcharts.charts.length - 6, Highcharts.charts.length);

    var s = syncExtremes.bind(c.highcharts().series[0]);
    s({
      trigger: 'navigator',
      min: 1434864000000,
      max: 1459814400000
    });
  }

};

module.exports = ll;

},{"../base.js":2}],17:[function(require,module,exports){
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var med = {

  create: function(pathwayId, pathwayStage, standard, patientId) {
    var medications = data.patients[patientId].medications || [];
    var agree = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "medication");
    return base.createPanel(medicationPanel, {
      "areMedications": medications.length > 0,
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "pathway": data.pathwayNames[pathwayId],
      "medications": medications,
      "pathwayStage": pathwayStage
    }, {
      "medicationRow": $('#medication-row').html()
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#medication-agree-disagree'), $('#medication-panel'), pathwayId, pathwayStage, standard, patientId, "medication", "medication data");
  }

};

module.exports = med;

},{"../base.js":2,"../data.js":4,"../log.js":6,"./confirm.js":11}],18:[function(require,module,exports){
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var other = {

  create: function(pathwayId, pathwayStage, standard, patientId) {
    var codes = (data.patients[patientId].codes || []).map(function(val) {
      val.description = data.codes[val.code];
      return val;
    });
    var agree = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "codes");
    return base.createPanel($('#other-codes-panel'), {
      "areCodes": codes.length > 0,
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "pathway": data.pathwayNames[pathwayId],
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "codes": codes,
      "pathwayStage": pathwayStage
    }, {
      "codeRow": $('#other-codes-row').html()
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#other-codes-agree-disagree'), $('#other-codes-panel'), pathwayId, pathwayStage, standard, patientId, "codes", "other codes");
  }

};

module.exports = other;

},{"../base.js":2,"../data.js":4,"../log.js":6,"./confirm.js":11}],19:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js');

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

    data.getIndicatorData([pathwayId, pathwayStage, standard].join("."), function(indicators) {

      if (pathwayId && pathwayStage && standard && subsection) {
        pList = indicators.opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].patients;
        header = indicators.opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].description;
      } else if (pathwayId && pathwayStage && standard) {
        pList = indicators.opportunities.reduce(function(a, b) {
          return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
        });
        header = data[pathwayId][pathwayStage].standards[standard].tableTitle;
      }

      pList = data.removeDuplicates(pList);
      var patients = pList.map(function(patientId) {
        var ret = indicators.patients[patientId];
        ret.nhsNumber = data.patLookup ? data.patLookup[patientId] : patientId;
        ret.patientId = patientId;
        ret.items = []; //The fields in the patient list table
        if (ret[data[pathwayId][pathwayStage].standards[standard].valueId]) {
          if (data[pathwayId][pathwayStage].standards[standard].dateORvalue === "date") {
            ret.items.push(ret[data[pathwayId][pathwayStage].standards[standard].valueId].date);
          } else {
            ret.items.push(ret[data[pathwayId][pathwayStage].standards[standard].valueId].value);
          }
        } else {
          ret.items.push("?");
        }
        ret.items.push(ret.opportunities.map(function(v){return '<span style="width:13px;height:13px;float:left;background-color:' + Highcharts.getOptions().colors[v] + '"></span>';}).join(""));
        ret.items.push(data.numberOfStandardsMissed(patientId));
        return ret;
      });

      var localData = {
        "patients": patients,
        "n": patients.length,
        "header": header,
        "header-items": [{
          "title": "NHS no.",
          "isSorted": false,
          "direction": "sort-asc",
          "tooltip": "NHS number of each patient"
        }]
      };

      //middle column is either value or date
      if (data[pathwayId][pathwayStage].standards[standard].dateORvalue) {
        localData["header-items"].push({
          "title": data[pathwayId][pathwayStage].standards[standard].valueName,
          "tooltip": data[pathwayId][pathwayStage].standards[standard].dateORvalue === "date" ? "Last date " + data[pathwayId][pathwayStage].standards[standard].value + " was measured" : "Last " + data[pathwayId][pathwayStage].standards[standard].value + " reading",
          "isSorted": false,
          "direction": "sort-asc"
        });
      } else {
        if (pathwayStage === lookup.categories.monitoring.name) {
          localData["header-items"].push({
            "title": "Last BP Date",
            "isSorted": false,
            "direction": "sort-asc",
            "tooltip": "Last date BP was measured"
          });
        } else {
          localData["header-items"].push({
            "title": "Last SBP",
            "tooltip": "Last systolic BP reading",
            "isSorted": false,
            "direction": "sort-asc"
          });
        }
      }

      //add qual standard column
      localData["header-items"].push({
        "title": "Categories",
        "titleHTML": 'tba',
        "isUnSortable": true,
        "tooltip": "Categories from above chart"
      });
      //add qual standard column
      localData["header-items"].push({
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isSorted": true,
        "direction": "sort-desc",
        "tooltip": "Total number of improvement opportunities available across all conditions"
      });

      if (sortField === undefined) sortField = 2;
      if (sortField !== undefined) {
        localData.patients.sort(function(a, b) {
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

        for (i = 0; i < localData["header-items"].length; i++) {
          if (i === sortField) {
            localData["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
            localData["header-items"][i].isAsc = sortAsc;
            localData["header-items"][i].isSorted = true;
          } else {
            localData["header-items"][i].isSorted = false;
          }
        }
      }

      base.createPanelShow(patientList, patientsPanel, localData, {
        "header-item": $("#patient-list-header-item").html(),
        "item": $('#patient-list-item').html()
      });

      $('#patients-placeholder').hide();

      base.setupClipboard($('.btn-copy'), true);

      base.wireUpTooltips();

      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });

    });

  },

  create: function(panel, pathwayId, pathwayStage, standard, loadContentFn) {

    var panelId = panel.attr("id");

    if (base.panels[panelId] &&
      base.panels[panelId].id === ID &&
      base.panels[panelId].pathwayId === pathwayId &&
      base.panels[panelId].pathwayStage === pathwayStage &&
      base.panels[panelId].standard === standard) {
      //Already showing the right thing
      return;
    }

    base.panels[panelId] = {
      id: ID,
      pathwayId: pathwayId,
      pathwayStage: pathwayStage,
      standard: standard
    };

    var tempMust = $('#patients-panel-yes').html();
    panel.html(Mustache.render(tempMust));

    pl.wireUp(function(patientId) {
      history.pushState(null, null, '#patient/' + [patientId, pathwayId, pathwayStage, standard].join("/"));
      loadContentFn('#patient/' + [patientId, pathwayId, pathwayStage, standard].join("/"));
    });
    pl.populate(pathwayId, pathwayStage, standard, null);
  }

};

module.exports = pl;

},{"../base.js":2,"../data.js":4,"../lookup.js":7}],20:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  chart = require('../chart.js'),
  qualityStandard = require('./qualityStandard.js'),
  otherCodes = require('./otherCodes.js'),
  medication = require('./medication.js'),
  trend = require('./trend.js'),
  individualActionPlan = require('./individualActionPlan.js'),
  patientList = require('./patientList.js');

var pt = {

  create: function(pathwayId, pathwayStage, standard) {
    var tabData = [];
    for (var key in data[pathwayId][pathwayStage].standards) {
      tabData.push({
        "header": data[pathwayId][pathwayStage].standards[key].tab,
        "active": key === standard,
        "url": window.location.hash.replace(/\/no.*/g, '\/no/' + key)
      });
    }
    return base.createPanel(patientsPanelTemplate, {
      "pathwayStage": pathwayStage,
      "header": data[pathwayId][pathwayStage].standards[standard].chartTitle,
      "tooltip": data[pathwayId][pathwayStage].standards[standard].tooltip,
      "url": window.location.hash.replace(/\/yes.*/g, '').replace(/\/no.*/g, ''),
      "tabs": tabData,
      "text": data[pathwayId][pathwayStage].text
    }, {
      "content": $('#patients-panel-no').html(),
      "tab-header": $('#patients-panel-no-tabs').html(),
      "tab-content": $('#patients-panel-no-page').html()
    });
  },

  createOk: function(pathwayId, pathwayStage) {
    return base.createPanel(patientsPanelTemplate, {
      "ok": true,
      "pathwayStage": pathwayStage,
      "url": window.location.hash.replace(/\/yes/g, '').replace(/\/no/g, ''),
      "text": data[pathwayId][pathwayStage].text
    }, {
      "content": $('#patients-panel-yes').html()
    });
  },

  wireUp: function(pathwayId, pathwayStage, location, standard) {

    patientList.wireUp(function(patientId){
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr("title");

      pt.showPathwayStagePatientView(patientId, pathwayId, selected, standard);
    });

    patientsPanel = $('#patients');

    location.off('click', '#breakdown-chart');
    location.on('click', '#breakdown-chart', function() {
      if (!lookup.chartClicked) {
        /*jshint unused: true*/
        $('path.c3-bar').attr('class', function(index, classNames) {
          return classNames.replace(/_unselected_/g, '');
        });
        /*jshint unused: false*/

        if (lookup.charts['breakdown-chart']) lookup.charts['breakdown-chart'].unselect();

        patientList.populate(pathwayId, pathwayStage, standard, null);
        data.subselected = null;

        farRightPanel.fadeOut(200);
      }
      lookup.chartClicked = false;
    });

    chart.destroyCharts(['breakdown-chart']);
    setTimeout(function() {
      lookup.charts['breakdown-chart'] = c3.generate({
        bindto: '#breakdown-chart',
        tooltip: {
          format: {
            name: function(name, a, b) {
              var text = data[pathwayId][pathwayStage].standards[standard].opportunities[lookup.index].desc;
              var html = "";
              while (text.length > 40) {
                if (text.indexOf(' ', 40) < 0) break;
                html += text.substr(0, text.indexOf(' ', 40)) + '<br>';
                text = text.substr(text.indexOf(' ', 40) + 1);
              }
              html += text;
              return html;
            },
            value: function(value, ratio, id, index) {
              lookup.index = index;
              return value;
            }
          }
        },
        data: {
          columns: [
            ["Patients"].concat(data[pathwayId][pathwayStage].standards[standard].opportunities.map(function(val) {
              return val.patients.length;
            }))
          ],
          type: 'bar',
          labels: true,
          color: function(color, d) {
            return lookup.colors[d.index];
          },
          selection: {
            enabled: true
          },
          onclick: function(d) {
            chart.selectPieSlice('breakdown-chart', d);
            patientList.populate(pathwayId, pathwayStage, standard, data[pathwayId][pathwayStage].standards[standard].opportunities[d.index].name);
            data.subselected = data[pathwayId][pathwayStage].standards[standard].opportunities[d.index].name;

            //colour table appropriately - need to add opacity
            var sliceColourHex = lookup.colors[d.index];
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            sliceColourHex = sliceColourHex.replace(shorthandRegex, function(m, r, g, b) {
              return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sliceColourHex);
            var opacity = 0.2;
            var sliceColour = 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ',' + opacity + ')';

            $('.table.patient-list.table-head-hidden').css({
              "backgroundColor": sliceColour
            });
          }
        },
        bar: {
          width: {
            ratio: 0.5
          }
        },
        legend: {
          show: false
        },
        grid: {
          focus: {
            show: false
          }
        },
        axis: {
          x: {
            type: 'category',
            categories: data[pathwayId][pathwayStage].standards[standard].opportunities.map(function(val) {
              return val.name;
            }),
            label: false
          },
          y: {
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
          }
        }
      });
    }, 1);
  },

  wireUpOk: function(pathwayId, pathwayStage, location) {
    patientsPanel = $('#patients');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pt.populateOk(pathwayId, data.selected, data.subselected, $(this).index(), sortAsc);
    }).on('click', 'tbody tr', function(e) { //Select individual patient when row clicked
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      pt.showPathwayStagePatientView(patientId, pathwayId, data.selected, null);
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });

    data.selected = pathwayStage;
    data.subselected = null;
  },

  populateOk: function(pathwayId, pathwayStage, subsection, sortField, sortAsc) {
    var pList = [],
      i, k, prop, header, tooltip;
    patientsPanel.fadeOut(200, function() {
      $(this).fadeIn(200);
    });

    pList = data[pathwayId][pathwayStage].patientsOk;
    header = data[pathwayId][pathwayStage].text.panelOkHeader.text;
    tooltip = data[pathwayId][pathwayStage].text.panelOkHeader.tooltip;

    pList = data.removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
      var ret = data.patients[patientId];
      ret.nhsNumber = data.patLookup ? data.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(data.patients[patientId].breach ? data.numberOfStandardsMissed(patientId) : 0);
      return ret;
    });
    var localData = {
      "patients": patients,
      "n": patients.length,
      "header": header,
      "tooltip": tooltip,
      "header-items": [{
        "title": "NHS no.",
        "isSorted": false,
        "direction": "sort-asc"
      }, {
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isSorted": true,
        "direction": "sort-desc",
        "tooltip": "Total number of improvement opportunities available across all conditions"
      }]
    };

    if (sortField === undefined) sortField = 1;

    localData.patients.sort(function(a, b) {
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

    for (i = 0; i < localData["header-items"].length; i++) {
      if (i === sortField) {
        localData["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
        localData["header-items"][i].isAsc = sortAsc;
        localData["header-items"][i].isSorted = true;
      } else {
        localData["header-items"][i].isSorted = false;
      }
    }


    base.createPanelShow(patientList, patientsPanel, localData, {
      "header-item": $("#patient-list-header-item").html(),
      "item": $('#patient-list-item').html()
    });

    $('#patients-placeholder').hide();

    base.setupClipboard($('.btn-copy'), true);

    base.wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if (c && c.length > 0) {
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });
    }
  },

  //Show patient view within the pathway stage view
  showPathwayStagePatientView: function(patientId, pathwayId, pathwayStage, standard) {
    data.patientId = patientId;

    base.switchTo110Layout();

    pt.showIndividualPatientPanel(pathwayId, pathwayStage, standard, patientId);
  },

  showIndividualPatientPanel: function(pathwayId, pathwayStage, standard, patientId) {
    var stan = data[pathwayId][pathwayStage].standards[standard] ? data[pathwayId][pathwayStage].standards[standard].tab.title : "UNSPECIFIED";

    data.options.sort(function(a, b) {
      a = data.getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = data.getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if (a === b) return 0;
      if (a === "not") return 1;
      if (b === "not") return -1;
      if (a === "ok") return 1;
      if (b === "ok") return -1;
      alert("!!!!!!!");
    });

    var panel = base.createPanel($('#patient-panel'), {
      "options": data.options,
      "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
      "standard": stan,
      "pathwayStage": pathwayStage,
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    }, {
      "option": $('#patient-panel-drop-down-options').html()
    });

    if (standard === null) {
      //Must be a patient from the *** OK group
      standard = data.options.filter(function(val) {
        return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage;
      })[0].standard;
    }

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = individualActionPlan.create(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = qualityStandard.create(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = trend.create(pathwayId, pathwayStage, standard, patientId);
    var medPanel = medication.create(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = otherCodes.create(pathwayId, pathwayStage, standard, patientId);
    var medCodeWrapperPanel = base.createPanel($('#other-codes-and-meds-wrapper-panel'));
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medCodeWrapperPanel);
    $('#temp-hidden #medCodeWrapperPanel').append(medPanel).append(codesPanel);

    if (farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(500, function() {
        $(this).html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        individualActionPlan.wireUp(pathwayId, pathwayStage, standard, patientId);
        qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
        base.wireUpStandardDropDown(pathwayId, pathwayStage, standard, pt.showIndividualPatientPanel);
        trend.wireUp(pathwayId, pathwayStage, standard, patientId);
        medication.wireUp(pathwayId, pathwayStage, standard, patientId);
        otherCodes.wireUp(pathwayId, pathwayStage, standard, patientId);
        chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        $(this).fadeIn(500, function() {});
      });
    } else {
      farRightPanel.html($('#temp-hidden').html());
      $('#temp-hidden').html("");
      individualActionPlan.wireUp(pathwayId, pathwayStage, standard, patientId);
      qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
      base.wireUpStandardDropDown(pathwayId, pathwayStage, standard, pt.showIndividualPatientPanel);
      trend.wireUp(pathwayId, pathwayStage, standard, patientId);
      medication.wireUp(pathwayId, pathwayStage, standard, patientId);
      otherCodes.wireUp(pathwayId, pathwayStage, standard, patientId);
      chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
      farRightPanel.fadeIn(500, function() {});
    }
  }

};

module.exports = pt;

},{"../base.js":2,"../chart.js":3,"../data.js":4,"../lookup.js":7,"./individualActionPlan.js":15,"./medication.js":17,"./otherCodes.js":18,"./patientList.js":19,"./qualityStandard.js":21,"./trend.js":23}],21:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  confirm = require('./confirm.js');

var ID = "QUALITYSTANDARD";

var qs = {

  create: function(pathwayId, pathwayStage, standard, patientId) {

    var localData = {
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    };
    localData.standard = data.pathwayNames[pathwayId] + ' - ' + pathwayStage;
    if (data.patients[patientId].standards && data.patients[patientId].standards[pathwayId] &&
      data.patients[patientId].standards[pathwayId][pathwayStage] &&
      data.patients[patientId].standards[pathwayId][pathwayStage][standard]) {
      localData.standard = data.patients[patientId].standards[pathwayId][pathwayStage][standard];
    }

    localData.tooltip = data[pathwayId][pathwayStage].standards[standard]["standard-met-tooltip"];

    switch (data.getPatientStatus(patientId, pathwayId, pathwayStage, standard)) {
      case "ok":
        ////farRightPanel.removeClass('standard-missed-page').addClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        localData.achieved = true;
        localData.relevant = true;
        break;
      case "missed":
        ////farRightPanel.addClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        localData.relevant = true;
        localData.achieved = false;
        break;
      case "not":
        ////farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').addClass('standard-not-relevant-page');
        localData.relevant = false;
        break;
    }

    var agObj = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "standard");
    if (agObj && agObj.agree) localData.agree = true;
    else if (agObj && agObj.agree === false) localData.disagree = true;

    return base.createPanel($('#qual-standard'), localData);
  },

  show: function(panel, pathwayId, pathwayStage, standard, patientId){

    var panelId = panel.attr("id");

    if (base.panels[panelId] &&
      base.panels[panelId].id === ID &&
      base.panels[panelId].patientId === patientId) {
        //Already showing the right thing
        return;
    }

    base.panels[panelId] = {
      id: ID,
      patientId: patientId
    };

    panel.html(qs.create(pathwayId, pathwayStage, standard, patientId));
    qs.wireUp(pathwayId, pathwayStage, standard, patientId);
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#qual-agree-disagree'), $('#individual-panel-classification'), pathwayId, pathwayStage, standard, patientId, "standard", "quality standard");
  },

  update: function() {
    $('#individual-panel-classification').find('div').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        var isClassification = $(this).closest("div").data("isClassification") !== undefined;
        any = true;
        var item = log.getAgrees()[data.patientId].filter(function(i) {
          return isClassification ? i.item === "section" : i.item !== "section";
        });
        var tool;
        if (this.value === "yes") {
          if (item && item[0].history) {
            tool = "<p>" + item[0].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          if (item && item[0].history) {
            tool = "<p>" + item[0].history[0] + "</p><p>Click again to edit/cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });

      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }

      if (!any) {
        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      base.wireUpTooltips();
    });

    base.wireUpTooltips();
  }

};

module.exports = qs;

},{"../base.js":2,"../data.js":4,"../log.js":6,"./confirm.js":11}],22:[function(require,module,exports){
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js');

var tap = {

  show: function(location) {
    location.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    base.createPanelShow($('#team-action-plan-panel'), location);

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

      $('#team-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

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
  },

  populateTeamSuggestedActionsPanel: function() {
    var suggestions = base.suggestionList(log.plan[data.pathwayId].team);
    suggestions = base.sortSuggestions(tap.mergeTeamStuff(suggestions));

    base.createPanelShow(suggestedPlanTemplate, suggestedPlanTeam, {
      "suggestions": suggestions
    }, {
      "item": $('#suggested-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });

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

    base.createPanelShow(actionPlanList, parentElem, {
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }, {
      "action-plan": $('#action-plan').html(),
      "action-plan-item": $('#action-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });

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

},{"../base.js":2,"../data.js":4,"../log.js":6,"./confirm.js":11}],23:[function(require,module,exports){
var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  lookup = require('../lookup.js');

var trnd = {

  create: function(pathwayId, pathwayStage, standard, patientId) {
    var agree = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "trend");
    return base.createPanel(valueTrendPanel, {
      "pathway": lookup.monitored[pathwayId],
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "pathwayStage": pathwayStage
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#trend-agree-disagree'), $('#trend-panel'), pathwayId, pathwayStage, standard, patientId, "trend", "trend data");

    $('#trend-panel').on('click', '.table-chart-toggle', function() {
      if ($(this).text() === "Table") {
        $(this).text("Chart");
        $('#chart-demo-trend').hide();
        $('#table-demo-trend').show();

        var c = $('#table-demo-trend .tableScroll').getNiceScroll();
        if (c && c.length > 0) {
          c.resize();
        } else {
          $('#table-demo-trend .tableScroll').niceScroll({
            cursoropacitymin: 0.3,
            cursorwidth: "7px",
            horizrailenabled: false
          });
        }
      } else {
        $(this).text("Table");
        $('#chart-demo-trend').show();
        $('#table-demo-trend').hide();
      }
    });
  }

};

module.exports = trnd;

},{"../base.js":2,"../data.js":4,"../log.js":6,"../lookup.js":7,"./confirm.js":11}],24:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  individualActionPlan = require('./individualActionPlan.js'),
  teamActionPlan = require('./teamActionPlan.js');

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

      $('#team-delete-item').html($($(this).closest('tr').children('td')[1]).find('span').text());

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

      $('#team-delete-item').html($($(this).closest('tr').children('td')[2]).find('span').text());

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
          "task": log.text[log.listActions("team")[k].id].text,
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
          "task": log.listPlans("team")[k].text,
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
        if (log.text[l] && log.listActions()[k][l].agree && ((!log.listActions()[k][l].done && !complete) || (log.listActions()[k][l].done && complete))) {
          individualTasks.push({
            "pathway": "N/A",
            "patientId": k,
            "task": log.text[l].text,
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
            "task": log.listPlans()[k][l].text,
            "data": l,
            "agree": true,
            "done": complete
          });
        }
      }
    }

    var listTemplate = $('#welcome-task-list').html();
    Mustache.parse(listTemplate);
    $('#welcome-tab-content').html(Mustache.render(listTemplate));

    var addTemplate = $('#action-plan').html();
    Mustache.parse(addTemplate);
    var rendered = Mustache.render(addTemplate);
    $('#team-add-plan').html(rendered);

    var tempMust = $('#welcome-task-items').html();
    var itemTemplate = $('#welcome-task-item').html();
    Mustache.parse(tempMust);
    Mustache.parse(itemTemplate);

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
    $('#individual-task-panel').append(rendered);

    welcome.wireUpWelcomePage();
  }

};

module.exports = welcome;

},{"../base.js":2,"../data.js":4,"../log.js":6,"./individualActionPlan.js":15,"./teamActionPlan.js":22}],25:[function(require,module,exports){
var data = require('./data.js'),
  lookup = require('./lookup.js'),
  base = require('./base.js'),
  patients = require('./panels/patients.js'),
  patientList = require('./panels/patientList.js'),
  teamActionPlan = require('./panels/teamActionPlan.js'),
  allPatients = require('./panels/allPatients.js'),
  welcome = require('./panels/welcome.js'),
  layout = require('./layout.js'),
  overview = require('./views/overview.js'),
  indicatorView = require('./views/indicator.js'),
  patientView = require('./views/patient.js');

var template = {

  loadContent: function(hash, isPoppingState) {
    base.hideTooltips();

    var i, pathwayId, pathwayStage, standard, indicator, patientId;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    if (hash === '') {
      base.clearBox();
      layout.showPage('login');
      $('html').removeClass('scroll-bar');
    } else {
      $('html').addClass('scroll-bar');
      var params = {};
      var urlBits = hash.split('/');
      if(hash.indexOf('?')>-1) {
        hash.split('?')[1].split('&').forEach(function(param){
          var elems = param.split("=");
          params[elems[0]] = elems[1];
        });
        urlBits = hash.split('?')[0].split('/');
      }

      if (urlBits[0] === "#overview" && !urlBits[1]) {

        overview.create(template.loadContent);

      } else if (urlBits[0] === "#overview") {

        indicatorView.create(urlBits[1], urlBits[2], urlBits[3], params.tab || "trend", template.loadContent);

      } else if (urlBits[0] === "#main") {
        base.clearBox();
        pathwayId = urlBits[1];
        data.pathwayId = pathwayId;
        pathwayStage = urlBits[2];
        var yesPeople = urlBits[3] !== "no";
        standard = urlBits[4];

        if (pathwayStage && layout.page !== 'main-dashboard') {
          $('.page').hide();
          $('#main-dashboard').show();

          ////layout.showSidePanel();
          layout.showOverviewPanels();
          layout.showHeaderBarItems();
        }

        if (pathwayStage) {
          if (yesPeople) {
            template.showPathwayStageViewOk(pathwayId, pathwayStage, template.shouldWeFade(lookup.currentUrl, hash));
          } else {
            template.showPathwayStageView(pathwayId, pathwayStage, standard, template.shouldWeFade(lookup.currentUrl, hash));
          }
        } else {
          template.showOverview(pathwayId);
        }

        base.wireUpTooltips();

      } else if (urlBits[0] === "#help") {
        base.clearBox();
        layout.showPage('help-page');

        layout.showHeaderBarItems();

      } else if (urlBits[0] === "#patient") {

        //create(pathwayId, pathwayStage, standard, patientId)
        patientView.create(urlBits[2], urlBits[3], urlBits[4], urlBits[1]);

      } else if (urlBits[0] === "#patients") {

        patientId = urlBits[1];
        pathwayId = urlBits[2];

        allPatients.showView(patientId, true);

        base.wireUpTooltips();

        if (patientId) {
          var nhs = data.patLookup ? data.patLookup[patientId] : patientId;
          $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0, $('#patients td').filter(function() {
            return $(this).text().trim() === nhs;
          }).position().top - 140);
          $('#patients').find('tr:contains(' + nhs + ')').addClass("highlighted");
        }
      } else if (urlBits[0] === "#agreedactions") {
        base.clearBox();
        layout.showPage('welcome');

        ////layout.showSidePanel();
        layout.showHeaderBarItems();
        ////layout.showNavigation(data.diseases, -1, $('#welcome'));

        $('#welcome-tabs li').removeClass('active');
        $('#outstandingTasks').closest('li').addClass('active');

        welcome.populate();


      } else {
        //if screen not in correct segment then select it
        alert("shouldn't get here");
        pathwayStage = hash.substr(1);

        template.showPathwayStageView(pathwayStage);

        base.wireUpTooltips();
      }
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
    base.updateTitle(data[data.pathwayId]["display-name"] + ": Overview (practice-level data)");

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

  //Show the pathway stage for a disease
  showPathwayStageView: function(pathwayId, pathwayStage, standard, shouldFade) {
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    data.pathwayId = pathwayId;
    layout.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage, "g");
    $('aside a').filter(function() {
      return this.href.match(re);
    }).parent().addClass('active');

    base.switchTo110Layout();

    if (!standard) {
      standard = Object.keys(data[pathwayId][pathwayStage].standards)[0];
    }

    var panel = patients.create(pathwayId, pathwayStage, standard);

    if (shouldFade) {
      farLeftPanel.fadeOut(100, function() {
        $(this).html(panel);
        patients.wireUp(pathwayId, pathwayStage, farLeftPanel, standard);
        patientList.populate(pathwayId, pathwayStage, standard, null);
        $('#mainTitle').hide();
        base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(100);
      });
    } else {
      farLeftPanel.html(panel);
      patients.wireUp(pathwayId, pathwayStage, farLeftPanel, standard);
      patientList.populate(pathwayId, pathwayStage, standard, null);
      $('#mainTitle').hide();
      base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
    }

    var tempMust = $('#patient-panel-placeholder').html();
    farRightPanel.html(Mustache.render(tempMust));
  },

  showPathwayStageViewOk: function(pathwayId, pathwayStage, shouldFade) {
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    layout.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage, "g");
    $('aside a').filter(function() {
      return this.href.match(re);
    }).parent().addClass('active');

    base.switchTo110Layout();

    var panel = patients.createOk(pathwayId, pathwayStage);

    if (shouldFade) {
      farLeftPanel.fadeOut(200, function() {
        $(this).html(panel);
        patients.wireUpOk(pathwayId, pathwayStage, farLeftPanel);
        patients.populateOk(pathwayId, pathwayStage, null);
        $('#mainTitle').hide();
        base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(300);
      });
      var tempMust = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(tempMust));
    } else {
      farLeftPanel.html(panel);
      patients.wireUpOk(pathwayId, pathwayStage, farLeftPanel);
      patients.populateOk(pathwayId, pathwayStage, null);
      $('#mainTitle').hide();
      base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
    }
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

},{"./base.js":2,"./data.js":4,"./layout.js":5,"./lookup.js":7,"./panels/allPatients.js":10,"./panels/patientList.js":19,"./panels/patients.js":20,"./panels/teamActionPlan.js":22,"./panels/welcome.js":24,"./views/indicator.js":26,"./views/overview.js":27,"./views/patient.js":28}],26:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  patientList = require('../panels/patientList.js'),
  indicatorBreakdown = require('../panels/indicatorBreakdown.js'),
  indicatorTrend = require('../panels/indicatorTrend.js'),
  teamActionPlan = require('../panels/teamActionPlan.js'),
  layout = require('../layout.js');

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

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      base.switchTo21Layout();
      layout.showMainView();

      layout.view = ID;
    }

    if(layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage) {
      //different pathway or stage so title needs updating
      base.updateTitle([{
        title: "Overview",
        url: "#overview"
      }, {
        title: data[pathwayId][pathwayStage].text.page.text,
        tooltip: data[pathwayId][pathwayStage].text.page.tooltip
      }]);
      $('#mainTitle').show();
    }

    //TODO not sure if this needs moving..?
    data.pathwayId = pathwayId;

    //The three panels we need to show
    //Panels decide whether they need to redraw themselves
    teamActionPlan.show(farRightPanel);
    patientList.create(bottomRightPanel, pathwayId, pathwayStage, standard, loadContentFn);
    indicatorTrend.create(topRightPanel, pathwayId, pathwayStage, standard, tab, patientList.selectSubsection);

    base.wireUpTooltips();

  }

};

module.exports = ind;

},{"../base.js":2,"../data.js":4,"../layout.js":5,"../panels/indicatorBreakdown.js":12,"../panels/indicatorTrend.js":14,"../panels/patientList.js":19,"../panels/teamActionPlan.js":22}],27:[function(require,module,exports){
var base = require('../base.js'),
  data = require('../data.js'),
  layout = require('../layout.js'),
  indicatorList = require('../panels/indicatorList.js'),
  teamActionPlan = require('../panels/teamActionPlan.js');

var ID = "OVERVIEW";
/*
 * The overview page consists of the panels:
 *   Indicator list
 *   Team action plan
 */
var overview = {

  create: function(loadContentFn) {

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      base.switchTo101Layout();
      layout.showMainView();

      $('#mainTitle').show();
      base.updateTitle("Overview");

      layout.view = ID;
    }

    data.pathwayId = "htn";//TODO fudge

    //The two panels we need to show
    //Panels decide whether they need to redraw themselves
    teamActionPlan.show(farRightPanel);
    indicatorList.create(farLeftPanel, loadContentFn);

    base.wireUpTooltips();

  }

};

module.exports = overview;

},{"../base.js":2,"../data.js":4,"../layout.js":5,"../panels/indicatorList.js":13,"../panels/teamActionPlan.js":22}],28:[function(require,module,exports){
var lifeline = require('../panels/lifeline.js'),
  data = require('../data.js'),
  base = require('../base.js'),
  layout = require('../layout.js'),
  individualActionPlan = require('../panels/individualActionPlan.js'),
  qualityStandard = require('../panels/qualityStandard.js');

var ID = "PATIENT_VIEW";
/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

var pv = {

  wireUp: function() {

  },

  create: function(pathwayId, pathwayStage, standard, patientId) {

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      base.switchTo21Layout();
      layout.showMainView();

      layout.view = ID;
    }

    if(layout.pathwayId !== pathwayId || layout.pathwayStage !== pathwayStage ||
      layout.standard !== standard || layout.patientId !== patientId) {
      //different pathway or stage or patientId so title needs updating
      $('#mainTitle').show();
      base.updateTitle([{
        title: "Overview",
        url: "#overview"
      }, {
        title: data[pathwayId][pathwayStage].text.page.text,
        tooltip: data[pathwayId][pathwayStage].text.page.tooltip,
        url: ["#overview", pathwayId, pathwayStage, standard].join("/")
      }, {
        title: patientId
      }]);
    }

    data.pathwayId = pathwayId;

    individualActionPlan.show(farRightPanel, pathwayId, pathwayStage, standard, patientId);
    qualityStandard.show(topRightPanel, pathwayId, pathwayStage, standard, patientId);
    data.getPatientData(patientId, function(data) {
      lifeline.create('bottom-right-panel', patientId, data);
    });

    base.wireUpTooltips();

  },

  populate: function() {

  }

};

module.exports = pv;

},{"../base.js":2,"../data.js":4,"../layout.js":5,"../panels/individualActionPlan.js":15,"../panels/lifeline.js":16,"../panels/qualityStandard.js":21}]},{},[1]);
