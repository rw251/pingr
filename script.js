/*jslint browser: true*/
/*global $, c3*/
"use strict";
var bb = {};

var tooltiptext = function (value, ratio, id, index) {
    return value + ' (' + (ratio * 100).toFixed(2) + '%)';
};

var getMainData = function (){
	var data = [];
	data.push(['Unmeasured', chartData.unmeasured.n]);
	data.push(['Uncontrolled', chartData.uncontrolled.n]);
	return data;
};
var getUnmeasuredData = function (){
	var data = [];
	for(var i=0; i < chartData.unmeasured.items.length; i++) {
		data.push([chartData.unmeasured.items[i].name, chartData.unmeasured.items[i].n]);
	}
	return data;
};
var getUncontrolledData = function (){
	var data = [];
	for(var i=0; i < chartData.uncontrolled.items.length; i++) {
		data.push([chartData.uncontrolled.items[i].name, chartData.uncontrolled.items[i].n]);
	}
	return data;
};

var getPie = function (data, colours, element, onclick) {
	var pie = {
		bindto: element,
        color: {
            pattern: colours
        },
        tooltip: {
            format: {
                value: tooltiptext
            }
        },
        data: {
            columns: data,
            type: 'pie'
        }
	};
	if(onclick){
		pie.data.onclick = onclick;
	}
	return pie;
}

var showOverviewCharts = function () {
    bb.chart1 = c3.generate(getPie(getUnmeasuredData(), ['#3366FF', '#3375ff', '#3357ff'], '#chart1', function(d,i){
		if(d.id === "Nil"){
			var template = $('#sap-nil').html();
			Mustache.parse(template);   // optional, speeds up future uses
			var rendered = Mustache.render(template, {improvement: chartData.unmeasured.items[0]});
			$('#sap').html(rendered);
		} else if(d.id === "Indirect") {
			var template = $('#sap-indirect').html();
			Mustache.parse(template);   // optional, speeds up future uses
			var rendered = Mustache.render(template, {improvement: chartData.unmeasured.items[2]});
			$('#sap').html(rendered);
		} else if(d.id === "Direct") {
			var template = $('#sap-direct').html();
			Mustache.parse(template);   // optional, speeds up future uses
			var rendered = Mustache.render(template, {improvement: chartData.unmeasured.items[1]});
			$('#sap').html(rendered);
		}
	}));
	bb.chart2 = c3.generate(getPie(getMainData(), ['#3366FF', '#FF6633'], '#chart2', function (d, i) {
		if (d.id === "Unmeasured") {
			bb.chart1.show();
			bb.chart3.hide();
		} else {
			bb.chart3.show();
			bb.chart1.hide();
		}
	} ));
	bb.chart3 = c3.generate(getPie(getUncontrolledData(), ['#FF6633', '#ff5733', '#ff7533'], '#chart3' ));

    bb.chart1.hide();
    bb.chart3.hide();
};

var show = function (page) {
    $('.page').hide();
    $('#' + page).show();

    if (page === 'page1') {
        showOverviewCharts();
    }
};

var wireUpPages = function () {

    // wire up site
    show('login');

    $('#navbar').on('click', 'a', function () {
        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");
        if (this.href.split('#')[1] === 'about') {
            show('page2');
        } else if (this.href.split('#')[1] === 'contact') {
            show('page3');
        } else {
            show('login');
        }
    });
    $('#login-button,#create-button,#forgot-button,#home-button').on('click', function (e) {
        show('page1');
        $(".nav").find(".active").removeClass("active");
        $('#home-page').addClass("active");
        e.preventDefault();
    });
};

var chartData = {};
var loadData = function() {
	$.getJSON("data.json", function(data) {
		chartData = data;
	});
}

$(document).on('ready', function () {
    wireUpPages();
	
	loadData();
});