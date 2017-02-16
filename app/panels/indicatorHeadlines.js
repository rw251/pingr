var base = require('../base.js'),
  data = require('../data.js'),
  chart = require('../chart.js');
  
var hl = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    //var indicators = data.getIndicatorDataSync("P87024", [pathwayId, pathwayStage, standard].join("."));
    var indicators = data.getIndicatorDataSync(null, [pathwayId, pathwayStage, standard].join("."));

    var tmpl = require('templates/indicator-headline');
    var html = tmpl(indicators);

    if(isAppend) panel.append(html);
    //*b* maintain state
    else {
      base.savePanelState();
      panel.html(html);
    }
  }
};

module.exports = hl;
