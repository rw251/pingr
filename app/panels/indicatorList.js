var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js'),
  state = require('../state'),
  sparkline = require('jquery-sparkline');

var indicatorList = {

  show: function(panel, isAppend, loadContentFn) {
    data.getAllIndicatorData(null, function(indicators) {
      indicators.sort(function(a,b){
        if(a.performance.percentage == b.performance.percentage) return 0;
        if(isNaN(a.performance.percentage) || a.name.toLowerCase().indexOf("beta test")>-1) return 1;
        if(isNaN(b.performance.percentage) || b.name.toLowerCase().indexOf("beta test")>-1) return -1;
        return a.performance.percentage - b.performance.percentage;
      });
      var tempMust = $('#overview-panel-table').html();
      var tmpl = require('templates/overview-table');
      var processIndicators = indicators.filter(function(v){
        return v.type==="process";
      });
      var outcomeIndicators = indicators.filter(function(v){
        return v.type==="outcome";
      });
      var html = tmpl({
        "indicators": processIndicators, //REVIEW needs changing back to processIndicators
        "outcomeIndicators": outcomeIndicators,
        "selectedTab": state.getTab('overview'),
      });
      if (isAppend) {
        panel.append(html);
      } else {
        //*b* maintain state
        // - state maintainance causes a bug in this place
        //TODO build a version of state maintainance that doesnt reload if tab is pressed
        base.savePanelState();
        panel.html(html);
      }

      $('#overview-table .inlinesparkline').sparkline('html', { //REVIEW was '#processIndicators .inline..." in rw version
        tooltipFormatter: function(sparkline, options, fields) {
          var dts = processIndicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return dts[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      //REVIEW
      //this is ben's
      var $scrollTable = $('#overview-table');

      $scrollTable.floatThead({
        scrollContainer: function($scrollTable){
          return $scrollTable.closest('.wrapper-floatTHead');
        }
      });

      //this can be ignored?
      $('#outcomeIndicators .inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          var dts = outcomeIndicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return dts[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      // this is mine
      /*$('#overview-table-process, #overview-table-outcomes').floatThead({
        position: 'absolute',
        scrollContainer: true,
        zIndex:50
      });*/
      //REVIEW END

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
        $('.show-more-row').hide();
        $('.show-more').show();
        $(this).hide();
        elem.show('fast');
        log.event("show-more", window.location.hash, [{key:"indicator",value:id}]);
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $.sparkline_display_visible(); //ensure sparklines on hidden tabs display
      //e.target // newly activated tab
      //e.relatedTarget // previous active tab
    })

    $('#overview-table-process, #overview-table-outcomes').floatThead('reflow')
  }

};

module.exports = indicatorList;
