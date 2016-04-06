var base = require('../base.js'),
  confirm = require('./confirm.js'),
  data = require('../data.js'),
  log = require('../log.js'),
  lookup = require('../lookup.js');

var trnd = {

  create: function(pathwayId, pathwayStage, standard, patientId) {
    var agree = log.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "trend");
    return base.createPanel(valueTrendPanel, {
      "pathway": lookup.monitored[pathwayId],
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "pathwayStage": pathwayStage
    });
  },

  wireUp: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#trend-agree-disagree'), $('#trend-panel'), pathwayId, pathwayStage, standard, patientId, "trend", "trend data");

    $('#trend-panel').on('click', '.table-chart-toggle', function() {
      if ($(this).text() === "Table") {
        $(this).text("Chart");
        $('#chart-demo-trend').hide();
        $('#table-demo-trend').show();

        var c = $('#table-demo-trend .tableScroll').getNiceScroll();
        if (c && c.length > 0) {
          c.resize();
        } else {
          $('#table-demo-trend .tableScroll').niceScroll({
            cursoropacitymin: 0.3,
            cursorwidth: "7px",
            horizrailenabled: false
          });
        }
      } else {
        $(this).text("Table");
        $('#chart-demo-trend').show();
        $('#table-demo-trend').hide();
      }
    });
  }

};

module.exports = trnd;
