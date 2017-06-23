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
