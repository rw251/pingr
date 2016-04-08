var base = require('../base.js'),
  data = require('../data.js');

var wireUp = function(loadContentFn){
  farLeftPanel.off('click', 'tr.standard-row');
  farLeftPanel.on('click', 'tr.standard-row', function(e) {
    var url = $(this).data("id").replace(/\./g,"/");
    history.pushState(null, null, '#overview/' + url);
    loadContentFn('#overview/' + url);
    // do not give a default action
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
};


var overview = {

  create: function(loadContentFn) {

    data.getAllIndicatorData(function(indicators) {

      var tempMust = $('#overview-panel-table').html();
      farLeftPanel.html(Mustache.render(tempMust, {"indicators":indicators}));

      $('.inlinesparkline').sparkline('html', {tooltipFormatter: function(sparkline, options, fields){
        return indicators[$('.inlinesparkline').index(sparkline.el)].dates[fields.x] + ": " + fields.y + "%";
      }});

      wireUp(loadContentFn);

    });

  }

};

module.exports = overview;
