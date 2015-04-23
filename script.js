/*jslint browser: true*/
/*jshint -W055 */
/*global $, c3, Mustache*/

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar in layour and content
 *  to all the others.
 */
 
(function () {
   'use strict';
	var bb = {}, patientId, clip;
	bb.lookup = {"unmeasured" : "Measured", "uncontrolled": "Controlled", "exclusions": "Exclusions"};
	bb.categories = {
		"diagnosis": 	{"name" : "diagnosis", 	"d1" : "Diagnosed", 	"d2" : "Diagnosed"		}, 
		"monitoring":	{"name" : "monitoring", "d1" : "Measured",		"d2" : "Unmeasured"		}, 
		"treatment":	{"name" : "treatment", 	"d1" : "Controlled", 	"d2" : "Uncontrolled"	}, 
		"exclusions":	{"name" : "exclusions", "d1" : "Exclusions", 	"d2" : "Exclusions"		}
	};
	bb.pathway = "Blood Pressure";
	bb.page = "";

	/**************
	 *** Layout ***
	 **************/

	var switchToFourPanelLayout = function(){
		$('#bottom-left-panel').removeClass('col-sm-12').addClass('col-sm-6');
		$('#bottom-right-panel').addClass('col-sm-6').show();
	};

	var switchToThreePanelLayout = function(){
		$('#bottom-left-panel').addClass('col-sm-12').removeClass('col-sm-6');
		$('#bottom-right-panel').removeClass('col-sm-6').hide();
	};

	var updateBreadcrumbs = function(items){
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

	var showSidePanel = function() {
		$('#main').addClass('content');
		$('#topnavbar').addClass('full');
		$('#aside-toggle').removeClass('collapsed');
		$('#bottomnavbar').hide();
	};

	var hideSidePanel = function() {
		$('#main').removeClass('content');
		$('#topnavbar').removeClass('full');
		$('#aside-toggle').addClass('collapsed');
		$('#bottomnavbar').show();
	};

	/**************
	 *** Panels ***
	 **************/

	var hideAllPanels = function(){
		$('#sap').html('');
		$('#sap-placeholder').show();
		$('#advice').html('');
		$('#advice-placeholder').show();
		$('#individual-footer').hide();
		$('#team-footer').hide();
		$('#patients').html('');
		$('#patients-placeholder').show();
		$('#demographic-placeholder').show();
	};

	var createPanel = function(templateId, panelId, data, templates){
		var template = $('#' + templateId).html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template, data, templates);
		$('#'+panelId).html(rendered).show();
	};

	var showPanel = function(diseaseStage, location, enableHover) {
		if(diseaseStage === bb.categories.monitoring.name) return showMonitoringPanel(location, enableHover);
		if(diseaseStage === bb.categories.treatment.name) return showTreatmentPanel(location, enableHover);
		if(diseaseStage === bb.categories.diagnosis.name) return showDiagnosisPanel(location, enableHover);
		if(diseaseStage === bb.categories.exclusions.name) return showExclusionsPanel(location, enableHover);
	};

	var showMonitoringPanel = function(location, enableHover) {
		createPanel('monitoring-panel', location, {
			percent: bb.data[bb.pathway].all.measured.trend[1][1], 
			percentChange: Math.abs(bb.data[bb.pathway].all.measured.trend[1][1]-bb.data[bb.pathway].all.measured.trend[1][30]), 
			percentUp: bb.data[bb.pathway].all.measured.trend[1][1]-bb.data[bb.pathway].all.measured.trend[1][30]>=0,
			number: bb.data[bb.pathway].all.measured.trend[2][1], 
			numberUp: bb.data[bb.pathway].all.measured.trend[2][1]-bb.data[bb.pathway].all.measured.trend[2][30]>=0, 
			numberChange: Math.abs(bb.data[bb.pathway].all.measured.trend[2][1]-bb.data[bb.pathway].all.measured.trend[2][30])
			}, {"change-bar": $('#change-bar').html()}
		);

		if(enableHover) highlightOnHoverAndEnableSelectByClick(location);

		destroyCharts(['monitoring-chart']);
		bb["monitoring-chart"] = c3.generate({
			bindto: '#monitoring-chart',
			data: {
				x: 'x',
				columns: bb.data[bb.pathway].all.measured.trend,
				axes: {
					"%" : 'y',
					"n" : 'y2'
				}
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d',
						count: 7,
						culling: {
							max: 4
						}
					}
				},
				y2: {
					show: true
				}
			},
			point: {
				show: false
			},
			size: {
				height: null
			}
			/*grid: {
			 x: {
			 lines: [{value: data[0][60], text: 'Action plan downloaded'}, {value: data[0][330], text: 'Action plan downloaded'}]
			 }
			 }*/
		});
	};

	var showTreatmentPanel = function(location, enableHover) {
		createPanel('treatment-panel', location, {
			percent: bb.data[bb.pathway].all.controlled.trend[1][1], 
			percentChange: Math.abs(bb.data[bb.pathway].all.controlled.trend[1][1]-bb.data[bb.pathway].all.controlled.trend[1][30]), 
			percentUp: bb.data[bb.pathway].all.controlled.trend[1][1]-bb.data[bb.pathway].all.controlled.trend[1][30]>=0,
			number: bb.data[bb.pathway].all.controlled.trend[2][1], 
			numberUp: bb.data[bb.pathway].all.controlled.trend[2][1]-bb.data[bb.pathway].all.controlled.trend[2][30]>=0, 
			numberChange: Math.abs(bb.data[bb.pathway].all.controlled.trend[2][1]-bb.data[bb.pathway].all.controlled.trend[2][30])
			}, {"change-bar": $('#change-bar').html()}
		);

		if(enableHover) highlightOnHoverAndEnableSelectByClick(location);

		destroyCharts(['treatment-chart']);
		bb["treatment-chart"] = c3.generate({
			bindto: '#treatment-chart',
			data: {
				x: 'x',
				columns: bb.data[bb.pathway].all.controlled.trend,
				axes: {
					"%" : 'y',
					"n" : 'y2'
				}
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d',
						count: 7,
						culling: {
							max: 4
						}
					}
				},
				y2: {
					show: true
				}
			},
			point: {
				show: false
			},
			size: {
				height: null
			}/*,
			 grid: {
			 x: {
			 lines: [{value: data[0][60], text: 'Action plan downloaded'}, {value: data[0][330], text: 'Action plan downloaded'}]
			 }
			 }*/
		});
	};

	var showDiagnosisPanel = function(location, enableHover) {
		createPanel('diagnosis-panel', location);

		c3.generate({
			bindto: '#diagnosis-chart',
			data: {
				columns: [
					['data1', 30, 200, 100, 400, 150]
				],
				type: 'bar'
			},
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
				// or
				//width: 100 // this makes bar width 100px
			},
			axis: {
				x: {
					type: 'category',
					categories: ['HTN', 'CKD', 'DM', 'Protein', 'McrA']
				}
			}
		});
	};

	var showExclusionsPanel = function(location, enableHover) {
		createPanel('exclusion-panel', location);

		if(enableHover) highlightOnHoverAndEnableSelectByClick(location);

		c3.generate({
			bindto: '#exclusion-chart',
			data: {
				columns: [
					['data1', 54, 24, 78]
				],
				type: 'bar'
			},
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
				// or
				//width: 100 // this makes bar width 100px
			},
			axis: {
				x: {
					type: 'category',
					categories: ['Hypotension', 'Palliative care', 'Exclusion code']
				}
			}
		});
	};

	var addPatientPanel = function(location) {
		var template = $('#patients-panel').html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template);
		$('#'+location).html(rendered).show();


		$('#patients').on('click', 'thead tr th.sortable', function(e){
			var sortAsc = !$(this).hasClass('sort-asc');
			if(sortAsc) {
				$(this).removeClass('sort-desc').addClass('sort-asc');
			} else {
				$(this).removeClass('sort-asc').addClass('sort-desc');
			}
			populatePatientPanel(patientId, $(this).text().substr(0,1) === "L" ? "sbp" : "nhs", sortAsc);
		})
			.on('click', 'tbody tr', function(e){
				$('.list-item').removeClass('highlighted');
				$(this).addClass('highlighted');
				var nhs = $(this).find('td button').attr('data-clipboard-text');
				$('#demographic-placeholder').hide();

				drawBpTrendChart(nhs);
				bb.nhs = nhs;

				$('a[href=#tab-sap-individual]').tab('show');

				populateIndividualSuggestedActions(nhs);

				e.preventDefault();
			})
			.on('click', 'tbody tr button', function(e){
				//don't want row selected if just button pressed?
				e.preventDefault();
				e.stopPropagation();
			})
			.niceScroll({
				//cursorcolor: "#424242", // change cursor color in hex
				cursoropacitymin: 0.3, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
				//cursoropacitymax: 1, // change opacity when cursor is active (scrollabar "visible" state), range from 1 to 0
				cursorwidth: "7px", // cursor width in pixel (you can also write "5px")
				//cursorborder: "1px solid #fff", // css definition for cursor border
				//cursorborderradius: "5px", // border radius in pixel for cursor
				horizrailenabled: false // nicescroll can manage horizontal scroll
			});
	};

	var addTrendPanel = function(location) {
		var template = $('#bp-trend-panel').html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template);
		$('#'+location).html(rendered).show();
	};

	var addBreakdownPanel = function (type, id){
		if(!type) type = "Measured";

		bb.selected = id;

		var template = $('#breakdown-panel').html();
		Mustache.parse(template);   // optional, speeds up future uses

		var header = "";
		if(type.toLowerCase()==="measured") header = "Patients with opportunities for BP measurement";
		else if(type.toLowerCase()==="controlled") header = "Patients who have potentially missed opportunities";

		var rendered = Mustache.render(template,{"header":header});
		$('#top-right-panel').html(rendered).show();


		$('#top-right-panel').off('click','.panel-body');
		$('#top-right-panel').on('click', '.panel-body', function(e){
			if(!bb.chartClicked){
				$('path.c3-arc').attr('class', function(index, classNames) {
					return classNames.replace(/_unselected_/g, '');
				});
				if(bb.chart1) bb.chart1.unselect();
				if(bb['breakdown-chart']) bb['breakdown-chart'].unselect();
				if(bb.chart3) bb.chart3.unselect();

				hideAllPanels();
			}
			bb.chartClicked=false;
		});

		$('#breakdown-table').on('mouseout', 'tr', function(){
			if($(this).find('th').length>0) return; //ignore header row
			bb['breakdown-chart'].focus();
		}).on('mouseover', 'tr', function(){
			if($(this).find('th').length>0) return; //ignore header row
			bb['breakdown-chart'].focus(bb.data[bb.pathway].ids[this.id.slice(4)]);
		}).on('click', 'tr', function(){
			if($(this).find('th').length>0) return; //ignore header row
			var id = bb.data[bb.pathway].ids[this.id.slice(4)];
			selectPieSlice('breakdown-chart', id);
			populatePatientPanel(id);
			populateSuggestedActionsPanel(id);
			bb.subselected = id;
			$('#breakdown-table tr').removeClass('selected');
			$(this).addClass('selected');
		});

		destroyCharts(['breakdown-chart']);

		bb['breakdown-chart'] = c3.generate(getPie(bb.data[bb.pathway][type].breakdown, ['#845fc8', '#a586de', '#6841b0'], '#breakdown-chart', function (d, i) {
			selectPieSlice('breakdown-chart', d.id);
			populatePatientPanel(d.id);
			populateSuggestedActionsPanel(d.id);
			$('#breakdown-table tr').removeClass('selected');
			$('#row-'+bb.data[bb.pathway].items[d.id].id).addClass('selected');
			$('a[href=#tab-sap-team]').tab('show');
			bb.subselected = d.id;
		}, function(d,i){
			$('#breakdown-table tr').removeClass('tr-hovered');
			$('#row-'+bb.data[bb.pathway].items[d.id].id).addClass('tr-hovered');
		}, function (d,i){
			$('#breakdown-table tr').removeClass('tr-hovered');
		}));
		populateBreakdownTable(id);
		updateBreadcrumbs([bb.pathway, type]);
	};

	var addActionPlanPanel = function(location) {
		var template = $('#action-plan-panel').html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template);
		$('#'+location).html(rendered).show();

		$('#export-plan').on('click', exportPlan);

		$('#action-plan-tabs a').click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});

		$('#sap').on('click', 'input[type=checkbox]', function(){
			var idx = $('#sap').find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[bb.subselected]) current.actions[bb.subselected] = {"agree":[],"done":[]};
			while(current.actions[bb.subselected].done.length<=idx){
				current.actions[bb.subselected].done.push(false);
			}
			current.actions[bb.subselected].done[idx]=this.checked;
			setObj(current);
			updateSapRows();
		});

		$('#advice-list').on('click', 'input[type=checkbox]', function(){
			var idx = $('#advice-list').find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[bb.nhs]) current.actions[bb.nhs] = {"agree":[],"done":[]};
			while(current.actions[bb.nhs].done.length<=idx){
				current.actions[bb.nhs].done.push(false);
			}
			current.actions[bb.nhs].done[idx]=this.checked;
			setObj(current);
			updateSapRows();
		});

		$('#tab-sap-team').on('click', '.edit-plan', function(e){
			displayPersonalisedActionPlan(bb.subselected, $('#tab-sap-team .panel-footer'), true, true);
		}).on('click', '.add-plan', function(e){
			var obj = getObj();
			obj.plans.team[bb.subselected] = $('#tab-sap-team textarea').val();
			setObj(obj);

			displayPersonalisedActionPlan(bb.subselected, $('#tab-sap-team .panel-footer'), true, false);
		}).on('change', 'input[type=radio]', function(e){
			var idx = Math.floor($('#sap').find('input[type=radio]').index(this)/2);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[bb.subselected]) current.actions[bb.subselected] = {"agree":[],"done":[]};
			while(current.actions[bb.subselected].agree.length<=idx){
				current.actions[bb.subselected].agree.push("");
			}
			current.actions[bb.subselected].agree[idx]=this.value==="yes";
			setObj(current);

			updateSapRows();
		});

		$('#tab-sap-individual').on('click', '.edit-plan', function(e){
			displayPersonalisedActionPlan(bb.nhs, $('#tab-sap-individual .panel-footer'), false, true);
		}).on('click', '.add-plan', function(e){
			var obj = getObj();
			obj.plans.individual[bb.nhs] = $('#tab-sap-individual textarea').val();
			setObj(obj);

			displayPersonalisedActionPlan(bb.nhs, $('#tab-sap-individual .panel-footer'), false, false);
		}).on('change', 'input[type=radio]', function(e){
			var idx = Math.floor($('#advice-list').find('input[type=radio]').index(this)/2);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[bb.nhs]) current.actions[bb.nhs] = {"agree":[],"done":[]};
			while(current.actions[bb.nhs].agree.length<=idx){
				current.actions[bb.nhs].agree.push("");
			}
			current.actions[bb.nhs].agree[idx]=this.value==="yes";
			setObj(current);

			updateSapRows();
		});
	};

	var selectPanel = function(diseaseStage) {
		//move to top left..
		showPanel(diseaseStage,'top-left-panel',false);

		switchToThreePanelLayout();

		addActionPlanPanel('bottom-left-panel');
	};

	var populatePatientPanel = function (id, sortField, sortAsc) {
		patientId = id;
		var template = $('#patient-list').html();
		Mustache.parse(template);   // optional, speeds up future uses

		var patients = bb.data[bb.pathway].items[id].patients.map(function(nhs) {
			var ret = bb.data[bb.pathway].patients[nhs];
			ret.nhs = nhs;
			if(ret.bp) {
				ret.sbp = ret.bp[1][ret.bp[1].length-1];
			} else {
				ret.sbp = "?";
			}
			return ret;
		});

		var data = {"patients": patients};

		if(sortField) {
			data.patients.sort(function(a, b){
				if(a[sortField] === b[sortField]) {
					return 0;
				}

				if(a[sortField] == "?") return 1;
				if(b[sortField] == "?") return -1;

				if(a[sortField] > b[sortField]) {
					return sortAsc ? 1 : -1;
				} else if (a[sortField] < b[sortField]) {
					return sortAsc ? -1 : 1;
				}
			});

			data.direction = sortAsc ? "sort-asc" : "sort-desc";
			data.isSorted = sortAsc;
		}


		var rendered = Mustache.render(template, data);
		$('#patients').html(rendered);
		$('#patients-placeholder').hide();

		//Wire up copy paste
		ZeroClipboard.destroy(); //tidy up
		var client = new ZeroClipboard( $('.btn-copy') );

		client.on( 'ready', function(event) {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
			});
		});
	};

	var populateSuggestedActionsPanel = function (id){
		if(bb.selected==="Exclusions"){
			$('#sap').html('No team actions for excluded patients');
			$('#sap-placeholder').hide();
			$('#team-footer').hide();
		} else {
			var template = $('#sap-template').html();
			var checkbox = $('#checkbox-template').html();
			Mustache.parse(template);   // optional, speeds up future uses
			if(!bb.data[bb.pathway].items[id].index){
				bb.data[bb.pathway].items[id].index = function(){
					return ++window.INDEX||(window.INDEX=0);
				};
				bb.data[bb.pathway].items[id].lastIndex = function(){
					return window.INDEX;
				};
				bb.data[bb.pathway].items[id].resetIndex = function(){
					window.INDEX=null;
					return;
				};
			}
			var rendered = Mustache.render(template, bb.data[bb.pathway].items[id], {"chk" : checkbox });
			$('#sap').html(rendered);
			$('#sap-placeholder').hide();

			displayPersonalisedActionPlan(id, $('#tab-sap-team .panel-footer'), true, false);

			updateCheckboxes(id);
		}
	};

	var populateBreakdownTable = function(id){
		var template = $('#breakdown-table-template').html();
		var data = bb.data[bb.pathway].all[id.toLowerCase()];
		for(var i = 0 ; i< data.items.length; i++){
			data.items[i].color = bb['breakdown-chart'].color(data.items[i].name);
		}
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template, data);
		$('#breakdown-table').html(rendered).show();
	};

	var highlightOnHoverAndEnableSelectByClick = function(id) {
		$('#'+id+'>div').on('mouseover',function(){
			$(this).addClass('panel-primary').removeClass('panel-default');
			
			var pathwayStage = $(this).data('stage');
			
			//Make the icon grow
			$('.cd-timeline-block span[data-stage=' + pathwayStage + ']').addClass('fa-3x');
		}).on('mouseout',function(){
			$(this).removeClass('panel-primary').addClass('panel-default');
			
			var pathwayStage = $(this).data('stage');
			
			//Make the icon shrink
			if(!$('.cd-timeline-block span[data-stage=' + pathwayStage + ']').data('selected')) $('.cd-timeline-block span[data-stage=' + pathwayStage + ']').removeClass('fa-3x');
		}).on('click', function(){
			hideAllPanels();

			var pathwayStage = $(this).data('stage');

			selectPanel(pathwayStage);

			addBreakdownPanel(bb.categories[pathwayStage].d1, bb.categories[pathwayStage].d2);
			
			//Unselect all other pathway nodes and keep this one enlarged
			$('.cd-timeline-block span').data('selected', false).removeClass('fa-3x');
			$('.cd-timeline-block span[data-stage=' + pathwayStage + ']').data('selected',true).addClass('fa-3x');
		});
	};

	/********************************
	* Charts - draw
	********************************/
	var drawBpTrendChart = function(nhs){
		destroyCharts(['chart-demo-trend']);
		if(!bb.data[bb.pathway].patients || !bb.data[bb.pathway].patients[nhs] || !bb.data[bb.pathway].patients[nhs].bp) return;
		
		var chartOptions = {
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: bb.data[bb.pathway].patients[nhs].bp
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d'
					}
				}
			}
		};
		
		if(bb.data[bb.pathway].patients[nhs].contacts){
			chartOptions.grid = {
				x: {
					lines: bb.data[bb.pathway].patients[nhs].contacts
				}
			};
		}

		bb['chart-demo-trend'] = c3.generate(chartOptions);
	};

	var drawContactChart = function(nhs){
		destroyCharts(['chart-demo-trend']);
		if(!bb.data[bb.pathway].patients || !bb.data[bb.pathway].patients[nhs] || !bb.data[bb.pathway].patients[nhs].contact) return;
		bb['chart-demo-trend'] = c3.generate({
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: bb.data[bb.pathway].patients[nhs].contact,
				type:'bar',
			},
			tooltip: {
				grouped: false,
			  //contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
				//return defaultTitleFormat;//... // formatted html as you want
			  //},
			  format: {
			value: function (value, ratio, id, index) { return ""; }
		  }
			},
			bar: {
				width: 10
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d',
						count: 7,
						culling: {
							max: 4
						}
					}
				},
				y: {
					show:false
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
	
	var showOverview = function(){
	
		//Unselect all nodes on pathway
		$('.cd-timeline-block span').data('selected', false).removeClass('fa-3x');
			
		switchToFourPanelLayout();
		
		hideAllPanels();
		
		updateBreadcrumbs([bb.pathway]);
		
		showMonitoringPanel('top-left-panel', true);
		showTreatmentPanel('top-right-panel', true);
		showDiagnosisPanel('bottom-left-panel', true);
		showExclusionsPanel('bottom-right-panel', true);
	};
	
	var updateCheckboxes = function(id){
		var current = getObj();
		
		$('#sap').find('input[type=checkbox]').each(function(i){
			if(current.actions && current.actions[id] && current.actions[id].done.length>i && current.actions[id].done[i]){
				$(this).prop('checked', true);
			}
		});
		
		$('#sap').find('input[type=radio]').each(function(i){
			i = Math.floor(i/2);
			if(current.actions && current.actions[id] && current.actions[id].agree.length>i){
				if(current.actions[id].agree[i]===true && this.value==="yes"){
					$(this).prop('checked', true);
					$(this).parent().addClass('active');
				} else if(current.actions[id].agree[i]===false && this.value==="no"){
					$(this).prop('checked', true);
					$(this).parent().addClass('active');
				}
			}
		});
		
		$('#advice-list').find('input[type=checkbox]').each(function(i){
			if(current.actions && current.actions[id] && current.actions[id].done.length>i && current.actions[id].done[i]){
				$(this).prop('checked', true);
			}
		});
		
		$('#advice-list').find('input[type=radio]').each(function(i){
			i = Math.floor(i/2);
			if(current.actions && current.actions[id] && current.actions[id].agree.length>i){
				if(current.actions[id].agree[i]===true && this.value==="yes"){
					$(this).prop('checked', true);
					$(this).parent().addClass('active');
				} else if(current.actions[id].agree[i]===false && this.value==="no"){
					$(this).prop('checked', true);
					$(this).parent().addClass('active');
				}
			}
		});
		
		updateSapRows();
	};
	
	var updateSapRows = function(){
		$('#sap .suggestion,#advice-list .suggestion').each(function(i){
			$(this).find('td').last().children().hide();
		});
	
		$('#sap,#advice-list').find('input[type=checkbox]').each(function(i){
			if(this.checked){
				$(this).parent().parent().parent().addClass('success');				
			} else {
				$(this).parent().parent().parent().removeClass('success');
			}
		});		
		
		$('#sap,#advice-list').find('input[type=radio]:checked').each(function(i){
			if(this.value==="yes"){
				$(this).parent().parent().parent().parent().removeClass('danger');
				$(this).parent().parent().parent().parent().find('td').last().children().show();
			} else {
				$(this).parent().parent().parent().parent().addClass('danger');
			}
		});
	};
	
	var populateIndividualSuggestedActions = function (nhs) {
		var examples = [["Increase ramipril by 2.5mg","Increase amlodipine by 5mg","Start a diuretic"],
						  ["Increase losartan by 25mg","Increase bisoprolol by 2.5mg","Start a calcium channel blocker"],
						  ["Refer to secondary care"]];
		var data = {"nhs" : nhs};
		
		if(bb.selected && bb.selected === "Uncontrolled"){
			var r = Math.floor(Math.random()*3);
			data.hasActions = true;
			data.actions = examples[r];
		} else if (bb.selected && bb.selected === "Exclusions" && bb.subselected){
			data.isExclusion = true;
			data.exclusionReason = bb.data[bb.pathway].items[bb.subselected].desc;

			if(bb.subselected!="Exclusion code") {
			  data.isReadCode = true;
			}
		}
		
		if(!data.index){
			data.index = function(){
				return ++window.INDEX||(window.INDEX=0);
			};
			data.lastIndex = function(){
				return window.INDEX;
			};
			data.resetIndex = function(){
				window.INDEX=null;
				return;
			};
		}
		
		var template = $('#individual-panel').html();
		var checkbox = $('#checkbox-template').html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template, data, {"chk" : checkbox });
		
		$('#advice-placeholder').hide();
		$('#advice').show();
		$('#advice-list').html(rendered).show();
		
		var client = new ZeroClipboard( $('#code-clip') );
		
		client.on( 'ready', function(event) {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
			});
		});
		
		updateCheckboxes(nhs);
		
		addTrendPanel('patient-info');
		if(bb.selected && bb.selected === "Uncontrolled"){
			drawBpTrendChart(nhs);
		} else if(bb.selected && bb.selected === "Unmeasured"){
			drawContactChart(nhs);
		} else if(bb.selected && bb.selected === "Exclusions"){
		}
		
		displayPersonalisedActionPlan(nhs,$('#tab-sap-individual .panel-footer'), false, false);
	};
	
	var displayPersonalisedActionPlan = function(id, parentElem, isTeam, isEditable) {
		var plans = getObj().plans;
		
		var plan = "";
		
		if(isTeam && id) {
			if(plans.team[id]) plan = plans.team[id];
		} else if(!isTeam && id) {
			if(plans.individual[id]) plan = plans.individual[id];
		}
		
		if(plan === "") isEditable = true;
	
		var template = $('#action-plan' + (isEditable ? "" : "-display")).html();
		Mustache.parse(template);   // optional, speeds up future uses
		var rendered = Mustache.render(template, {"plan" : plan});
		parentElem.html(rendered).show();
	};
	
	var displaySelectedPatient = function(id){
		//find patient - throw error if not exists
		
		//if screen not in correct segment then select it
		if(bb.page !== 'main-dashboard'){
			$('.page').hide();
			$('#main-dashboard').show();
		
			showSidePanel();
			showOverview();
	
			addPatientPanel('right-panel');
		}
		
		var pathwayStage = bb.data[bb.pathway].patients[id].pathwayStage;
		var subsection = bb.data[bb.pathway].patients[id].subsection;

		//select patient
		selectPanel(pathwayStage);
		
		addBreakdownPanel(bb.categories[pathwayStage].d1, bb.categories[pathwayStage].d2);
		
		populatePatientPanel(subsection);
		populateSuggestedActionsPanel(subsection);
		bb.subselected = subsection;
		$('#breakdown-table tr').removeClass('selected');
		$('#row-' + subsection.toLowerCase().substr(0,4)).addClass('selected');		
		
		setTimeout(function(){ return selectPieSlice('breakdown-chart', subsection);},500);
				
		$('.list-item').removeClass('highlighted');
		$('.list-item:has(button[data-clipboard-text=' + id +'])').addClass('highlighted');
		$('#demographic-placeholder').hide();

		drawBpTrendChart(id);
		bb.nhs = id;

		$('a[href=#tab-sap-individual]').tab('show');

		populateIndividualSuggestedActions(id);
		
		//Unselect all other pathway nodes and keep this one enlarged
		$('.cd-timeline-block span').data('selected', false).removeClass('fa-3x');
		$('.cd-timeline-block span[data-stage=' + pathwayStage + ']').data('selected',true).addClass('fa-3x');
	};
	
	var showPage = function (page) {
		bb.page = page;
		$('.page').hide();
		$('#' + page).show();

		if (page === 'main-dashboard') {		
			showSidePanel();
			showOverview();
	
			addPatientPanel('right-panel');
		} else {	
			hideSidePanel();
		}
	};
	
	var getObj = function(){
		return JSON.parse(localStorage.bb);
	};
	
	var setObj = function(obj){
		localStorage.bb = JSON.stringify(obj);
	};
	
	var exportPlan = function(){
		var doc = new jsPDF(), margin = 20, verticalOffset = margin;
			
		var addHeading = function(text, size){
			if(verticalOffset > 270) {
				doc.addPage();
				verticalOffset = margin;
			}
			doc.setFontSize(size).text(margin, verticalOffset+10, text);
			verticalOffset+=15;
		};
		
		var addLine = function(text){
			var lines = doc.setFontSize(11).splitTextToSize(text, 170);
			if(verticalOffset +lines.length*10 > 280) {
				doc.addPage();
				verticalOffset = margin;
			}
			doc.text(margin, verticalOffset+5, lines);
			verticalOffset+=lines.length*7;
		};
		
		//create doctype
		var data = getObj(),i=0,j=0,mainId,suggs;		
			
	
		addHeading("Action Plan",24);
		//Measured
		addHeading("Measured",20);
		
		var internalFunc = function(el) {
			if(data.plans.individual[el]) {
				addLine("Patient "+ el +":" +data.plans.individual[el]);
			}
		};
		for(i=0; i< bb.data[bb.pathway].Measured.breakdown.length; i++){
			mainId = bb.data[bb.pathway].Measured.breakdown[i][0];
			addHeading(mainId, 18);
			addLine(bb.data[bb.pathway].items[mainId].main);
			
			suggs = bb.data[bb.pathway].items[mainId].suggestions;
			addHeading("Actions", 18);
			for(j = 0; j < suggs.length; j++){
				if(data.actions[mainId] && data.actions[mainId].done && data.actions[mainId].done.length>j && data.actions[mainId].done[j]) {
					//Completed so ignore
				} else if(data.actions[mainId] && data.actions[mainId].agree && data.actions[mainId].agree.length>j && data.actions[mainId].agree[j]) {
					addLine(suggs[j].text);
				}					
			}				
			
			if(data.plans.team[mainId]) {
				addHeading("Custom team plan",14);
				addLine(data.plans.team[mainId]);
			}
			
			addHeading("Custom individual plans",14);
			bb.data[bb.pathway].items[mainId].patients.forEach(internalFunc);
		}
		
		for(i=0; i< bb.data[bb.pathway].Controlled.breakdown.length; i++){
			mainId = bb.data[bb.pathway].Controlled.breakdown[i][0];
			addHeading(mainId, 18);
			addLine(bb.data[bb.pathway].items[mainId].main);
			
			suggs = bb.data[bb.pathway].items[mainId].suggestions;
			addHeading("Actions", 18);
			for(j = 0; j < suggs.length; j++){
				if(data.actions[mainId] && data.actions[mainId].done && data.actions[mainId].done.length>j && data.actions[mainId].done[j]) {
					//Completed so ignore
				} else if(data.actions[mainId] && data.actions[mainId].agree && data.actions[mainId].agree.length>j && data.actions[mainId].agree[j]) {
					addLine(suggs[j].text);
				}					
			}	
			
			if(data.plans.team[mainId]) {
				addHeading("Team plan",14);
				addLine(data.plans.team[mainId]);
			}
			
			addHeading("Individuals",14);
			bb.data[bb.pathway].items[mainId].patients.forEach(internalFunc);
		}
		
		//Actions they agree with
		
		//Personalised team actions
		for(i = 0; i < data.plans.team.length; i++){
		}
		
		//Personalised individual actions
		for(i = 0; i < data.plans.individual.length; i++){
		}
		
		//trigger download
		doc.save();
	};
	 
	var onSelected = function($e, patientId) {
		$('#search-box .tt-dropdown-menu').css('display', 'none');
		
		displaySelectedPatient(patientId.value);
	};

	bb.wireUpPages = function () {
		showPage('login');

		$('#topnavbar').on('click', 'a', function () {
			$("#navbar > .nav").find(".active").removeClass("active");
			$(this).parent().addClass("active");
			if (this.href.split('#')[1] === 'help') { showPage('help-page'); } 
			else showPage('main-dashboard');
		});
		
		$('#enter-button').on('click', function (e) {
			showPage('main-dashboard');
			$("#navbar > .nav").find(".active").removeClass("active");
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
	
		$('#breadcrumb').on('click', 'a', function(e){
			showOverview();
			e.preventDefault();
		});	
		
		//Wire up the pathway in the side panel
		$('.cd-timeline-block span').on('mouseover',function(){
			//Make the icon grow
			$(this).addClass('fa-3x');
			//highlight the appropriate panel
			$('div[data-stage=' + $(this).data('stage') +']').addClass('panel-primary').removeClass('panel-default'); 
		}).on('mouseout',function(){
			//Make the icon shrink
			if(!$(this).data('selected')) $(this).removeClass('fa-3x');
			//un-highlight the appropriate panel
			$('div[data-stage=' + $(this).data('stage') +']').removeClass('panel-primary').addClass('panel-default');
		}).on('click', function() {
			hideAllPanels();

			//Unselect all other nodes and keep this one enlarged
			var pathwayStage = $(this).data('stage');			
			$('.cd-timeline-block span').data('selected', false).removeClass('fa-3x');
			$(this).data('selected',true).addClass('fa-3x');

			selectPanel(pathwayStage);

			addBreakdownPanel(bb.categories[pathwayStage].d1, bb.categories[pathwayStage].d2);
		});
		
		$('#selectBP').on('click', function(){			
			showOverview();
		});
		
		/**********************************
		 ** Patient search auto complete ** 
		 **********************************/
		var states = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: $.map(bb.data[bb.pathway].patientArray, function(state) { return { value: state }; })
		});

		states.initialize();

		$('#search-box .typeahead').typeahead(
			{hint: true, highlight: true, minLength: 2},
			{name: 'patients', displayKey: 'value', source: states.ttAdapter()}
		).on('typeahead:selected', onSelected)
		.on('typeahead:autocompleted', onSelected);
	};

	bb.loadData = function(callback) {
		$.getJSON("data.json", function(file) {
			var d="", i=0, j=0, k=0;
			var data = file.data;
			bb.trend = file.trend;
			bb.data={};
			for(i = 0 ; i < data.length; i++){
				d = data[i].disease;
				bb.data[d] = {"all" : data[i], "ids" : {}, "patients" : data[i].patients, "items" : {}, "Measured" : {"breakdown":[]}, "Controlled": {"breakdown":[]}, "Exclusions": {"breakdown":[]}};
				bb.data[d].patientArray = [];
				for(var o in data[i].patients) {
					bb.data[d].patientArray.push(o);
				}
				bb.data[d].Measured.main = [['Unmeasured', bb.data[d].all.unmeasured.n],['Measured', bb.data[d].all.measured.n],['Exclusions', bb.data[d].all.exclusions.n]];
				bb.data[d].Controlled.main = [['Uncontrolled', bb.data[d].all.uncontrolled.n],['Controlled', bb.data[d].all.controlled.n]	,['Exclusions', bb.data[d].all.exclusions.n]];
				
				for(j=0; j < bb.data[d].all.unmeasured.items.length; j++) {
					bb.data[d].Measured.breakdown.push([bb.data[d].all.unmeasured.items[j].name, bb.data[d].all.unmeasured.items[j].n]);
					bb.data[d].items[bb.data[d].all.unmeasured.items[j].name] = bb.data[d].all.unmeasured.items[j];
					bb.data[d].ids[bb.data[d].all.unmeasured.items[j].id] = bb.data[d].all.unmeasured.items[j].name;
					for(k=0; k < bb.data[d].all.unmeasured.items[j].patients.length; k++) {
						bb.data[d].patients[bb.data[d].all.unmeasured.items[j].patients[k]].pathwayStage = "monitoring";
						bb.data[d].patients[bb.data[d].all.unmeasured.items[j].patients[k]].subsection = bb.data[d].all.unmeasured.items[j].name;
					}
				}
				for(j=0; j < bb.data[d].all.uncontrolled.items.length; j++) {
					bb.data[d].Controlled.breakdown.push([bb.data[d].all.uncontrolled.items[j].name, bb.data[d].all.uncontrolled.items[j].n]);
					bb.data[d].items[bb.data[d].all.uncontrolled.items[j].name] = bb.data[d].all.uncontrolled.items[j];
					bb.data[d].ids[bb.data[d].all.uncontrolled.items[j].id] = bb.data[d].all.uncontrolled.items[j].name;
					for(k=0; k < bb.data[d].all.uncontrolled.items[j].patients.length; k++) {
						bb.data[d].patients[bb.data[d].all.uncontrolled.items[j].patients[k]].pathwayStage = "treatment";
						bb.data[d].patients[bb.data[d].all.uncontrolled.items[j].patients[k]].subsection = bb.data[d].all.uncontrolled.items[j].name;
					}
				}
				for(j=0; j < bb.data[d].all.exclusions.items.length; j++) {
					bb.data[d].Exclusions.breakdown.push([bb.data[d].all.exclusions.items[j].name, bb.data[d].all.exclusions.items[j].n]);
					bb.data[d].items[bb.data[d].all.exclusions.items[j].name] = bb.data[d].all.exclusions.items[j];
					bb.data[d].ids[bb.data[d].all.exclusions.items[j].id] = bb.data[d].all.exclusions.items[j].name;
					for(k=0; k < bb.data[d].all.exclusions.items[j].patients.length; k++) {
						bb.data[d].patients[bb.data[d].all.exclusions.items[j].patients[k]].pathwayStage = "exclusions";
						bb.data[d].patients[bb.data[d].all.exclusions.items[j].patients[k]].subsection = bb.data[d].all.exclusions.items[j].name;
					}
				}
			}
			
			callback();
		});
	};
	
	window.bb = bb;
})();

