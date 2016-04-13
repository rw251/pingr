var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js');

var indicatorList = {

  create: function(panel, loadContentFn) {
    data.getAllIndicatorData(function(indicators) {

      var tempMust = $('#overview-panel-table').html();
      panel.html(Mustache.render(tempMust, {
        "indicators": indicators
      }));

      $('.inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          return indicators[$('.inlinesparkline').index(sparkline.el)].dates[fields.x] + ": " + fields.y + "%";
        }
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
      history.pushState(null, null, '#overview/' + url);
      loadContentFn('#overview/' + url);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

};

module.exports = indicatorList;
