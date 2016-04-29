var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js'),
  sparkline = require('jquery-sparkline'),
  Mustache = require('mustache');

var indicatorList = {

  show: function(panel, isAppend, loadContentFn) {
    data.getAllIndicatorData(function(indicators) {

      var tempMust = $('#overview-panel-table').html();
      var html = Mustache.render(tempMust, {
        "indicators": indicators
      });
      if (isAppend) {
        panel.append(html);
      } else {
        panel.html(html);
      }

      $('.inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          return indicators[$('.inlinesparkline').index(sparkline.el)].dates[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      indicatorList.wireUp(panel, loadContentFn);

    });
  },

  populate: function() {

  },

  wireUp: function(panel, loadContentFn) {
    panel.off('click', 'tr.standard-row');
    panel.on('click', 'tr.standard-row', function(e) {
      var url = $(this).data("id").replace(/\./g, "/");
      history.pushState(null, null, '#indicators/' + url);
      loadContentFn('#indicators/' + url);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

};

module.exports = indicatorList;
