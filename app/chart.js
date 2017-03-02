var Highcharts = require('highcharts/highstock'),
  data = require('./data'),
  lookup = require('./lookup'),
  log = require('./log');

console.log("chart.js: data.lastloader= " + data.lastloader);
data.lastloader = "chart.js";

var cht = {

  drawBenchmarkChartHC: function(element, pathwayId, pathwayStage, standard) {
    //pull all data from data.js
    var _data;

    //fully async load
    //pull out the necessary data and structure for display
    data.getPracticePerformanceData(pathwayId, pathwayStage, standard, function(dataObj) {
      _data = dataObj;
      //sort these into smallest to largest (last = largest always)
      _data.sort(function(a, b) {
        return a.x - b.x;
      });

      var isCCG = $('#practice_id').text() === "ALL";

      var title = isCCG ? "An illustration of the current performance of practices in Salford" : "An illustration of your current performance amongst other practices in Salford";
      //find max in order to set the ceiling of the chart
      var maxHeight = Math.round(_data[_data.length - 1].x);
      var maxAdd = Math.round(maxHeight * 0.1);
      maxHeight += maxAdd;
      if (maxHeight > 100) {
        maxHeight = 100;
      }

      //find min in order to set the floor of the chart - to be implemented if desired
      var minHeight = 0;
      var local = true;

      var bChart = $('#' + element).highcharts({
          chart: {
            type: 'column',
            events: {
              load: function() {
                var thisChart = this;
                if (!isCCG) {
                  thisChart.renderer.button('Toggle neighbourhood - ccg', thisChart.plotWidth - 160, 0, function() {
                    local = !local;
                    thisChart.xAxis[0].categories = _data.filter(function(v) {
                      if (local) return v.local;
                      else return true;
                    }).map(function(v) {
                      return v.pFull;
                    });
                    thisChart.series[0].setData(_data.filter(function(v) {
                      if (local) {
                        return v.local;
                      } else {
                        return true;
                      }
                    }).map(function(v) {
                      //this is for the (?local/global) chart...
                      if (v.p === "You") {
                        //apple
                        return { y: v.x, color: "#0EDE61" };
                      } else if (v.local) {
                        //dark
                        return { y: v.x, color: "#444444" };
                      } else {
                        //blue
                        return { y: v.x, color: "#5187E8" };
                      }
                    }));
                  }).add();
                }
              }
            }
          },
          title: { text: title },
          xAxis: {
            categories: _data.filter(function(v) {
              return isCCG || v.local === local;
            }).map(function(v) {
              return v.pFull;
            }),
            crosshair: true
          },
          yAxis: {
            //make the following dynamic
            min: minHeight,
            max: maxHeight,
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
            data: _data.filter(function(v) {
              return isCCG || v.local === local;
            }).map(function(v) {
              if (v.p === "You") {
                //you colour - apple
                return { y: v.x, color: "#0EDE61" };
              } else {
                //standrd colour - dark
                return { y: v.x, color: "#444444" };
              }
            })
          }]
        },
        function(chart) { // on complete
          //force chart size based on container parameters
          chart.setSize($('.highcharts-container').width(), $('#benchmark-chart').height());
          //set text labels to mid of axies
          var textX = chart.plotLeft + (chart.plotWidth * 0.5);
          var textY = chart.plotTop + (chart.plotHeight * 0.5);

          //LEGACY this applied the 'coming soon' text
          /*var span = '<span id="pieChartInfoText" style="position:absolute; text-align:center;-ms-transform: rotate(335deg);-webkit-transform: rotate(335deg);transform: rotate(335deg);">';
          span += '<span style="font-size: 64px">Coming Soon!</span>';
          span += '</span>';*/

          /*$("#benchmark-chart").append(span);
          span = $('#pieChartInfoText');
          span.css('left', textX + (span.width() * -0.5));
          span.css('top', textY + (span.height() * -0.5));*/
        });
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
      maxXvalue = 0,
      minXvalue = 999999999;

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

    minXvalue = aprilBeforeThat.getTime();

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
      series[0].data.push({x: time, y: y, label: data.values[1][i] + "/" + data.values[2][i]});
      maxValue = Math.max(maxValue, y);
      maxXvalue = Math.max(maxXvalue, time);
      minXvalue = Math.min(minXvalue, time);
    });

    intercept = (sumY * sumXX - sumX * sumXY) / (n * sumXX - sumX * sumX);
    gradient = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    var newCompDate = new Date(lastApril.getTime());
    series[1].data.push([maxXvalue, maxXvalue * gradient + intercept]);
    for (var i = 0; i < 13; i++) {
      var x = newCompDate.getTime();
      if (x < maxXvalue) {
        newCompDate.setMonth(newCompDate.getMonth() + 1);
        continue;
      }
      series[1].data.push([x, x * gradient + intercept]);
      maxValue = Math.max(maxValue, x * gradient + intercept);
      var m = newCompDate.getMonth();
      newCompDate.setMonth(newCompDate.getMonth() + 1);
    }

    //Add line of best fit for latest data since april to next april


    //Default to last april - april


    var c = $('#' + element).highcharts({
      title: { text: '' },
      xAxis: {
        min: minXvalue,
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
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:.2f}%</b> ({point.label})<br/>'
      },

      navigator: {
        enabled: true
      },

      series: series
    });

    c.highcharts().axes[0].setExtremes(lastApril.getTime(), nextApril.getTime(), undefined, false);

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
          return this.point.desc.replace(/<a[^h]+href=[\"'].*?[\"'][^h]*>(.*?)<\/a>/, "$1").match(/.{1,40}[^ ]* ?/g).join("<br>");
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
