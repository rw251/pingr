"use strict";

var tooltiptext = function(value, ratio, id, index){
  return value + ' (' + (ratio*100).toFixed(2) + '%)';
};

var showOverviewCharts = function(){
  var chart1 = c3.generate({
    bindto: '#chart1',
    color: {
      pattern: ['#3366FF', '#3375ff', '#3357ff']
    },
    tooltip: {
  format: {
    value: tooltiptext
  }
},
    data: {
      // iris data from R
      columns: [
        ['Direct', 595],
        ['Indirect', 2072],
        ['Nil', 1413]
      ],
      type: 'pie'
    }
  });

  var chart2 = c3.generate({
    bindto: '#chart2',
    color: {
      pattern: ['#3366FF', '#FF6633']
    },
    tooltip: {
  format: {
    value: tooltiptext
  }
},
    data: {
      // iris data from R
      columns: [
        ['Unmeasured', 2072],
        ['Uncontrolled', 2868],
      ],
      type: 'pie',
      onclick: function(d, i) {
        if (d.id == "Unmeasured") {
          $('#chart1').show(800);
          $('#chart3').hide(800);
        } else {
          $('#chart3').show(800);
          $('#chart1').hide(800);
        }
      }
    }
  });

  var chart3 = c3.generate({
    bindto: '#chart3',
    color: {
      pattern: ['#FF6633', '#ff5733', '#ff7533']
    },
    tooltip: {
  format: {
    value: tooltiptext
  }
},
    data: {
      // iris data from R
      columns: [
        ['Recently Measured', 365],
        ['Recently Changed Rx', 1174],
        ['Suboptimal Rx', 1329]
      ],
      type: 'pie'
    }
  });

  $('#chart1').hide();
  $('#chart3').hide();
};

var show = function(page){
  $('.page').hide();
  $('#'+page).show();
  
  if(page=='page1'){
    showOverviewCharts();
  }
};

var wireUpPages = function(){
  
  // wire up site
  show('login');
  
  $('#navbar').on('click', 'a', function(e){
    $(".nav").find(".active").removeClass("active");
    $(this).parent().addClass("active");
    if(this.href.split('#')[1]=='about'){
      show('page2');
    } else if (this.href.split('#')[1]=='contact'){
      show('page3');
    } else {
      show('login');
    }
  });
  $('#login-button,#create-button,#forgot-button,#home-button').on('click', function(e){
    show('page1');
    $(".nav").find(".active").removeClass("active");
    $('#home-page').addClass("active");
    e.preventDefault();
  });
};

$(document).on('ready', function() {
   wireUpPages();
});