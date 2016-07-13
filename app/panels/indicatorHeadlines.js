var data = require('../data.js'),
  chart = require('../chart.js');/*,
  Mustache = require('mustache');
*/
var hl = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var indicators = data.getIndicatorDataSync("P87024", [pathwayId, pathwayStage, standard].join("."));

    var tmpl = require('templates/indicator-headline');
    var html = tmpl(indicators);

    if(isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = hl;
