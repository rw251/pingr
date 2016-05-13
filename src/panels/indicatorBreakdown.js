var data = require('../data.js'),
  chart = require('../chart.js');

var bd = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard, selectSeriesFn) {

    var indicators = data.getIndicatorDataSync([pathwayId, pathwayStage, standard].join("."));

    var dataObj = indicators.opportunities.map(function(opp) {
      return [opp.name, opp.patients.length];
    });

    var elem = $("<div id='breakdown-chart'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawAnalytics("breakdown-chart", dataObj, selectSeriesFn);

    bd.wireUp();

  }

};

module.exports = bd;
