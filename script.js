/*jslint browser: true*/
/*global $, c3, Mustache*/
(function () {
   'use strict';
	var bb = {};
	bb.lookup = {"unmeasured" : "Measured", "uncontrolled": "Controlled", "excluded": "Excluded"};

	/********************************
	Charts - draw
	********************************/
	var drawTrendChart = function(){
		var data = bb.trend;	
		destroyCharts(['chart3']);	
		bb.chart3 = c3.generate({
			bindto: '#chart-trend',
			data: {
				x: 'x',
				columns: data
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d'
					}
				}
			},
			point: {
				show: false
			},
			size: {
				height: null
			},
			grid: {
				x: {
					lines: [{value: data[0][60], text: 'Action plan downloaded'}, {value: data[0][330], text: 'Action plan downloaded'}]
				}
			}
		});
	};

	var drawBpTrendChart = function(){
		//destroyCharts(['chart6']);
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
	};

	var drawContactChart = function (){
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
	};

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

	var selectPieSlice = function (chart, id){
		bb.chartClicked=true;
		$('#' + chart + ' path.c3-arc').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
		bb[chart].unselect();
		bb[chart].select(id);
	};

	var destroyCharts = function(charts){
		for(var i = 0 ; i<charts.length; i++){
			if(bb[charts[i]]) {
				bb[charts[i]].destroy();
				delete bb[charts[i]];
			}
		}
	};

	var drawMainCharts = function(disease){
		$('#breakdown-table').hide();
		$('#overall1').show();
		$('#overall2').hide();
		if(!disease) disease = "Blood Pressure";
		breadcrumbs([disease]);
		
		destroyCharts(['chart1','chart2','chart3']);
		
		bb.chart1 = c3.generate(getPie(bb.data[disease].Measured.main, ['#845fc8','#f96876'], '#chart1', function (d, i){
			if(d.id==="Measured") return;
			drawBreakdownChart(disease, bb.lookup[d.id.toLowerCase()], d.id);
			bb.selected = d.id;
		}));
		bb.chart3 = c3.generate(getPie(bb.data[disease].Controlled.main, ['#845fc8','#f96876'], '#chart3', function (d, i){
			if(d.id === "Controlled") return;
			drawBreakdownChart(disease, bb.lookup[d.id.toLowerCase()], d.id);
			bb.selected = d.id;
		}));
	};

	var drawBreakdownChart = function (disease, type, id){
		if(!disease) disease = "Blood Pressure";
		if(!type) type = "Measured";
		
		destroyCharts(['chart1','chart2','chart3']);
		
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

	/********************************
	Panels - populate
	********************************/
	var updateCheckboxes = function(id){
		var current = getObj();
		
		$('#sap').find('input[type=checkbox]').each(function(i){
			if(current.checkboxes && current.checkboxes[id] && current.checkboxes[id].length>i && current.checkboxes[id][i]){
				$(this).prop('checked', true);
			}
		});
		
		updateSapRows();
	};
	
	var updateSapRows = function(){
		$('#sap').find('input[type=checkbox]').each(function(i){
			if(this.checked){
				if(i%3===0){
					$(this).parent().parent().parent().addClass('warning');
				}
				else if(i%3===1){
					$(this).parent().parent().parent().addClass('success');
				} else {
					$(this).parent().parent().parent().addClass('danger');
				}
			} else {
				if(i%3===0){
					$(this).parent().parent().parent().removeClass('warning');
				}
				else if(i%3===1){
					$(this).parent().parent().parent().removeClass('success');
				} else {
					$(this).parent().parent().parent().removeClass('danger');
				}
			}
		});
	};
	
	var populateSuggestedActions = function (id){
		if(bb.selected==="Excluded"){
		  $('#sap').html('No team actions for excluded patients');
		  $('#sap-placeholder').hide();
		  $('#team-footer').hide();	  
		} else {
		  var template = $('#sap-template').html();
		  var checkbox = $('#checkbox-template').html();
		  Mustache.parse(template);   // optional, speeds up future uses
		  var rendered = Mustache.render(template, bb.data["Blood Pressure"].items[id], {"chk" : checkbox });
		  $('#sap').html(rendered);
		  $('#sap-placeholder').hide();
		  $('#team-footer').show();
		  updateCheckboxes(id);
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
	};

	var populatePatients = function (id) {
		var template = $('#patient-list').html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template, bb.data["Blood Pressure"].items[id]);
		$('#patients').html(rendered);
		$('#patients-placeholder').hide();
	};

	var populatePanels = function (id) {
		populatePatients(id);
		populateSuggestedActions(id);
	};

	var hidePanels = function(){  
		  $('#sap').html('');
		  $('#sap-placeholder').show();
		  $('#team-footer').hide();
		  $('#patients').html('');
		  $('#patients-placeholder').show();
		  $('#demographic-placeholder').show();
		  //$('#demographic-content').hide();
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

	var showPatientsTab = function(){
		$('#panel-right').find('.panel-title').html('Patients');
		$('#panel-right').find('.panel-footer').hide();
		$('#panel-message').hide();
		$('#panel-patients').show();
	};

	var show = function (page) {
		$('.page').hide();
		$('#' + page).show();

		if (page === 'page1') {
			$('#main').addClass('content');
			$('#topnavbar').addClass('full');
			$('#aside-toggle').removeClass('collapsed');
			$('#bottomnavbar').hide();
			drawMainCharts();
			drawContactChart();
		} else {	
			$('#main').removeClass('content');
			$('#topnavbar').removeClass('full');
			$('#aside-toggle').addClass('collapsed');
			$('#bottomnavbar').show();

		}
	};
	
	var getObj = function(){
		return JSON.parse(localStorage.bb);
	};
	
	var setObj = function(obj){
		localStorage.bb = JSON.stringify(obj);
	};

	bb.wireUpPages = function () {
		show('login');

		$('#topnavbar').on('click', 'a', function () {
			$("#navbar > .nav").find(".active").removeClass("active");
			$(this).parent().addClass("active");
			if (this.href.split('#')[1] === 'help') { show('help-page'); } 
			else show('page1');
		});
		
		$('#enter-button').on('click', function (e) {
			show('page1');
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
		
		$('#patients')
			.on('click', 'tr', function(e){
				$('.list-item').removeClass('highlighted');
				$(this).addClass('highlighted');
				var nhs = $(this).find('td').html();
				$('#demographic-placeholder').hide();
				//$('#demographic-content').show(function() {
					drawBpTrendChart(nhs);
				//});				
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
			})
			.on('click', 'tr button', function(e){
				var nhs = $(this).parent().parent().find('td').html();
				e.preventDefault();
			});
		
		
		$('#tab-performance').bind('afterAddClass', function() {
		  drawMainCharts();
		  showPatientsTab();
		});
		
		$('#tab-trend').bind('afterAddClass', function() {
			drawTrendChart();		
			showPatientsTab();
		});
				
		$('#breakdown-table')
			.on('mouseout', 'tr', function(){
				bb.chart2.focus();
			})
			.on('mouseover', 'tr', function(){
				bb.chart2.focus(bb.data["Blood Pressure"].ids[this.id.slice(4)]);
			})
			.on('click', 'tr', function(){
				selectPieSlice('chart2', bb.data["Blood Pressure"].ids[this.id.slice(4)]);
				populatePanels(bb.data["Blood Pressure"].ids[this.id.slice(4)]);
				$('#breakdown-table tr').removeClass('selected');
				$(this).addClass('selected');
			});
		
		$('#breadcrumb').on('click', 'a', function(e){
		  drawMainCharts();
		  e.preventDefault();
		});
		
		$('.tick-hover')
			.on('mouseover', function() {
				$(this).find('i').addClass('fa-check-circle');
			})
			.on('mouseout', function () {
				$(this).find('i').removeClass('fa-check-circle');
			})
			.on('click', function () {
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
							
				hidePanels();
				
			}
			bb.chartClicked=false;
		});
		
		$('#sap').on('click', 'input[type=checkbox]', function(){
			var idx = $('#sap').find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.checkboxes) current.checkboxes = {};
			if(!current.checkboxes[bb.subselected]) current.checkboxes[bb.subselected] = [];
			while(current.checkboxes[bb.subselected].length<=idx){
				current.checkboxes[bb.subselected].push(false);
			}
			current.checkboxes[bb.subselected][idx]=this.checked;
			setObj(current);
			updateSapRows();
		});
	};

	bb.loadData = function() {
		$.getJSON("data.json", function(file) {
			var d="", i=0, j=0;
			var data = file.data;
			bb.trend = file.trend;
			bb.data={};
			for(i = 0 ; i < data.length; i++){
				d = data[i].disease;
				bb.data[d] = {"all" : data[i], "ids" : {}, "items" : {}, "Measured" : {"breakdown":[]}, "Controlled": {"breakdown":[]}, "Excluded": {"breakdown":[]}};
				bb.data[d].Measured.main = [['Unmeasured', bb.data[d].all.unmeasured.n],['Measured', bb.data[d].all.measured],['Excluded', bb.data[d].all.excluded.n]];
				bb.data[d].Controlled.main = [['Uncontrolled', bb.data[d].all.uncontrolled.n],['Controlled', bb.data[d].all.controlled]	,['Excluded', bb.data[d].all.excluded.n]];
				
				for(j=0; j < bb.data[d].all.unmeasured.items.length; j++) {
					bb.data[d].Measured.breakdown.push([bb.data[d].all.unmeasured.items[j].name, bb.data[d].all.unmeasured.items[j].n]);
					bb.data[d].items[bb.data[d].all.unmeasured.items[j].name] = bb.data[d].all.unmeasured.items[j];
					bb.data[d].ids[bb.data[d].all.unmeasured.items[j].id] = bb.data[d].all.unmeasured.items[j].name;
				}
				for(j=0; j < bb.data[d].all.uncontrolled.items.length; j++) {
					bb.data[d].Controlled.breakdown.push([bb.data[d].all.uncontrolled.items[j].name, bb.data[d].all.uncontrolled.items[j].n]);
					bb.data[d].items[bb.data[d].all.uncontrolled.items[j].name] = bb.data[d].all.uncontrolled.items[j];
					bb.data[d].ids[bb.data[d].all.uncontrolled.items[j].id] = bb.data[d].all.uncontrolled.items[j].name;
				}
				for(j=0; j < bb.data[d].all.excluded.items.length; j++) {
					bb.data[d].Excluded.breakdown.push([bb.data[d].all.excluded.items[j].name, bb.data[d].all.excluded.items[j].n]);
					bb.data[d].items[bb.data[d].all.excluded.items[j].name] = bb.data[d].all.excluded.items[j];
					bb.data[d].ids[bb.data[d].all.excluded.items[j].id] = bb.data[d].all.excluded.items[j].name;
				}
			}
		});
	};
	
	window.bb = bb;
})();

/********************************
Preloader
********************************/
$(window).load(function() {
  $('.loading-container').fadeOut(1000, function() {
	$(this).remove();
  });
});	
	
$(document).on('ready', function () {
	if(!localStorage.bb) localStorage.bb = JSON.stringify({"checkboxes":{"Direct":[true,false,false,false,true],"Indirect":[false,false,false,true,false,false,false,false,false,true],"Nil":[false,false,false,false,false,false,true,false,false,false,true,false],"Recently Changed Rx":[true,false,false,true,false,false,true],"Suboptimal Rx":[false,true,false,false,false,false,false,true],"Recently Measured":[true,false,false,false,false,true]}});
	bb.wireUpPages();	
	bb.loadData();
});