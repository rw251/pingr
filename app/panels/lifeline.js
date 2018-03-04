const Highcharts = require('highcharts/highstock');
require('highcharts/highcharts-more')(Highcharts);

// Define a custom symbol path
Highcharts.SVGRenderer.prototype.symbols.bar = (x, y, w, h) => ['M', x + (w / 2), y, 'L', x + (w / 2), y + h];
if (Highcharts.VMLRenderer) {
  Highcharts.VMLRenderer.prototype.symbols.bar =
    Highcharts.SVGRenderer.prototype.symbols.bar;
}

const colour = {
  index: 0,
  next() {
    if (this.index >= Highcharts.getOptions().colors.length) this.index = 0;
    else this.index += 1;
    return Highcharts.getOptions().colors[this.index];
  },
  reset() {
    this.index = 0;
  },
};

const ll = {
  chartArray: [],

  destroy(elementId) {
    $(elementId).html('');
    $(elementId).off('mousemove touchmove touchstart', '.sync-chart');

    for (let i = 0; i < Highcharts.charts.length; i += 1) {
      if (
        Highcharts.charts[i] &&
        Highcharts.charts[i].renderTo.className.indexOf('h-chart') > -1
      ) { Highcharts.charts[i].destroy(); }
    }
  },

  show(panel, isAppend, patientId, data) {
    const element = 'lifeline-chart';
    const elementId = `#${element}`;

    // Most recent max date of series minus one month or 1 year whichever is most
    let minMaxDate = new Date();
    minMaxDate.setMonth(minMaxDate.getMonth() - 11);

    ll.destroy(elementId);

    const htmlElement = $(`<div class="panel panel-default"><div class="panel-body"><div id="${element}"></div></div></div>`);

    if (isAppend) panel.append(htmlElement);
    else panel.html(htmlElement);

    colour.reset();
    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */

    $(elementId).on('mousemove touchmove touchstart', '.sync-chart', (e) => {
      let chart;
      let point;
      let i;
      let event;
      let series;

      for (i = 1; i < ll.chartArray.length - 2; i += 1) {
        chart = ll.chartArray[i];
        event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
        // if (i === 0) console.log(event.chartX + " --- " + event.chartY);
        series =
          i === 0
            ? Math.max(
              Math.min(
                Math.floor((130 - event.chartY) / 34),
                chart.series.length - 1
              ),
              0
            )
            : 0;
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
      const thisChart = this.chart;

      if (e.trigger !== 'syncExtremes') {
        // Prevent feedback loop
        Highcharts.each(ll.chartArray, (chart) => {
          if (chart !== thisChart) {
            if (chart.inverted) {
              if (chart.yAxis[0].setExtremes) {
                // It is null while updating
                chart.yAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
              }
            } else if (chart.xAxis[0].setExtremes) {
              // It is null while updating
              chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
            }
          }
        });
      }
    }

    const plotConditions = (conditions) => {
      if (!conditions || conditions.length === 0) return;
      ll.charts += 1;
      const series = [];
      $.each(conditions.reverse(), (i, task) => {
        const item = {
          name: task.name,
          data: [],
          color: colour.next(),
        };

        let latestIntervalEndDate;

        $.each(task.intervals, (j, interval) => {
          if (!latestIntervalEndDate) latestIntervalEndDate = interval.to;
          else {
            latestIntervalEndDate = Math.max(
              latestIntervalEndDate,
              interval.to
            );
          }
          item.data.push([i + 0, interval.from, interval.to]);
        });

        if (latestIntervalEndDate) { minMaxDate = Math.min(latestIntervalEndDate, minMaxDate); }

        series.push(item);
      });

      // $(elementId).append($('<div class="chart-title">Patient conditions and contacts</div>'));
      // create the chart
      const barWidth = 16;
      const barSpace = 1;
      $(`<div class="h-chart h-condition-chart" style="height:${Math.max(50, conditions.length * (barWidth + barSpace))}px">`)
        .appendTo(elementId)
        .highcharts({
          chart: {
            marginLeft: 120, // Keep all charts left aligned
            marginBottom: 0,
            marginTop: 0,
            type: 'columnrange',
            inverted: true,
            backgroundColor: '#F9F3F9',
            borderWidth: 0,
            borderColor: '#ddd',
          },

          title: '',

          yAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: false,

            visible: false,
            // things that are normally xAxis defaults
            endOnTick: false,
            startOnTick: false,
          },

          xAxis: {
            min: -0.6,
            max: conditions.length - 0.5,
            labels: { enabled: false },
            startOnTick: false,
            endOnTick: false,
            title: {
              text: 'Conditions',
              margin: 60,
              rotation: 0,
            },
            tickWidth: 0,
            lineWidth: 1,
          },
          credits: { enabled: false },

          legend: { enabled: false },

          tooltip: {
            formatter() {
              const yCoord = this.y;
              const labelTmp = conditions[Math.floor(this.x)].intervals
                .filter(v => yCoord >= v.from && yCoord <= v.to);
              const label =
                labelTmp.length > 0 ? labelTmp[0].label : 'No label A';
              return (`
                <b>${conditions[Math.floor(this.x)].name}${label ? `: ${label}` : ''}</b>
                <br/>
                ${Highcharts.dateFormat('%d/%m/%Y', this.point.options.low)} - ${Highcharts.dateFormat('%d/%m/%Y', this.point.options.high)}
              `);
            },
            followPointer: true,
          },

          plotOptions: {
            columnrange: {
              grouping: false,
              groupPadding: 0.01, // Defaults to 0.2
              pointWidth: barWidth,
              pointPlacement: 'between',
              dataLabels: {
                allowOverlap: false,
                enabled: true,
                formatter() {
                  const yCoord = this.y;
                  let idx = -1;
                  const labelTmp = conditions[Math.floor(this.x)].intervals.filter((v, i) => {
                    if (yCoord >= v.from && yCoord <= v.to) {
                      idx = i;
                      return true;
                    }
                    return false;
                  });
                  const label = labelTmp.length > 0 ? labelTmp[0].label : 'No label B';
                  return this.y === this.point.low &&
                    (conditions[Math.floor(this.x)].intervals.length - 1 ===
                      idx ||
                      (this.series.chart.yAxis[0].min <= yCoord &&
                        this.series.chart.yAxis[0].max >= yCoord) ||
                      (this.series.chart.yAxis[0].min >= this.point.low &&
                        this.series.chart.yAxis[0].max <= this.point.high))
                    ? conditions[Math.floor(this.x)].name +
                        (label ? `: ${label}` : '')
                    : '';
                },
              },
            },
          },

          series,
        });
    };

    const plotContacts = (contacts) => {
      if (!contacts || contacts.length === 0) return;
      ll.charts += 1;
      const markerTemplate = {
        lineWidth: 1,
        lineColor: 'black',
        radius: 10,
        states: {
          hover: {
            lineColor: 'red',
            radius: 12,
          },
        },
      };
      const markers = {
        default: $.extend({ symbol: 'triangle' }, markerTemplate),
        'Face to face': $.extend({ symbol: 'square' }, markerTemplate),
        Telephone: $.extend({ symbol: 'bar' }, markerTemplate),
        'Hospital admission': $.extend({ symbol: 'triangle' }, markerTemplate),
      };

      let latestContact;
      const contactSeries = contacts.map((v) => {
        if (!latestContact) latestContact = v.time;
        else latestContact = Math.max(latestContact, v.time);
        return { x: v.time, y: 0, name: v.name, marker: markers.Telephone };
      });

      if (latestContact) minMaxDate = Math.min(latestContact, minMaxDate);

      // create the chart
      $('<div class="sync-chart h-chart h-contact-chart">')
        .appendTo(elementId)
        .highcharts({
          chart: {
            renderTo: element,
            marginLeft: 120, // Keep all charts left aligned
            marginTop: 0,
            // marginBottom: 0,
            spacingBottom: 0, // gap between x-axis labels/title and edge of chart
            type: 'scatter',
            backgroundColor: '#F9F3F9',
            borderWidth: 0,
            borderColor: '#ddd',
          },

          title: '',

          xAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: { snap: false },
            events: { setExtremes: syncExtremes },
            labels: {
              enabled: true,
              y: 0, // gap between axis labels and chart
            },

            // things that are normally xAxis defaults
            endOnTick: false,
            gridLineWidth: 0,
            lineWidth: 0,
            maxPadding: 0.01,
            minPadding: 0.01,
            startOnTick: false,
            tickWidth: 0,
            title: { text: '' },
            tickPixelInterval: 100,
          },

          yAxis: {
            labels: { enabled: false },
            min: -0.1,
            max: 0.1,
            startOnTick: false,
            endOnTick: false,
            title: {
              text: 'Contacts',
              margin: 60,
              rotation: 0,
            },
            tickWidth: 0,

            // things that are normally yAxis defaults
            gridLineWidth: 0,
            lineWidth: 1,
          },
          credits: { enabled: false },

          legend: { enabled: false },

          tooltip: {
            formatter() {
              const time = this.x;
              return contacts
                .filter(val => val.time === time)
                .map(val => (`<b>${val.name}</b><br/>${Highcharts.dateFormat('%d/%m/%Y', time)}`))
                .join('<br/>');
            },
            followPointer: true,
          },
          plotOptions: {
            series: {
              states: {
                hover: {
                  enabled: true,
                  halo: { size: 0 },
                },
              },
              events: {
                mouseOut: () => {
                  let chart;
                  for (let i = 1; i < ll.chartArray.length - 2; i += 1) {
                    chart = ll.chartArray[i];
                    chart.tooltip.hide();
                  }
                },
              },
            },
          },

          series: [
            { data: contactSeries },
          ],
        });
    };

    const plotImportantCodes = (importantCodes) => {
      if (!importantCodes || importantCodes.length === 0) return;
      ll.charts += 1;

      const markerTemplate = {
        lineWidth: 1,
        lineColor: 'black',
        radius: 10,
        states: {
          hover: {
            lineColor: 'red',
            radius: 12,
          },
        },
      };
      const markers = {
        default: $.extend({ symbol: 'triangle' }, markerTemplate),
        'Face to face': $.extend({ symbol: 'square' }, markerTemplate),
        Telephone: $.extend({ symbol: 'bar' }, markerTemplate),
        'Hospital admission': $.extend({ symbol: 'triangle' }, markerTemplate),
      };

      let latestImportantCode;
      const eventSeries = importantCodes.map((v) => {
        if (!latestImportantCode) latestImportantCode = v.time;
        else latestImportantCode = Math.max(latestImportantCode, v.time);
        return {
          x: v.time,
          y: 0,
          name: v.name,
          marker: markers.Telephone,
        };
      });

      if (latestImportantCode) { minMaxDate = Math.min(latestImportantCode, minMaxDate); }

      // create the chart
      $('<div class="sync-chart h-chart h-important-codes-chart">')
        .appendTo(elementId)
        .highcharts({
          chart: {
            renderTo: element,
            marginLeft: 120, // Keep all charts left aligned
            marginTop: 0,
            marginBottom: 0,
            type: 'scatter',
            backgroundColor: '#F9F3F9',
            borderWidth: 0,
            borderColor: '#ddd',
          },

          title: '',

          xAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: { snap: false },
            events: { setExtremes: syncExtremes },
            labels: { enabled: false },

            // things that are normally xAxis defaults
            endOnTick: false,
            gridLineWidth: 0,
            lineWidth: 0,
            maxPadding: 0.01,
            minPadding: 0.01,
            startOnTick: false,
            tickWidth: 0,
            title: { text: '' },
            tickPixelInterval: 100,
          },

          yAxis: {
            labels: { enabled: false },
            min: -0.1,
            max: 0.1,
            startOnTick: false,
            endOnTick: false,
            title: {
              text: 'Important events',
              margin: 60,
              rotation: 0,
            },
            tickWidth: 0,

            // things that are normally yAxis defaults
            gridLineWidth: 0,
            lineWidth: 1,
          },
          credits: { enabled: false },

          legend: { enabled: false },

          plotOptions: {
            series: {
              states: {
                hover: {
                  enabled: true,
                  halo: { size: 0 },
                },
              },
              events: {
                mouseOut: () => {
                  let chart;
                  for (let i = 1; i < ll.chartArray.length - 2; i += 1) {
                    chart = ll.chartArray[i];
                    chart.tooltip.hide();
                  }
                },
              },
            },
          },

          tooltip: {
            formatter() {
              const time = this.x;
              return importantCodes
                .filter(val => val.time === time)
                .map(val => (`<b>${val.name}</b><br/>${Highcharts.dateFormat('%d/%m/%Y', time)}`))
                .join('<br/>');
            },
            followPointer: true,
          },

          series: [{ data: eventSeries }],
        });
    };

    const plotMeasurements = (measurements) => {
      if (!measurements || measurements.length === 0) return;
      // Make measurements alphabetical so they are always in the same order
      measurements.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      $.each(measurements, (i, dataset) => {
        if (!dataset.data || dataset.data.length === 0) return;
        ll.charts += 1;
        let maxMeasurementDate = 0;
        const dataDates = {};
        dataset.data.forEach((v) => {
          if (!dataDates[v[0]]) {
            dataDates[v[0]] = v;
          } else if (dataDates[v[0]][1] === 'salfordt') {
            dataDates[v[0]] = v;
          }
          maxMeasurementDate = Math.max(maxMeasurementDate, v[0]);
        });
        const dataFromDataDates = Object.keys(dataDates).map(v => dataDates[v]);
        minMaxDate = Math.min(minMaxDate, maxMeasurementDate);
        const chartOptions = {
          chart: {
            marginLeft: 120, // Keep all charts left aligned
            spacingTop: 0,
            spacingBottom: 8,
            backgroundColor: 'rgba(249, 249, 243, 1)',
            borderWidth: 0,
            borderColor: '#ddd',
          },
          title: {
            text: '',
            align: 'left',
            margin: 0,
            x: 30,
          },
          credits: { enabled: false },
          legend: { enabled: false },
          xAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: { snap: false },
            events: { setExtremes: syncExtremes },
            labels: { enabled: false },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0,
          },
          yAxis: {
            title: {
              text: `${dataset.name}<br>${dataset.unit.replace(/\^([0-9]+)/, '<sup>$1</sup>')}`,
              margin: 60,
              rotation: 0,
            },
            startOnTick: false,
            endOnTick: false,
            labels: { style: { textOverflow: 'none' } },
            tickPixelInterval: 25,
            maxPadding: 0.1,
            minPadding: 0.1,
          },
          tooltip: {
            positioner: (labelWidth, labelHeight, point) => ({
              x: Math.max(50, point.plotX - labelWidth), // left aligned
              y: -1, // align to title
            }),
            useHTML: true,
            pointFormat: `
              <b>${dataset.name}:</b> {point.y} ${dataset.unit.replace(/\^([0-9]+)/, '<sup>$1</sup>')}
              <br><small>Recorded at: {point.loc}</small>
            `,
            valueDecimals: dataset.valueDecimals,
          },
          plotOptions: {
            series: {
              events: {
                mouseOut: () => {
                  let chart;
                  for (let j = 1; j < ll.chartArray.length - 2; j += 1) {
                    chart = ll.chartArray[j];
                    chart.tooltip.hide();
                  }
                },
              },
            },
          },
          series: [
            {
              data: dataFromDataDates.map((v) => {
                const dataObj = { x: v[0], loc: v[1] };
                if (v[1] === 'salfordt') {
                  dataObj.loc = 'Salford Royal';
                  dataObj.color = '#E9573F';
                }
                if (v.length === 3) {
                  [, , dataObj.y] = v;
                } else {
                  [, , dataObj.low, dataObj.high] = v;
                }
                return dataObj;
              }),
              name: dataset.name,
              type: dataset.type,
              color: colour.next(),
              fillOpacity: 0.3,
              marker: { enabled: true },
            },
          ],
        };

        if (dataset.name === 'BP') {
          chartOptions.tooltip.pointFormat =
            '<b>BP:</b> {point.low}/{point.high} mmHg<br><small>Recorded at: {point.loc}</small>';
          chartOptions.series[0].stemWidth = 3;
          chartOptions.series[0].whiskerLength = 10;
          chartOptions.plotOptions.errorbar = {
            states: {
              hover: {
                halo: {
                  size: 9,
                  attributes: {
                    'stroke-width': 1,
                    stroke: Highcharts.getOptions().colors[1],
                  },
                },
                brightness: 0.5,
                color: 'green',
                borderColor: 'blue',
              },
            },
          };
        }

        if (i === measurements.length - 1) {
          chartOptions.xAxis.labels = { enabled: true };
        }
        $(`<div class="sync-chart h-chart${
          i === measurements.length - 1 ? ' h-last-measurement-chart' : ''
        }">`)
          .appendTo(elementId)
          .highcharts(chartOptions);
      });
    };

    const plotNavigator = () => {
      ll.charts += 1;
      const chart = $('<div class="h-chart h-navigator-chart">')
        .appendTo(elementId)
        .highcharts({
          chart: {
            renderTo: element,
            marginLeft: 120, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            ignoreHiddenSeries: false,
            borderWidth: 0,
            borderColor: '#ddd',
          },

          title: { text: '' },

          xAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: false,
            events: { setExtremes: syncExtremes },
            labels: { enabled: false },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0,
          },

          yAxis: {
            min: 0,
            max: 1,
            tickInterval: 1,
            startOnTick: false,
            endOnTick: false,
            title: {
              text: 'Zoom',
              margin: 60,
              rotation: 0,
            },
            minPadding: 0.2,
            maxPadding: 0.2,
            labels: { enabled: false },
          },

          legend: { enabled: false },

          navigator: {
            enabled: true,
            xAxis: { labels: { enabled: false } },
          },

          plotOptions: {
            line: {
              lineWidth: 0,
              marker: { enabled: false },
              dataLabels: { enabled: false },
            },
          },

          series: [
            {
              name: 'HTN',
              data: [
                {
                  x: 1373587200000,
                  y: 0,
                  from: 1373587200000,
                  to: 1459814400000,
                },
              ],
            },
          ],
        });
      chart.highcharts().series[0].hide();
    };

    const plotMedications = (medications) => {
      // Don't do this we need this to render even if no medications
      // if(!medications || medications.length === 0 ) return;
      ll.charts += 1;
      const series = [];
      let latestIntervalEndDate;
      $.each(medications.reverse(), (i, task) => {
        const item = {
          name: task.name,
          data: [],
          color: colour.next(),
        };

        $.each(
          task.intervals.filter(v => v.label !== '0mg'),
          (j, interval) => {
            if (!latestIntervalEndDate) latestIntervalEndDate = interval.to;
            else {
              latestIntervalEndDate = Math.max(
                latestIntervalEndDate,
                interval.to
              );
            }
            item.data.push([i + 0, interval.from, interval.to]);
          }
        );

        series.push(item);
      });
      if (latestIntervalEndDate) {
        minMaxDate = Math.min(latestIntervalEndDate, minMaxDate);
      }
      let noData = false;
      if (series.length === 0) {
        series.push({
          type: 'line',
          name: 'Random data',
          data: [],
        });
        noData = true;
      }

      const barWidth = 16;
      const barSpace = 1;
      return $(`<div class="sync-chart h-chart h-medication-chart" style="${
        noData ? 'display:none;' : ''
      }height:${
        Math.max(50, 12 + (series.length * (barWidth + barSpace)))
      }px">`)
        .appendTo(elementId)
        .highcharts({
          chart: {
            marginLeft: 120, // Keep all charts left aligned
            spacingBottom: 0,
            marginTop: 0,
            type: 'columnrange',
            inverted: true,
            backgroundColor: '#F3F9F9',
            borderWidth: 0,
            borderColor: '#ddd',
          },
          lang: { noData: 'No relevant medications' },
          noData: {
            style: {
              fontWeight: 'bold',
              fontSize: '15px',
              color: '#303030',
            },
          },

          title: '',

          yAxis: {
            type: 'datetime',
            min: Date.UTC(2005, 6, 12),
            max: new Date().getTime(),
            crosshair: { snap: false },
            events: { setExtremes: syncExtremes },

            labels: {
              enabled: true,
              y: 12,
            },

            // things that are normally xAxis defaults
            endOnTick: false,
            gridLineWidth: 0,
            lineWidth: 0,
            maxPadding: 0.01,
            minPadding: 0.01,
            startOnTick: false,
            tickWidth: 0,
            title: {
              text: '',
              margin: 0,
            },
            tickPixelInterval: 100,
          },

          xAxis: {
            min: -0.6,
            max: medications.length - 0.5,
            labels: { enabled: false },
            startOnTick: false,
            endOnTick: false,
            title: {
              text: 'Medications',
              margin: 60,
              rotation: 0,
            },
            tickWidth: 0,
            // minPadding: 0,
            // maxPadding: 0.2,

            // things that are normally yAxis defaults
            // gridLineWidth: 0,
            lineWidth: 1,
          },
          credits: { enabled: false },

          legend: { enabled: false },

          tooltip: {
            formatter() {
              const yCoord = this.y;

              const labelTmp = medications[Math.floor(this.x)].intervals
                .filter(v => yCoord >= v.from && yCoord <= v.to);
              const label =
                labelTmp.length > 0 ? labelTmp[0].label : 'No label C';
              return (
                `<b>${
                  medications[Math.floor(this.x)].name
                }${label ? ` ${label}` : ''
                }</b><br/>${
                  Highcharts.dateFormat('%d/%m/%Y', this.point.options.low)
                } - ${
                  Highcharts.dateFormat('%d/%m/%Y', this.point.options.high)}`
              );
            },
            followPointer: true,
          },

          plotOptions: {
            columnrange: {
              grouping: false,
              // pointPadding: barSpace,// Defaults to 0.1
              groupPadding: 0.01, // Defaults to 0.2
              pointWidth: barWidth,
              pointPlacement: 'between',
              /* groupPadding: 0.3, */
              dataLabels: {
                allowOverlap: false,
                enabled: true,
                formatter() {
                  const yCoord = this.y;
                  let idx = -1;
                  const labelTmp = medications[
                    Math.floor(this.x)
                  ].intervals.filter((v, i) => {
                    if (yCoord >= v.from && yCoord <= v.to) {
                      idx = i;
                      return true;
                    }
                    return false;
                  });
                  const label =
                    labelTmp.length > 0 ? labelTmp[0].label : 'No label D';
                  return this.y === this.point.low &&
                    (medications[Math.floor(this.x)].intervals.length - 1 ===
                      idx ||
                      (this.series.chart.yAxis[0].min <= yCoord &&
                        this.series.chart.yAxis[0].max >= yCoord) ||
                      (this.series.chart.yAxis[0].min >= this.point.low &&
                        this.series.chart.yAxis[0].max <= this.point.high))
                    ? medications[Math.floor(this.x)].name +
                        (label ? `: ${label}` : '')
                    : '';
                },
              },
            },
          },

          series,
        });
    };

    minMaxDate.setMonth(minMaxDate.getMonth() - 1); // gives 1 month padding

    ll.charts = 0;

    plotConditions(data.conditions);
    plotImportantCodes(data.events);
    plotContacts(data.contacts);
    plotMeasurements(data.measurements);
    const c = plotMedications(data.medications);
    plotNavigator();
    const today = new Date().getTime();
    c.highcharts().axes[1].setExtremes(minMaxDate, today, undefined, false, { trigger: 'syncExtremes' });

    ll.chartArray = Highcharts.charts.slice(
      Highcharts.charts.length - ll.charts,
      Highcharts.charts.length
    );

    const s = syncExtremes.bind(c.highcharts().series[0]);
    s({
      trigger: 'navigator',
      min: minMaxDate,
      max: today,
    });
  },
};

module.exports = ll;
