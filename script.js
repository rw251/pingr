/*jslint browser: true*/
/*global $, c3*/
"use strict";
var bb = {};
bb.lookup = {"unmeasured" : "Measured", "uncontrolled": "Controlled", "excluded": "Excluded"};

/********************************
Preloader
********************************/
$(window).load(function() {
  $('.loading-container').fadeOut(1000, function() {
	$(this).remove();
  });
});	

var getPie = function (data, colours, element, onclick, onmouseover, onmouseout) {
	var pie = {
		bindto: element,
        //color: { pattern: colours },
        tooltip: {
            format: {
                value: function (value, ratio, id, index) {
					return value + ' (' + (ratio * 100).toFixed(2) + '%)';
				}
            }
        },
        data: {
            columns: data,
            type: 'pie',
			selection: { enabled: true },
			order: null
        },
		pie: {
			label: {
				format: function (value, ratio, id) {
					return id;// + ' ('+value+')';
				}
			}
		},
		legend: {
			show: false
		  /*item: {
			onclick: function (id) { bb.chartClicked=true; }
		  }*/
		}
	};
	if(onclick){ pie.data.onclick = onclick; }
	if(onmouseover){ pie.data.onmouseover = onmouseover; }
	if(onmouseout){ pie.data.onmouseout = onmouseout; }
	return pie;
};

var populateSuggestedActions = function (id){
	if(bb.selected==="Excluded"){
	  $('#sap').html('No team actions for excluded patients');
	  $('#sap-placeholder').hide();
	  $('#team-footer').hide();	  
	} else {
	  var template = $('#sap-'+id.toLowerCase().replace(/ /g,'-')).html();
	  Mustache.parse(template);   // optional, speeds up future uses
	  var rendered = Mustache.render(template, bb.data["Blood Pressure"].items[id]);
	  $('#sap').html(rendered);
	  $('#sap-placeholder').hide();
	  $('#team-footer').show();
	}
};

var populateBreakdownTable = function(id){
	var template = $('#breakdown-table-template').html();
	var data = bb.data["Blood Pressure"].all[id.toLowerCase()];
	for(var i = 0 ; i< data.items.length; i++){
	  data.items[i].color = bb.chart2.color(data.items[i].name);
	}
	Mustache.parse(template);   // optional, speeds up future uses
	var rendered = Mustache.render(template, data);
	$('#breakdown-table').html(rendered).show();
}

var populatePatients = function (id) {
	var template = $('#patient-list').html();
	Mustache.parse(template);   // optional, speeds up future uses
	var rendered = Mustache.render(template, bb.data["Blood Pressure"].items[id]);
	$('#patients').html(rendered);
	$('#patients-placeholder').hide();
	
	bb.client = new ZeroClipboard($("#patients .btn-clip"));
}

var populatePanels = function (id) {
	populatePatients(id);
	populateSuggestedActions(id);
}

var selectPieSlice = function (chart, id){
	bb.chartClicked=true;
	$('#' + chart + ' path.c3-arc').attr('class', function(index, classNames) {
		return classNames + ' _unselected_';
	});
	bb[chart].unselect();
	bb[chart].select(id);
};

var showHideCharts = function (show, hide){
	$('#'+show).show(400);
	$('#'+hide).hide(400);
	bb[hide].unselect();
	$('#' + hide + ' path.c3-arc').attr('class', function(index, classNames) {
		return classNames.replace(/_unselected_/g, '');
	});
	if(bb[show].selected().length===0) {
		$('#sap').html('');
		$('#sap-placeholder').show();
		$('#team-footer').hide();
		$('#patients').html('');
		$('#patients-placeholder').show();		
		$('#demographic-placeholder').show();
		$('#demographic-content').hide();
	}
};

var breadcrumbs = function(items){
  var html = [];
  if(items.length===1) {
    html.push('<span>' + items[0] + '</span>');
  }
  else {
    for(var i =0 ; i< items.length; i++){
      if(i===items.length-1){
	html.push('<span>' + items[i] + '</span>');
      } else{
	html.push('<a href="">' + items[i] + '</a>');
      }
    }
  }
  $('#breadcrumb').html(html.join(' &gt; '));
};

