/*jslint browser: true*/
/*global $, c3*/
"use strict";
var bb = {};

var getPie = function (data, colours, element, onclick) {
	var pie = {
		bindto: element,
        color: { pattern: colours },
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
			selection: { enabled: true }
        },
		pie: {
			label: {
				format: function (value, ratio, id) {
					return id + ' ('+value+')';
				}
			}
		},
		legend: {
		  item: {
			onclick: function (id) { bb.chartClicked=true; }
		  }
		}
	};
	if(onclick){ pie.data.onclick = onclick; }
	return pie;
};

var populateSuggestedActions = function (id){
	var template = $('#sap-'+id.toLowerCase().replace(/ /g,'-')).html();
	Mustache.parse(template);   // optional, speeds up future uses
	var rendered = Mustache.render(template, bb.data.items[id]);
	$('#sap').html(rendered);
};

var populatePatients = function (id) {
	var template = $('#patient-list').html();
	Mustache.parse(template);   // optional, speeds up future uses
	var rendered = Mustache.render(template, bb.data.items[id]);
	$('#patients').html(rendered);
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
	if(bb[show].selected().length===0) $('#sap').html('');
}

var showOverviewCharts = function () {
    bb.chart1 = c3.generate(getPie(bb.data.unmeasured, ['#845fc8', '#a586de', '#6841b0'], '#chart1', function(d,i){
		selectPieSlice('chart1', d.id);
		populatePanels(d.id);
	}));
	bb.chart2 = c3.generate(getPie(bb.data.main, ['#845fc8', '#f96876'], '#chart2', function (d, i) {
		selectPieSlice('chart2', d.id);
		if (d.id === "Unmeasured") {
			showHideCharts('chart1','chart3');
		} else {
			showHideCharts('chart3','chart1');
		}
	} ));
	bb.chart3 = c3.generate(getPie(bb.data.uncontrolled, ['#f96876', '#fc8d97', '#f6495a'], '#chart3', function(d,i){
		selectPieSlice('chart3', d.id);
		populatePanels(d.id);
	}));

    $('#chart1').hide();
    $('#chart3').hide();
};

var show = function (page) {
    $('.page').hide();
    $('#' + page).show();

    if (page === 'page1') {
        showOverviewCharts();
    }
};

var wireUpPages = function () {
    show('login');

    $('#navbar').on('click', 'a', function () {
        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");
        if (this.href.split('#')[1] === 'about') { show('page2'); } 
		else if (this.href.split('#')[1] === 'contact') { show('page3'); } 
		else { show('login'); }
    });
    $('#login-button,#create-button,#forgot-button,#home-button').on('click', function (e) {
        show('page0');
        $(".nav").find(".active").removeClass("active");
        $('#home-page').addClass("active");
        e.preventDefault();
    });
};

var loadData = function() {
	$.getJSON("data.json", function(data) {
		bb.data = {"all" : data, "items" : {}, "unmeasured" : [], "uncontrolled": []};
		bb.data.main = [['Unmeasured', bb.data.all.unmeasured.n],['Uncontrolled', bb.data.all.uncontrolled.n]];
		for(var i=0; i < bb.data.all.unmeasured.items.length; i++) {
			bb.data.unmeasured.push([bb.data.all.unmeasured.items[i].name, bb.data.all.unmeasured.items[i].n]);
			bb.data.items[bb.data.all.unmeasured.items[i].name] = bb.data.all.unmeasured.items[i];
		}
		for(var i=0; i < bb.data.all.uncontrolled.items.length; i++) {
			bb.data.uncontrolled.push([bb.data.all.uncontrolled.items[i].name, bb.data.all.uncontrolled.items[i].n]);
			bb.data.items[bb.data.all.uncontrolled.items[i].name] = bb.data.all.uncontrolled.items[i];
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
	
	$('#chart-panel').on('click', function(e){
		if(!bb.chartClicked){
			$('path.c3-arc').attr('class', function(index, classNames) {
				return classNames.replace(/_unselected_/g, '');
			});
			bb.chart1.unselect();
			bb.chart2.unselect();
			bb.chart3.unselect();
			
			$('#chart1').hide();
			$('#chart3').hide();
			
			$('#sap').html('');
		}
		bb.chartClicked=false;
	});
	
	loadData();
});