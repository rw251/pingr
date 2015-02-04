/*jslint browser: true*/
/*global $, c3*/
"use strict";
var bb = {};

var getPie = function (data, colours, element, onclick) {
	var pie = {
		bindto: element,
        color: {
            pattern: colours
        },
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
			selection: {
				enabled: true
			}
        },
		pie: {
			label: {
				format: function (value, ratio, id) {
					return id + ' ('+value+')';
				}
			}
		}
	};
	if(onclick){
		pie.data.onclick = onclick;
	}
	return pie;
};

var populateSuggestedActions = function (id){
	var template = $('#sap-'+id.toLowerCase().replace(/ /g,'-').html();
	Mustache.parse(template);   // optional, speeds up future uses
	var rendered = Mustache.render(template, bb.data.items[id]);
	$('#sap').html(rendered);
};

var showOverviewCharts = function () {
    bb.chart1 = c3.generate(getPie(bb.data.unmeasured, ['#845fc8', '#a586de', '#6841b0'], '#chart1', function(d,i){
		bb.chartClicked=true;
		$('#chart1 path.c3-arc').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
		bb.chart1.unselect();
		bb.chart1.select(d.id);
		populateSuggestedActions(d.id);
	}));
	bb.chart2 = c3.generate(getPie(bb.data.main, ['#845fc8', '#f96876'], '#chart2', function (d, i) {
		bb.chartClicked=true;
		$('#chart2 path.c3-arc').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
		bb.chart2.unselect();
		bb.chart2.select(d.id);
		if (d.id === "Unmeasured") {
			$('#chart1').show(400);
			$('#chart3').hide(400);
			bb.chart3.unselect();
			$('#chart3 path.c3-arc').attr('class', function(index, classNames) {
				return classNames.replace(/_unselected_/g, '');
			});
			if(bb.chart1.selected().length===0) $('#sap').html('');
		} else {
			$('#chart3').show(400);
			$('#chart1').hide(400);
			bb.chart1.unselect();
			$('#chart1 path.c3-arc').attr('class', function(index, classNames) {
				return classNames.replace(/_unselected_/g, '');
			});
			if(bb.chart3.selected().length===0) $('#sap').html('');
		}
	} ));
	bb.chart3 = c3.generate(getPie(bb.data.uncontrolled, ['#f96876', '#fc8d97', '#f6495a'], '#chart3', function(d,i){
		bb.chartClicked=true;
		$('#chart3 path.c3-arc').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
		bb.chart3.unselect();
		bb.chart3.select(d.id);
		populateSuggestedActions(d.id);
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

var loadData = function() {
	$.getJSON("data.json", function(data) {
		bb.data = {};
		bb.data.all = data;
		bb.data.items = {};
		bb.data.unmeasured = [];
		bb.data.uncontrolled = [];
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