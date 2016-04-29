var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js'),
  patientList = require('./patientList.js');

var ID = "INDICATOR_TREND";

var iTrend = {

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var indicators = data.getAllIndicatorDataSync();

    var elem = $("<div id='trend-chart' class='fit-to-scrolling-section-height'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawPerformanceTrendChartHC("trend-chart", indicators.filter(function(v){
      return v.id===[pathwayId, pathwayStage, standard].join(".");
    })[0]);

  },

  wireUp: function() {

  }

};

module.exports = iTrend;