//most recent shows both side by side
var showMainCharts = function(disease){
	$('#breakdown-table').hide();
	$('#overall1').show();
	$('#overall2').hide();
	if(!disease) disease = "Blood Pressure";
	breadcrumbs([disease]);
	if(bb.chart1) {
		bb.chart1.destroy();
		delete bb.chart1;
	}
	if(bb.chart2) {
		bb.chart2.destroy();
		delete bb.chart2;
	}
	if(bb.chart3) {
		bb.chart3.destroy();
		delete bb.chart3;
	}
	bb.chart1 = c3.generate(getPie(bb.data[disease]["Measured"].main, ['#845fc8','#f96876'], '#chart1', function (d, i){
		if(d.id==="Measured") return;
		showBreakdown(disease, bb.lookup[d.id.toLowerCase()], d.id);
		bb.selected = d.id;
	}));
	bb.chart3 = c3.generate(getPie(bb.data[disease]["Controlled"].main, ['#845fc8','#f96876'], '#chart3', function (d, i){
		if(d.id === "Controlled") return;
		showBreakdown(disease, bb.lookup[d.id.toLowerCase()], d.id);
		bb.selected = d.id;
	}));
};

//older - not used - displays one at a time
var showMainChart = function (disease, type) {
	if(!disease) disease = "Blood Pressure";
	if(!type) type = "Measured";
	if(bb.chart1) {
		bb.chart1.destroy();
		delete bb.chart1;
	}
	if(bb.chart2) {
		bb.chart2.destroy();
		delete bb.chart2;
	}
    bb.chart1 = c3.generate(getPie(bb.data[disease][type].main, ['#845fc8','#f96876'], '#chart1', function (d, i){
		if(d.id==="Measured" || d.id === "Controlled") return;
		showBreakdown(disease, bb.lookup[d.id.toLowerCase()], d.id);
	}));
	$('#breakdown-table').hide();
	breadcrumbs([disease]);
};

var showBreakdown = function (disease, type, id){
	if(!disease) disease = "Blood Pressure";
	if(!type) type = "Measured";
	
	if(bb.chart1) {
		bb.chart1.destroy();
		delete bb.chart1;
	}
	
	if(bb.chart2) {
		bb.chart2.destroy();
		delete bb.chart2;
	}
	
	if(bb.chart3) {
		bb.chart3.destroy();
		delete bb.chart3;
	}
	bb.chart2 = c3.generate(getPie(bb.data[disease][type].breakdown, ['#845fc8', '#a586de', '#6841b0'], '#chart2', function (d, i) {
		selectPieSlice('chart2', d.id);
		populatePanels(d.id);		
		$('#breakdown-table tr').removeClass('selected');
		$('#row-'+bb.data[disease].items[d.id].id).addClass('selected');
		$('a[href=#tab-sap-team]').tab('show');
		bb.subselected = d.id;
	}, function(d,i){
		$('#breakdown-table tr').removeClass('tr-hovered');
		$('#row-'+bb.data[disease].items[d.id].id).addClass('tr-hovered');
	}, function (d,i){
	  $('#breakdown-table tr').removeClass('tr-hovered');
	}));
	populateBreakdownTable(id);
	breadcrumbs([disease, type]);
	$('#overall1').hide();
	$('#overall2').show();
};

var show = function (page) {
    $('.page').hide();
    $('#' + page).show();

    if (page === 'page1') {
		$('#main').addClass('content');
		$('#topnavbar').addClass('full');
		$('#aside-toggle').removeClass('collapsed');
        showMainCharts();
		showContactChart();
    } else {	
		$('#main').removeClass('content');
		$('#topnavbar').removeClass('full');
		$('#aside-toggle').addClass('collapsed');
	}
};

