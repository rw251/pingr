var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js');

var ID = "INDICATOR_TREND";

var iTrend = {

  create: function(panel, pathwayId, pathwayStage, standard, tab, selectSeriesFn) {

    var panelId = panel.attr("id");

    if (base.panels[panelId] &&
      base.panels[panelId].id === ID &&
      base.panels[panelId].pathwayId === pathwayId &&
      base.panels[panelId].pathwayStage === pathwayStage &&
      base.panels[panelId].standard === standard) {
      //Already showing the right thing
      return;
    }

    base.panels[panelId] = {
      id: ID,
      pathwayId: pathwayId,
      pathwayStage: pathwayStage,
      standard: standard
    };

    data.getIndicatorData([pathwayId, pathwayStage, standard].join("."), function(indicators) {

      var tempMust = $('#indicator-overview-panel').html();
      panel.html(Mustache.render(tempMust));

      chart.drawBenchmarkChartHC("benchmark-chart", null);

      var dataObj = indicators.opportunities.map(function(opp) {
        var c = opp.values[0].slice();
        c.splice(0, 1, opp.name);
        return c;
      });
      dataObj.splice(0, 0, indicators.opportunities[0].values[1]);
      chart.drawPerformanceTrendChartHC("trend-chart", dataObj, selectSeriesFn);

      iTrend.wireUp();

    });
  },

  wireUp: function(){
    $('a[data-toggle="tab"]').off('shown.bs.tab');
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $('.tab-pane.active div:first').highcharts().reflow();
    });
  }

};

module.exports = iTrend;
