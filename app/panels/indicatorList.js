var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js'),
  sparkline = require('jquery-sparkline'),
  Mustache = require('mustache');

var indicatorList = {

  show: function(panel, isAppend, loadContentFn) {
    data.getAllIndicatorData("P87024", function(indicators) {
      indicators.sort(function(a,b){
        return a.performance.percentage - b.performance.percentage;
      });
      var tempMust = $('#overview-panel-table').html();
      var tmpl = require('templates/overview-table');
      var html = tmpl({
        "indicators": indicators
      });
      if (isAppend) {
        panel.append(html);
      } else {
        //*b* maintain state
        base.savePanelState();
        panel.html(html);
      }

      $('.inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          var dts = indicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return dts[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      indicatorList.wireUp(panel, loadContentFn);

    });
  },

  populate: function() {

  },

  wireUp: function(panel, loadContentFn) {
    panel.off('click', 'tr.show-more-row a');
    panel.on('click', 'tr.show-more-row a', function(e){
      log.event("nice-link-clicked", window.location.hash, [{key:"link",value:e.currentTarget.href}]);
      e.stopPropagation();
    });
    panel.off('click', 'tr.standard-row,tr.show-more-row');
    panel.on('click', 'tr.standard-row,tr.show-more-row', function(e) {
      var url = $(this).data("id").replace(/\./g, "/");
      history.pushState(null, null, '#indicators/' + url);
      loadContentFn('#indicators/' + url);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    panel.off('mouseenter', '.show-more-row,.standard-row');
    panel.off('mouseleave', '.show-more-row,.standard-row');
    panel.on('mouseenter', '.show-more-row,.standard-row', function(e){
      var id = $(this).data("id");
      $('.show-more-row[data-id="' + id + '"],.standard-row[data-id="' + id + '"]').addClass('hover');
    });
    panel.on('mouseleave', '.show-more-row,.standard-row', function(e){
      var id = $(this).data("id");
      $('.show-more-row[data-id="' + id + '"],.standard-row[data-id="' + id + '"]').removeClass('hover');
    });

    panel.off('click', '.show-more');
    panel.on('click', '.show-more', function(e) {
      var id = $(this).data("id");
      var elem = $('.show-more-row[data-id="' + id + '"]');
      if(elem.is(':visible')){
        $('.show-more[data-id="' + id + '"]:first').show();
        elem.hide();
      } else {
        $(this).hide();
        elem.show('fast');
        log.event("show-more", window.location.hash, [{key:"indicator",value:id}]);
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

};

module.exports = indicatorList;
