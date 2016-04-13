var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js'),
  patientList = require('../panels/patientList.js');

var indicator = {

  create: function(panel, pathwayId, pathwayStage, standard, tab, loadContentFn) {
    data.getIndicatorData([pathwayId, pathwayStage, standard].join("."), function(indicators) {

      var tempMust = $('#indicator-overview-panel').html();
      panel.html(Mustache.render(tempMust, {
        "indicators": indicators,
        "benchmark": tab === "benchmark",
        "url": window.location.hash.replace(/\?tab=trend.*/g, '').replace(/\?tab=benchmark.*/g, '')
      }));

      if (tab === "benchmark") {
        chart.drawBenchmarkChart("trend-chart-pane", {
          json: indicators.benchmark,
          keys: {
            x: "practice",
            value: ["value"]
          },
          type: "bar",
          names: {
            "value": "NAME TO DO"
          },
          colors: {
            "value": "red"
          }
        });
      } else {
        var columns = indicators.opportunities.map(function(opp) {
          var c = opp.values[0].slice();
          c.splice(0, 1, opp.name);
          return c;
        });
        columns.splice(0, 0, indicators.opportunities[0].values[1]);
        chart.drawPerformanceTrendChart("trend-chart-pane", {
          columns: columns,
          x: "date"
        });
      }

      var pathwayId = "htn";
      var pathwayStage = "monitoring";
      var standard = Object.keys(data[pathwayId][pathwayStage].standards)[0];

      patientList.wireUp(pathwayId, pathwayStage, standard, function(patientId) {
        history.pushState(null, null, '#patient/' + [patientId, pathwayId, pathwayStage, standard].join("/"));
        loadContentFn('#patient/' + [patientId, pathwayId, pathwayStage, standard].join("/"));
      });
      patientList.populate(pathwayId, pathwayStage, standard, null);
      //base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
      base.updateTitle([{
        title: "Overview",
        url: "#overview"
      }, {
        title: data[pathwayId][pathwayStage].text.page.text,
        tooltip: data[pathwayId][pathwayStage].text.page.tooltip
      }]);

      indicator.wireUp(loadContentFn);

    });
  },

  populate: function() {

  },

  wireUp: function(panel, loadContentFn) {

  }

};

module.exports = indicator;
