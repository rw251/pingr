const Highcharts = require('highcharts/highstock');
const data = require('./data');
const state = require('./state');
// const lookup = require('./lookup');
// const log = require('./log');

// console.log(`chart.js: data.lastloader= ${data.lastloader}`);
data.lastloader = 'chart.js';

const cht = {
  drawBenchmarkChartHC(element, pathwayId, pathwayStage, standard) {
    // pull all data from data.js
    let tempData;

    // fully async load
    // pull out the necessary data and structure for display
    data.getPracticePerformanceData(
      state.selectedPractice._id,
      pathwayId,
      pathwayStage,
      standard,
      (dataObj) => {
        tempData = dataObj;
        // sort these into smallest to largest (last = largest always)
        tempData.sort((a, b) => a.x - b.x);

        const isCCG = state.selectedPractice._id === 'ALL';

        const title = isCCG
          ? 'An illustration of the current performance of practices in Salford'
          : 'An illustration of your current performance amongst other practices in Salford';
        // find max in order to set the ceiling of the chart
        let maxHeight = Math.round(tempData[tempData.length - 1].x);
        const maxAdd = Math.round(maxHeight * 0.1);
        maxHeight += maxAdd;
        if (maxHeight > 100) {
          maxHeight = 100;
        }

        // find min in order to set the floor of the chart - to be implemented if desired
        const minHeight = 0;
        let local = true;

        // const bChart =
        $(`#${element}`).highcharts(
          {
            chart: {
              type: 'column',
              events: {
                load() {
                  const thisChart = this;
                  if (!isCCG) {
                    thisChart.renderer
                      .button(
                        'Toggle neighbourhood - ccg',
                        thisChart.plotWidth - 160,
                        0,
                        () => {
                          local = !local;
                          thisChart.xAxis[0].categories = tempData
                            .filter((v) => {
                              if (local) return v.local;
                              return true;
                            })
                            .map(v => v.pFull);
                          thisChart.series[0].setData(tempData
                            .filter((v) => {
                              if (local) {
                                return v.local;
                              }
                              return true;
                            })
                            .map((v) => {
                              // this is for the (?local/global) chart...
                              if (v.p === 'You') {
                                // apple
                                return { y: v.x, color: '#0EDE61' };
                              } else if (v.local) {
                                // dark
                                return { y: v.x, color: '#444444' };
                              }
                              // blue
                              return { y: v.x, color: '#5187E8' };
                            }));
                        }
                      )
                      .add();
                  }
                },
              },
            },
            title: { text: title },
            xAxis: {
              categories: tempData
                .filter(v => isCCG || v.local === local)
                .map(v => v.pFull),
              crosshair: true,
            },
            yAxis: {
              // make the following dynamic
              min: minHeight,
              max: maxHeight,
              title: { text: '% patients meeting target' },
            },
            tooltip: {
              headerFormat:
                '<span style="font-size:10px">Practice: <b>{point.key}</b></span><table>',
              pointFormat:
                '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
              footerFormat: '</table>',
              shared: true,
              useHTML: true,
            },
            plotOptions: {
              column: {
                pointPadding: 0.2,
                borderWidth: 0,
              },
            },
            legend: { enabled: false },
            series: [
              {
                name: 'Performance',
                data: tempData
                  .filter(v => isCCG || v.local === local)
                  .map((v) => {
                    if (v.p === 'You') {
                      // you colour - apple
                      return { y: v.x, color: '#0EDE61' };
                    }
                    // standrd colour - dark
                    return { y: v.x, color: '#444444' };
                  }),
              },
            ],
          },
          (chart) => {
            // on complete
            // force chart size based on container parameters
            chart.setSize(
              $('.highcharts-container').width(),
              $('#benchmark-chart').height()
            );
            // set text labels to mid of axies
            // const textX = chart.plotLeft + (chart.plotWidth * 0.5);
            // const textY = chart.plotTop + (chart.plotHeight * 0.5);

            // LEGACY this applied the 'coming soon' text
            /* var span = '<span id="pieChartInfoText" style="position:absolute;
             text-align:center;-ms-transform: rotate(335deg);-webkit-transform:
             rotate(335deg);transform: rotate(335deg);">';
          span += '<span style="font-size: 64px">Coming Soon!</span>';
          span += '</span>'; */

            /* $("#benchmark-chart").append(span);
          span = $('#pieChartInfoText');
          span.css('left', textX + (span.width() * -0.5));
          span.css('top', textY + (span.height() * -0.5)); */
          }
        );
      }
    );
  },

  drawPerformanceTrendChartHC(element, chartData) {
    // / data is
    // {
    //  "values":
    //    ["x", "2015-08-24", "2015-08-23",...
    //    ["numerator", 35, 37, 33, 32, 31,...
    //    ["denominator", 135, 133, 133, 13,...
    //    ["target", 0.3, 0.3, 0...
    // }

    const target = 75;
    let maxValue = target;
    let maxXvalue = 0;
    let minXvalue = 999999999;

    const series = [
      { type: 'line', name: 'Trend', data: [] },
      {
        type: 'line',
        name: 'Prediction',
        data: [],
        dashStyle: 'dot',
      },
    ];

    const today = new Date();
    const lastApril = new Date();
    const aprilBeforeThat = new Date();
    const nextApril = new Date();
    if (today.getMonth() < 3) {
      // after april
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

    let n = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    // let sumYY = 0;
    let compDate;

    if (
      chartData.values[0].filter(v => new Date(v).getTime() > lastApril.getTime()).length > 2
    ) {
      compDate = new Date(lastApril.getTime());
    } else {
      compDate = new Date(aprilBeforeThat.getTime());
    }

    chartData.values[0].forEach((v, i) => {
      if (i === 0) return;
      const time = new Date(v).getTime();
      const y = (+chartData.values[1][i] * 100) / +chartData.values[2][i];
      if (time >= compDate.getTime()) {
        n += 1;
        sumX += time;
        sumY += y;
        sumXY += time * y;
        sumXX += time * time;
        // sumYY += y * y;
      }
      series[0].data.push({
        x: time,
        y,
        label: `${chartData.values[1][i]}/${chartData.values[2][i]}`,
      });
      maxValue = Math.max(maxValue, y);
      maxXvalue = Math.max(maxXvalue, time);
      minXvalue = Math.min(minXvalue, time);
    });

    const intercept = ((sumY * sumXX) - (sumX * sumXY)) / ((n * sumXX) - (sumX * sumX));
    const gradient = ((n * sumXY) - (sumX * sumY)) / ((n * sumXX) - (sumX * sumX));

    const newCompDate = new Date(lastApril.getTime());
    series[1].data.push([maxXvalue, (maxXvalue * gradient) + intercept]);
    for (let i = 0; i < 13; i += 1) {
      const x = newCompDate.getTime();
      if (x < maxXvalue) {
        newCompDate.setMonth(newCompDate.getMonth() + 1);
      } else {
        series[1].data.push([x, (x * gradient) + intercept]);
        maxValue = Math.max(maxValue, (x * gradient) + intercept);
        newCompDate.setMonth(newCompDate.getMonth() + 1);
      }
    }

    // Add line of best fit for latest data since april to next april

    // Default to last april - april

    const c = $(`#${element}`).highcharts({
      title: { text: '' },
      xAxis: {
        min: minXvalue,
        max: nextApril.getTime(),
        type: 'datetime',
      },
      yAxis: {
        title: { text: 'Quality standard performance' },
        max: maxValue + 5,
        min: 0,
        plotLines: [
          {
            value: target,
            color: 'green',
            dashStyle: 'shortdash',
            width: 2,
            label: { text: `Target - ${target}%` },
          },
        ],
      },
      legend: { enabled: true },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:.2f}%</b> ({point.label})<br/>',
      },

      navigator: { enabled: true },

      series,
    });

    c
      .highcharts()
      .axes[0].setExtremes(
        lastApril.getTime(),
        nextApril.getTime(),
        undefined,
        false
      );
  },

  drawAnalytics(element, chartData, selectSeriesFn) {
    cht.cloneToolTip = null;
    cht.cloneToolTip2 = null;

    $(`#${element}`).highcharts({
      chart: {
        type: 'column',
        backgroundColor: '#F3F9F9',
        height: 200,
        events: {
          click() {
            selectSeriesFn();

            /* if (cht.cloneToolTip) {
              this.container.firstChild.removeChild(cht.cloneToolTip);
              cht.cloneToolTip = null;
            }
            if (cht.cloneToolTip2) {
              cht.cloneToolTip2.remove();
              cht.cloneToolTip2 = null;
            } */

            return false;
          },
        },
      },
      title: { text: 'Patients with improvement opportunities' },
      subtitle: {
        text:
          document.ontouchstart === undefined
            ? 'Click a column to filter the patient list'
            : 'Tap a column to filter the patient list',
      },
      xAxis: { categories: chartData.map(v => v[0]) },
      yAxis: {
        title: { text: 'Number of patients' },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray',
          },
        },
      },
      legend: { enabled: false },

      tooltip: {
        animation: false,

        formatter() {
          return this.point.desc
            .replace(/<a[^h]+href=["'].*?["'][^h]*>(.*?)<\/a>/, '$1')
            .match(/.{1,40}[^ ]* ?/g)
            .join('<br>');
        },

        style: { whiteSpace: 'normal' },

        useHTML: true,
      },

      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            color: 'black',
          },
        },

        series: {
          cursor: 'pointer',
          point: {
            events: {
              click() {
                // const numPoints = this.series.points.length;

                selectSeriesFn(this.category);

                /* if (cht.cloneToolTip) {
                  this.series.chart.container.firstChild.removeChild(cht.cloneToolTip);
                }
                if (cht.cloneToolTip2) {
                  cht.cloneToolTip2.remove();
                }
                cht.cloneToolTip = this.series.chart.tooltip.label.element.cloneNode(true);
                this.series.chart.container.firstChild.appendChild(cht.cloneToolTip);

                cht.cloneToolTip2 = $('.highcharts-tooltip').clone();
                $(this.series.chart.container).append(cht.cloneToolTip2); */

                return false;
              },
            },
          },
        },
      },

      series: [
        {
          data: chartData.map((v, i) => ({
            y: v[2],
            desc: v[1],
            color: Highcharts.getOptions().colors[i],
          })),
        },
      ],
    });
  },
};

module.exports = cht;
