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
