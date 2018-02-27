const chart = require('../chart.js');
const $ = require('jquery');

const iTrend = {
  show(panel, isAppend, pathwayId, pathwayStage, standard) {
    const elem = $("<div id='benchmark-chart' class='fit-to-scrolling-section-height'></div>");

    if (isAppend) {
      panel.append(elem);
    } else {
      panel.html(elem);
    }

    chart.drawBenchmarkChartHC(
      'benchmark-chart',
      pathwayId,
      pathwayStage,
      standard
    );
  },

  wireUp() {},
};

module.exports = iTrend;
