var base = require('../base.js'),
  log = require('../log.js'),
  data = require('../data.js'),
  state = require('../state'),
  sparkline = require('jquery-sparkline');

var tableProcessIndicators;
var tableOutcomeIndicators;
var format = function (description) {
  // `d` is the original data object for the row
  return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
      '<tr>'+
          '<td>' + description + '</td>'+
      '</tr>'+
  '</table>';
}

var indicatorList = {

  show: function(panel, isAppend, loadContentFn) {
    data.getAllIndicatorData(null, false, function(indicators) {
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
        "processIndicators": processIndicators,
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

      $('#processIndicators .inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          var dts = processIndicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return dts[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      $('#outcomeIndicators .inlinesparkline').sparkline('html', {
        tooltipFormatter: function(sparkline, options, fields) {
          var dts = outcomeIndicators[$('.inlinesparkline').index(sparkline.el)].dates;
          return dts[fields.x] + ": " + fields.y + "%";
        },
        width: "100px"
      });

      tableOutcomeIndicators = $('#overview-table-outcomes').DataTable({
        searching: true, //we want a search box
        paging: false, // always want all indicators
        stateSave: true, // let's remember which page/sorting etc
        dom: '<"row"<"pull-right"f><"pull-right"B>>rt<"clear">',
        //dom: '<"row"<"col-sm-7 toolbar"i><"col-sm-5"B>>rt<"row"<"col-sm-5"l><"col-sm-7"p>><"clear">',
        /*columnDefs: list["header-items"].map(function (v, i) {
          var thing = { type: v.type, orderSequence: v.orderSequence, targets: i, name:"shown" };
          if(v.hidden) {
            thing.visible=false;
            thing.name="not";
          } else if(i<numColumns-2){
            //everything sorted by exclusion first except exclusion column
            thing.orderData = [[numColumns-1,"asc"], i];
          }
          return thing;
        }),*/
        scrollY: '50vh',
        scrollCollapse: true,
        buttons: [ 'colvis' ],
          // {
          //   extend: 'colvis',
          //   columns: 'shown:name'
          // },
          // {
          //   text: 'Pdf',
          //   className: 'download-button',
          //   action: function (e, dt, node, config) {
          //     //writePdf();
          //   }
          // }
        // ],
        // infoCallback: function (settings, start, end, max, total, pre) {
        //   return "showing " + start + " to " + end + " of " + total + " patients" + (list.numExcluded>0 ? " [including " + list.numExcluded + " exclusions]" : "");
        // }
      });

      tableProcessIndicators = $('#overview-table-process').DataTable({
        searching: true, //we want a search box
        paging: false, // always want all indicators
        stateSave: true, // let's remember which page/sorting etc
        dom: '<"row"<"pull-right"f><"pull-right"B>>rt<"clear">',
        //dom: 'Bfrtip',
        columnDefs: [
          { "width": "90px", "targets": 6 }
        ],
        order: [[ 1, "desc" ]],
        /*columnDefs: list["header-items"].map(function (v, i) {
          var thing = { type: v.type, orderSequence: v.orderSequence, targets: i, name:"shown" };
          if(v.hidden) {
            thing.visible=false;
            thing.name="not";
          } else if(i<numColumns-2){
            //everything sorted by exclusion first except exclusion column
            thing.orderData = [[numColumns-1,"asc"], i];
          }
          return thing;
        }),*/
        scrollY: '50vh',
        scrollCollapse: true,
        buttons: [ 'colvis' ],
          // {
          //   extend: 'colvis',
          //   columns: 'shown:name'
          // },
          // {
          //   text: 'Pdf',
          //   className: 'download-button',
          //   action: function (e, dt, node, config) {
          //     //writePdf();
          //   }
          // }
        // ],
        // infoCallback: function (settings, start, end, max, total, pre) {
        //   return "showing " + start + " to " + end + " of " + total + " patients" + (list.numExcluded>0 ? " [including " + list.numExcluded + " exclusions]" : "");
        // }
      });

      // $('#overview-table-process, #overview-table-outcomes').floatThead({
      //   position: 'absolute',
      //   scrollContainer: true,
      //   zIndex:50
      // });

      setTimeout(function () {
        tableProcessIndicators.columns.adjust().draw(false);
        tableOutcomeIndicators.columns.adjust().draw(false);

        base.setupClipboard('.btn-copy', true);
        base.wireUpTooltips();
      }, 100);

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

    panel.off('click', '#overview-table-process .show-more');
    panel.on('click', '#overview-table-process .show-more', function(e) {
      var id = $(this).data("id");
      var tr = $(this).closest("tr");
      var row = tableProcessIndicators.row( tr );
      if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      }
      else {
        // Open this row
        row.child( format(tr.data('description')) ).show();
        tr.addClass('shown');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });


    panel.off('click', '#overview-table-outcome .show-more');
    panel.on('click', '#overview-table-outcome .show-more', function(e) {
      var id = $(this).data("id");
      var tr = $(this).closest("tr");
      var row = tableOutcomeIndicators.row( tr );
      if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      }
      else {
        // Open this row
        row.child( format(tr.data('description')) ).show();
        tr.addClass('shown');
      }
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $.sparkline_display_visible(); //ensure sparklines on hidden tabs display
      // setTimeout(function(){
      tableProcessIndicators.columns.adjust().draw("page"); //ensure column headers are correct
      // },200);
      tableOutcomeIndicators.columns.adjust().draw(false); //ensure column headers are correct
      //e.target // newly activated tab
      //e.relatedTarget // previous active tab
    });

    $('#overview-table-outcomes').on('draw.dt', function () {
      $.sparkline_display_visible(); //ensure sparklines on hidden tabs display
      //tableOutcomeIndicators.columns.adjust().draw(false); //ensure column headers are correct
      console.log('Redraw occurred at: ' + new Date().getTime());
    });
    
    $('#overview-table-process').on('draw.dt', function () {
      $.sparkline_display_visible(); //ensure sparklines on hidden tabs display
      //tableProcessIndicators.columns.adjust().draw(false); //ensure column headers are correct
      console.log('Redraw occurred at: ' + new Date().getTime());
    });

    $('#overview-table-process, #overview-table-outcomes').floatThead('reflow')
  }

};

module.exports = indicatorList;
