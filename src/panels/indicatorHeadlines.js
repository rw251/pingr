var data = require('../data.js'),
  chart = require('../chart.js');/*,
  Mustache = require('mustache');
*/
var hl = {

  wireUp: function() {

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard) {

    var indicators = data.getIndicatorDataSync([pathwayId, pathwayStage, standard].join("."));

    var tmpl = require('src/templates/indicator-headline.hbs');
    var html = tmpl(indicators);

    if(isAppend) panel.append(html);
    else panel.html(html);

  }

};

module.exports = hl;