var showContactChart = function (){
	if(bb.chart5) bb.chart5.destroy();
	bb.chart5  = c3.generate({
		bindto: "#chart-demo-contact",
		data: {
			x: 'x',
			columns: [
				['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
				['data1', 30, 200, 100, 400, 150, 250]
			]
		},
		axis: {
			x: {
				type: 'timeseries',
				tick: {
					format: '%Y-%m-%d'
				}
			}
		},
		grid: {
			x: {
				lines: [{value: '2013-01-02', text: 'F2F'}, {value: '2013-01-05', text: 'Prescription'}]
			}
		}
	});
}

var wireUpPages = function () {
    show('login');

    $('#navbar').on('click', 'a', function () {
        $("#navbar > .nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");
        if (this.href.split('#')[1] === 'about') { show('page2'); } 
		else if (this.href.split('#')[1] === 'contact') { show('page3'); } 
		else { show('login'); }
    });
    $('#login-button,#create-button,#forgot-button,#home-button').on('click', function (e) {
        show('page0');
        $("#navbar > .nav").find(".active").removeClass("active");
        $('#home-page').addClass("active");
        e.preventDefault();
    });
	
	$('#pick-nice').on('click', function(){
		$('#pick-button').html('NICE <span class="caret"></span>');
		$('#guide-amount').html('<i class="fa fa-warning"></i> 96</span>');
		$('#guide-text').html('CVD events could be prevented');
	});
	$('#pick-qof').on('click', function(){
		$('#pick-button').html('QOF <span class="caret"></span>');
		$('#guide-amount').html('<i class="fa fa-warning"></i> 12</span>');
		$('#guide-text').html('QOF points could be achieved');		
	});
	
	$('#patients').on('click', 'tr', function(e){
		$('.list-item').removeClass('highlighted');
		$(this).addClass('highlighted');
		var nhs = $(this).find('td').html();
		$('#demographic-placeholder').hide();
		$('#demographic-content').show();
		$('a[href=#tab-sap-individual]').tab('show');
		var examples = [["Increase ramipril by 2.5mg","Increase amlodipine by 5mg","Start a diuretic"],
			      ["Increase losartan by 25mg","Increase bisoprolol by 2.5mg","Start a calcium channel blocker"],
			      ["Refer to secondary care"]];
			      var html = "";
		if(bb.selected && bb.selected === "Uncontrolled"){
		var r = Math.floor(Math.random()*3);
html='<span>Patient ' + nhs + '</span><table class="table"><thead><tr><th>Action</th><th>Todo</th><th>Done</th><th>Declined</th></tr></thead><tbody><tr><td>' + examples[r].join('</td><td><input type="checkbox" /></td><td><input type="checkbox" /></td><td><input type="checkbox" /></td></tr><tr><td>')  + '</td><td><input type="checkbox" /></td><td><input type="checkbox" /></td><td><input type="checkbox" /></td></tr></tbody></table>';
		} else if (bb.selected && bb.selected === "Excluded" && bb.subselected){
	    html='<div><span>Patient ' + nhs + '</span> is excluded because of "' + bb.data["Blood Pressure"].items[bb.subselected].desc +'"</div>';
	    if(bb.subselected!="Exclusion code") {
	      html += '<div>We suggest you add the following exclusion code to their record: <a href="#">9h3.</a></div>';
	    }
		}
		$('#advice').html(html);
		e.preventDefault();
	});
	$('#patients').on('click', 'tr button', function(e){
		console.log('button click');
		var nhs = $(this).parent().parent().find('td').html();
		e.preventDefault();
	});
	
	
	$('#tab-performance').bind('afterAddClass', function() {
      showMainCharts();
    });
	$('#tab-trend').bind('afterAddClass', function() {
		var date = new Date();
		var month = date.getMonth()+1;
		var year = date.getFullYear()-1;
		var years = ['x'];
		var ad=2072;
		var bd=1413;
		var cd=2072;
		var dd=595;
		var a = ['Unmeasured'];
		var b = ['Nil'];
		var c = ['Indirect'];
		var d = ['Direct'];
		for(var i = 0; i< 13; i++) {
			years.push(year+'-'+month+'-01');
			a.push(ad);
			b.push(bd);
			c.push(cd);
			d.push(dd);
			month++;
			if(month===13) {
				month=1;
				year++;
			}
			ad += -75 + Math.floor(100*Math.random());
			bd += -50 + Math.floor(100*Math.random());
			cd += -60 + Math.floor(100*Math.random());
			dd += -90 + Math.floor(100*Math.random());
		}
		if(bb.chart3) bb.chart3.destroy();
		bb.chart3 = c3.generate({
			bindto: '#chart-trend',
			data: {
				x: 'x',
				columns: [
					years,
					a,b,c,d
				]
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d'
					}
				}
			}
		});
	});
	
	$('#tab-benchmark').bind('afterAddClass', function() {
		if(bb.chart4) bb.chart4.destroy();
		bb.chart4 = c3.generate({
			bindto: '#chart-benchmark',
			data: {
				columns: [
					["My practice", 2072,300,500,1745],
					["CCG average", 3052,129, 740, 1200],
				]
			},
			axis: {
				x: {
					type: 'category',
					categories: ['Unmeasured', 'Nil',  'Direct', 'Indirect'],
					label: 'Category'
				},
				y: {
					label: 'Number'
				}
			}
		});
	});
	
	$('#tab-demo-contact').bind('afterAddClass', function() {
		showContactChart();
	});
	
	$('#tab-demo-trend').bind('afterAddClass', function() {
		
		if(bb.chart6) {
			bb.chart6.destroy();
			delete bb.chart6;
		}
		bb.chart6 = c3.generate({
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: [
					['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
					['SBP', 150, 165, 160, 170, 175, 185],
					['DBP', 90, 90, 85, 80, 110, 95]
				]
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d'
					}
				}
			}
		});
	});
	
	$('#breakdown-table').on('mouseout', 'tr', function(){
		bb.chart2.focus();
	});
	
	$('#breakdown-table').on('mouseover', 'tr', function(){
		bb.chart2.focus(bb.data["Blood Pressure"].ids[this.id.slice(4)]);
	});
	
	$('#breakdown-table').on('click', 'tr', function(){
		selectPieSlice('chart2', bb.data["Blood Pressure"].ids[this.id.slice(4)]);
		populatePanels(bb.data["Blood Pressure"].ids[this.id.slice(4)]);
		$('#breakdown-table tr').removeClass('selected');
		$(this).addClass('selected');
	});
	
	$('#breadcrumb').on('click', 'a', function(e){
	  showMainCharts();
	  e.preventDefault();
	});
};

