const data = require('../data.js');
const chart = require('../chart.js');

const iTrend = {
  show(panel, isAppend, pathwayId, pathwayStage, standard) {
    const trend = data.getTrendData('P87024', pathwayId, pathwayStage, standard);

    const elem = $("<div id='trend-chart' class='fit-to-scrolling-section-height'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawPerformanceTrendChartHC('trend-chart', trend);
  },

  wireUp() {},
};

module.exports = iTrend;