/********************************************************
*** Shows the pre-load image and slowly fades it out. ***
********************************************************/
$(window).load(function() {
  $('.loading-container').fadeOut(1000, function() {
	$(this).remove();
  });
});	

/******************************************
*** This happens when the page is ready ***
******************************************/
$(document).on('ready', function () {
	//Load the data then wire up the events on the page
	bb.loadData(bb.wireUpPages);
	
	//Sorts out the data held locally in the user's browser
	if(!localStorage.bb) localStorage.bb = JSON.stringify({});
	var obj = JSON.parse(localStorage.bb);
	if(!obj.actions) {
		obj.actions = {"Direct": {"agree": [],"done": [true,false]},"Indirect": {"agree": [],"done": [false,false,false,true]},"Nil": {"agree": [],"done": [false,false,false,false]},"Recently Changed Rx": {"agree": [],"done": [true,false,false]},"Suboptimal Rx": {"agree": [],"done": [false,true,false]},"Recently Measured": {"agree": [],"done": [true,false]}};
		localStorage.bb = JSON.stringify(obj);
	}
	if(!obj.plans) {
		obj.plans = {"team":{}, "individual":{}};
		localStorage.bb = JSON.stringify(obj);
	}
	
	$('[data-toggle="tooltip"]').tooltip();
});