var loadData = function() {
	$.getJSON("data.json", function(data) {
		var d="";
		bb.data={}
		for(var i = 0 ; i < data.length; i++){
			d = data[i].disease;
			bb.data[d] = {"all" : data[i], "ids" : {}, "items" : {}, "Measured" : {"breakdown":[]}, "Controlled": {"breakdown":[]}, "Excluded": {"breakdown":[]}};
			bb.data[d].Measured.main = [['Unmeasured', bb.data[d].all.unmeasured.n],['Measured', bb.data[d].all.measured],['Excluded', bb.data[d].all.excluded.n]];
			bb.data[d].Controlled.main = [['Uncontrolled', bb.data[d].all.uncontrolled.n],['Controlled', bb.data[d].all.controlled]	,['Excluded', bb.data[d].all.excluded.n]];
			
			for(var i=0; i < bb.data[d].all.unmeasured.items.length; i++) {
				bb.data[d].Measured.breakdown.push([bb.data[d].all.unmeasured.items[i].name, bb.data[d].all.unmeasured.items[i].n]);
				bb.data[d].items[bb.data[d].all.unmeasured.items[i].name] = bb.data[d].all.unmeasured.items[i];
				bb.data[d].ids[bb.data[d].all.unmeasured.items[i].id] = bb.data[d].all.unmeasured.items[i].name;
			}
			for(var i=0; i < bb.data[d].all.uncontrolled.items.length; i++) {
				bb.data[d].Controlled.breakdown.push([bb.data[d].all.uncontrolled.items[i].name, bb.data[d].all.uncontrolled.items[i].n]);
				bb.data[d].items[bb.data[d].all.uncontrolled.items[i].name] = bb.data[d].all.uncontrolled.items[i];
				bb.data[d].ids[bb.data[d].all.uncontrolled.items[i].id] = bb.data[d].all.uncontrolled.items[i].name;
			}
			for(var i=0; i < bb.data[d].all.excluded.items.length; i++) {
				bb.data[d].Excluded.breakdown.push([bb.data[d].all.excluded.items[i].name, bb.data[d].all.excluded.items[i].n]);
				bb.data[d].items[bb.data[d].all.excluded.items[i].name] = bb.data[d].all.excluded.items[i];
				bb.data[d].ids[bb.data[d].all.excluded.items[i].id] = bb.data[d].all.excluded.items[i].name;
			}
		}
	});
}

$(document).on('ready', function () {
    wireUpPages();
	
	$('.tick-hover').on('mouseover', function() {
		$(this).find('i').addClass('fa-check-circle');
	});
	$('.tick-hover').on('mouseout', function () {
		$(this).find('i').removeClass('fa-check-circle');
	});
	$('.tick-hover').on('click', function () {
		show('page1');
	});
	
	$('#chart-panel').on('click', function(e){
		if(!bb.chartClicked){
			$('path.c3-arc').attr('class', function(index, classNames) {
				return classNames.replace(/_unselected_/g, '');
			});
			if(bb.chart1) bb.chart1.unselect();
			if(bb.chart2) bb.chart2.unselect();
			if(bb.chart3) bb.chart3.unselect();
						
			$('#sap').html('');
			$('#sap-placeholder').show();
			$('#team-footer').hide();
			$('#patients').html('');
			$('#patients-placeholder').show();	
			$('#demographic-placeholder').show();
			$('#demographic-content').hide();
			
		}
		bb.chartClicked=false;
	});
	
	loadData();
});