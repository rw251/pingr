

var plotLifeline = function(element, data) {
  var elementId = '#'+element;
  /**
   * In order to synchronize tooltips and crosshairs, override the
   * built-in events with handlers defined on the parent element.
   */
  $(elementId).bind('mousemove touchmove touchstart', function(e) {
    var chart,
      point,
      i,
      event,
      series;

    for (i = 0; i < Highcharts.charts.length; i = i + 1) {
      if (i === 0 || i >= Highcharts.charts.length - 2) continue;
      chart = Highcharts.charts[i];
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
      Highcharts.each(Highcharts.charts, function(chart) {
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
        data: []
      };
      $.each(task.intervals, function(j, interval) {
        item.data.push({
          x: interval.from,
          y: i + 0.49,
          label: interval.label,
          from: interval.from,
          to: interval.to
        }, {
          x: interval.to,
          y: i + 0.49,
          from: interval.from,
          to: interval.to
        });

        // add a null value between intervals
        if (task.intervals[j + 1]) {
          item.data.push(
            [(interval.to + task.intervals[j + 1].from) / 2, null]
          );
        }

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
      "Prescription": {
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
          marker: markers[contact.name]
        });
      }
      contactSeries[contact.name].data.push([
          contact.time,
          contact.task
      ]);
    });

    series = series.concat(Object.keys(contactSeries).map(function(key) {
      return contactSeries[key];
    }));

    // create the chart
    $('<div class="chart condition-chart">')
      .appendTo(elementId)
      .highcharts({

        chart: {
          renderTo: element,
          marginLeft: 40, // Keep all charts left aligned
          spacingTop: 20,
          spacingBottom: 20
        },

        title: {
          text: ''
        },


        xAxis: {
          type: 'datetime',
          min: Date.UTC(2013, 6, 12),
          max: Date.UTC(2016, 3, 5),
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
        },

        yAxis: {
          tickInterval: 1,
          labels: {
            formatter: function() {
              if (conditions[this.value]) {
                return conditions[this.value].name;
              }
            },
            /*align: 'left',
            x: 2,*/
            y: -4
          },
          startOnTick: false,
          endOnTick: false,
          title: {
            text: ''
          },
          minPadding: 0.2,
          maxPadding: 0.2
        },
        credits: {
          enabled: false
        },

        legend: {
          enabled: false
        },

        tooltip: {
          formatter: function() {
            if (this.series.data[0].y !== 1) {
              //Range ergo condition
              var xCoord = this.x;
              var label = conditions[Math.floor(this.y)].intervals.filter(function(v) {
                return xCoord >= v.from && xCoord <= v.to;
              })[0].label;
              return '<b>' + conditions[Math.floor(this.y)].name + (label ? ': ' + label : '') + '</b><br/>' +
                Highcharts.dateFormat('%Y:%m:%d', this.point.options.from) +
                ' - ' + Highcharts.dateFormat('%Y:%m:%d', this.point.options.to);
            } else {
              //Single value hence contact
              var time = this.key;
              return contacts.filter(function(val) {
                return val.data && val.data.filter(function(v) {
                  return v[0] === time;
                }).length > 0;
              }).map(function(val) {
                return '<b>' + val.name + '</b><br/>' + Highcharts.dateFormat('%Y:%m:%d', val.time);
              }).join('<br/>');
            }
          }
        },

        plotOptions: {
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
        },

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
        series: [{
          data: dataset.data,
          name: dataset.name,
          type: dataset.type,
          color: Highcharts.getOptions().colors[i],
          fillOpacity: 0.3
        }]
      };

      if (dataset.name === "Blood pressure") {
        chartOptions.tooltip.pointFormat = "<b>BP:</b> {point.low}/{point.high} mmHg<br/>";
        chartOptions.series.tooltip = {};
      }

      if (i === measurements.datasets.length - 1) {
        chartOptions.xAxis = {
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          type: 'datetime'
        };
      }
      $('<div class="chart' + (i === measurements.datasets.length - 1 ? " last-measurement-chart" : "") + '">')
        .appendTo(elementId)
        .highcharts(chartOptions);

    });
  };

  var plotNavigator = function() {
    var chart = $('<div class="chart navigator-chart">')
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
        data: []
      };
      $.each(task.intervals, function(j, interval) {
        item.data.push([i + 0.49, interval.from, interval.to]);
      });

      series.push(item);
    });

    // create the chart
    return $('<div class="chart condition-chart">')
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
          tickPixelInterval:100
        },

        xAxis: {
          labels: {
            enabled:false
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
          }
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
                var label = medications[Math.floor(this.x)].intervals.filter(function(v,i) {
                  if(yCoord >= v.from && yCoord <= v.to) {
                    idx = i;
                    return true;
                  }
                  return false;
                })[0].label;
                return this.y===this.point.low &&
                  ( medications[Math.floor(this.x)].intervals.length-1===idx ||
                    (this.series.chart.yAxis[0].min <= yCoord &&  this.series.chart.yAxis[0].max >= yCoord) ||
                   (this.series.chart.yAxis[0].min >= this.point.low &&  this.series.chart.yAxis[0].max <= this.point.high) ) ? medications[Math.floor(this.x)].name + (label ? ': ' + label : '') : '';
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
  c.highcharts().axes[1].setExtremes(1434864000000,1459814400000,undefined,false,{trigger:'syncExtremes'});
  var s = syncExtremes.bind(c.highcharts().series[0]);
  s({trigger: 'navigator',min:1434864000000,max:1459814400000});

};

$(document).on('ready', function(){
  $.getJSON('lifelinedata.json', function(data) {
    plotLifeline('container',data);
  });
});
