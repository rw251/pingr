var data = require('../data.js'),
  chart = require('../chart.js');

var bd = {

  wireUp: function() {

  },

  show: function(panel, isAppend, subPanels, isDownText, isUpText) {

    var sectionElement = $('<div class="section"></div>');

    if (isAppend) panel.append(sectionElement);
    else panel.html(sectionElement);

    subPanels.forEach(function(v) {
      var args = v.args;
      args.unshift(true);
      args.unshift(sectionElement);
      v.show.apply(null, args);
    });

    if (isUpText) sectionElement.prepend($('<div class="fp-controlArrow fp-up"><div>' + isUpText + '</div></div>'));
    if (isDownText) sectionElement.append($('<div class="fp-controlArrow fp-down"><div>' + isDownText + '</div></div>'));

  }

};

module.exports = bd;
