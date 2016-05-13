var data = require('../data.js'),
  chart = require('../chart.js'),
  Mustache = require('mustache');

var hl = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var indicators = data.getIndicatorDataSync([pathwayId, pathwayStage, standard].join("."));

    var tempMust = $('#indicator-headline-panel').html();
    var html = Mustache.render(tempMust, indicators);

    if(isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = hl;
