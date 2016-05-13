var Highcharts = require('highcharts/highstock'),
  data = require('./data.js'),
  lookup = require('./lookup.js'),
  log = require('./log.js'),
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

    var target = 0.75,
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
      var y = +data.values[1][i] / +data.values[2][i];
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

    series[1].data.push([maxXvalue, maxXvalue * gradient + intercept]);
    for (var i = 0; i < 13; i++) {
      var x = compDate.getTime();
      if (x < maxXvalue) {
        compDate.setMonth(compDate.getMonth() + 1);
        continue;
      }
      series[1].data.push([x, x * gradient + intercept]);
      var m = compDate.getMonth();
      compDate.setMonth(compDate.getMonth() + 1);
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
        max: maxValue + 0.05,
        min: 0,
        plotLines: [{
          value: target,
          color: 'green',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Target - ' + (target * 100) + '%'
          },
        }]
      },
      legend: { enabled: true },

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

            if (cht.cloneToolTip) {
              this.container.firstChild.removeChild(cht.cloneToolTip);
              cht.cloneToolTip = null;
            }
            if (cht.cloneToolTip2) {
              cht.cloneToolTip2.remove();
              cht.cloneToolTip2 = null;
            }

            return false;
          }
        }
      },
      title: {
        text: 'Patients not meeting the standard'
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

                if (cht.cloneToolTip) {
                  this.series.chart.container.firstChild.removeChild(cht.cloneToolTip);
                }
                if (cht.cloneToolTip2) {
                  cht.cloneToolTip2.remove();
                }
                cht.cloneToolTip = this.series.chart.tooltip.label.element.cloneNode(true);
                this.series.chart.container.firstChild.appendChild(cht.cloneToolTip);

                cht.cloneToolTip2 = $('.highcharts-tooltip').clone();
                $(this.series.chart.container).append(cht.cloneToolTip2);

                return false;
              }
            }
          }
        }
      },

      series: [{
        data: data.map(function(v, i) {
          return {
            y: v[v.length - 1],
            color: Highcharts.getOptions().colors[i]
          };
        })
      }]
    });
  }

};

module.exports = cht;
