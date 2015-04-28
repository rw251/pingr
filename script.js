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

	/*******************************
	 *** Define local properties ***
	 *******************************/
	var local= {
		"charts" : {},
		"data" : {},
		"categories" : {
			"diagnosis": {"name": "diagnosis", "d1": "Diagnosed", "d2": "Diagnosed"},
			"monitoring": {"name": "monitoring", "d1": "Measured", "d2": "Unmeasured"},
			"treatment": {"name": "treatment", "d1": "Controlled", "d2": "Uncontrolled"},
			"exclusions": {"name": "exclusions", "d1": "Exclusions", "d2": "Exclusions"}
		},
		"page" : "",
		"pathway" : "Blood Pressure"
	};

	var bottomLeftPanel, bottomRightPanel, topLeftPanel, topRightPanel, farRightPanel, monitoringPanel, treatmentPanel,
		diagnosisPanel,	exclusionPanel, patientsPanelTemplate, breakdownPanel, actionPlanPanel, patientList, sapTemplate,
		breakdownTableTemplate,	individualPanel, bpTrendPanel, actionPlan, actionPlanDisplay, patientsPanel,
		suggestedActionPlan, adviceList, breakdownTable, patientInfo, teamTab, individualTab, cdTimeLineBlock;

	/**************
	 *** Layout ***
	 **************/

	var switchToFourPanelLayout = function(){
		bottomLeftPanel.removeClass('col-sm-12').addClass('col-sm-6');
		bottomRightPanel.addClass('col-sm-6').show();
	};

	var switchToThreePanelLayout = function(){
		bottomLeftPanel.addClass('col-sm-12').removeClass('col-sm-6');
		bottomRightPanel.removeClass('col-sm-6').hide();
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
		if(suggestedActionPlan) suggestedActionPlan.html('');
		$('#sap-placeholder').show();
		$('#advice').html('');
		$('#advice-placeholder').show();
		$('#individual-footer').hide();
		$('#team-footer').hide();
		if(patientsPanel) patientsPanel.html('');
		$('#patients-placeholder').show();
		$('#demographic-placeholder').show();
	};

	var createPanel = function(templateSelector, panelSelector, data, templates){
		var template = templateSelector.html();
		Mustache.parse(template);   // optional, speeds up future uses
		if(templates) {
			for(var o in templates) {
				if(templates.hasOwnProperty(o))	{
					Mustache.parse(templates[o]);
				}
			}
		}
		var rendered = Mustache.render(template, data, templates);
		panelSelector.html(rendered).show();
	};

	var showPanel = function(pathwayStage, location, enableHover) {
		if(pathwayStage === local.categories.monitoring.name) showMonitoringPanel(location);
		if(pathwayStage === local.categories.treatment.name) showTreatmentPanel(location);
		if(pathwayStage === local.categories.diagnosis.name) showDiagnosisPanel(location);
		if(pathwayStage === local.categories.exclusions.name) showExclusionsPanel(location);

		if(enableHover) highlightOnHoverAndEnableSelectByClick(location);
	};

	var showMonitoringPanel = function(location) {
		createPanel(monitoringPanel, location, {
			percent: local.data[local.pathway].all.monitoring.trend[1][1],
			percentChange: Math.abs(local.data[local.pathway].all.monitoring.trend[1][1]-local.data[local.pathway].all.monitoring.trend[1][30]),
			percentUp: local.data[local.pathway].all.monitoring.trend[1][1]-local.data[local.pathway].all.monitoring.trend[1][30]>=0,
			number: local.data[local.pathway].all.monitoring.trend[2][1],
			numberUp: local.data[local.pathway].all.monitoring.trend[2][1]-local.data[local.pathway].all.monitoring.trend[2][30]>=0,
			numberChange: Math.abs(local.data[local.pathway].all.monitoring.trend[2][1]-local.data[local.pathway].all.monitoring.trend[2][30])
			}, {"change-bar": $('#change-bar').html()}
		);

		destroyCharts(['monitoring-chart']);
		local.charts["monitoring-chart"] = c3.generate({
			bindto: '#monitoring-chart',
			data: {
				x: 'x',
				columns: local.data[local.pathway].all.monitoring.trend,
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

	var showTreatmentPanel = function(location) {
		createPanel(treatmentPanel, location, {
			percent: local.data[local.pathway].all.treatment.trend[1][1],
			percentChange: Math.abs(local.data[local.pathway].all.treatment.trend[1][1]-local.data[local.pathway].all.treatment.trend[1][30]),
			percentUp: local.data[local.pathway].all.treatment.trend[1][1]-local.data[local.pathway].all.treatment.trend[1][30]>=0,
			number: local.data[local.pathway].all.treatment.trend[2][1],
			numberUp: local.data[local.pathway].all.treatment.trend[2][1]-local.data[local.pathway].all.treatment.trend[2][30]>=0,
			numberChange: Math.abs(local.data[local.pathway].all.treatment.trend[2][1]-local.data[local.pathway].all.treatment.trend[2][30])
			}, {"change-bar": $('#change-bar').html()}
		);

		destroyCharts(['treatment-chart']);
		local.charts["treatment-chart"] = c3.generate({
			bindto: '#treatment-chart',
			data: {
				x: 'x',
				columns: local.data[local.pathway].all.treatment.trend,
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

	var showDiagnosisPanel = function(location) {
		createPanel(diagnosisPanel, location);

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

	var showExclusionsPanel = function(location) {
		createPanel(exclusionPanel, location);

		c3.generate({
			bindto: '#exclusion-chart',
			data: {
				columns: [
					['data1', 122, 78]
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
					categories: ['Reasons we think', 'Exclusion code']
				}
			}
		});
	};

	var addPatientPanel = function(location) {
		createPanel(patientsPanelTemplate,location);

		patientsPanel = $('#patients');

		patientsPanel.on('click', 'thead tr th.sortable', function(){	//Sort columns when column header clicked
			var sortAsc = !$(this).hasClass('sort-asc');
			if(sortAsc) {
				$(this).removeClass('sort-desc').addClass('sort-asc');
			} else {
				$(this).removeClass('sort-asc').addClass('sort-desc');
			}
			populatePatientPanel(local.subselected, $(this).text().substr(0,1) === "L" ? "sbp" : "nhsNumber", sortAsc);
		}).on('click', 'tbody tr', function(e){	//Select individual patient when row clicked
			$('.list-item').removeClass('highlighted');
			$(this).addClass('highlighted');

			var nhsNumber = $(this).find('td button').attr('data-clipboard-text');
			$('#demographic-placeholder').hide();

			drawBpTrendChart(nhsNumber);
			local.nhsNumber = nhsNumber;

			$('a[href=#tab-sap-individual]').tab('show');

			populateIndividualSuggestedActions(nhsNumber);

			e.preventDefault();
		}).on('click', 'tbody tr button', function(e){
			//don't want row selected if just button pressed?
			e.preventDefault();
			e.stopPropagation();
		}).niceScroll({
			cursoropacitymin: 0.3,
			cursorwidth: "7px",
			horizrailenabled: false
		});
	};

	var addBreakdownPanel = function (type, id, pathwayStage){
		local.selected = id;

		createPanel(breakdownPanel, topRightPanel,{"header": local.data[local.pathway][type] ? local.data[local.pathway][type].header : ""});

		breakdownTable = $('#breakdown-table');

		topRightPanel.off('click','.panel-body');
		topRightPanel.on('click', '.panel-body', function(){
			if(!local.chartClicked){
				$('path.c3-arc').attr('class', function(index, classNames) {
					return classNames.replace(/_unselected_/g, '');
				});
				if(local.charts['breakdown-chart']) local.charts['breakdown-chart'].unselect();

				hideAllPanels();
			}
			local.chartClicked=false;
		});

		breakdownTable.on('mouseout', 'tr', function(){
			if($(this).find('th').length>0) return; //ignore header row
			local.charts['breakdown-chart'].focus();
		}).on('mouseover', 'tr', function(){
			if($(this).find('th').length>0) return; //ignore header row
			local.charts['breakdown-chart'].focus($(this).data('subsection'));
		}).on('click', 'tr', function(){
			if($(this).find('th').length>0) return; //ignore header row
			var subselected = $(this).data('subsection');
			selectPieSlice('breakdown-chart', subselected);
			populatePatientPanel(subselected);
			populateSuggestedActionsPanel(subselected);
			local.subselected = subselected;
			breakdownTable.find('tr').removeClass('selected');
			$(this).addClass('selected');
		});

		destroyCharts(['breakdown-chart']);

		local.charts['breakdown-chart'] = c3.generate({
			bindto: '#breakdown-chart',
			tooltip: {
				format: {
					value: function (value, ratio) { //function(value, ratio, id, index) {
						return value + ' (' + (ratio * 100).toFixed(2) + '%)';
					}
				}
			},
			data: {
				columns: local.data[local.pathway][type].breakdown,
				type: 'pie',
				selection: { enabled: true },
				order: null,
				onclick: function (d) {
					selectPieSlice('breakdown-chart', d.id);
					populatePatientPanel(d.id);
					populateSuggestedActionsPanel(d.id);
					breakdownTable.find('tr').removeClass('selected');
					breakdownTable.find('tr[data-subsection="' + local.data[local.pathway].items[d.id].name + '"]').addClass('selected');
					$('a[href=#tab-sap-team]').tab('show');
					local.subselected = d.id;
				},
				onmouseover: function(d){
					breakdownTable.find('tr').removeClass('tr-hovered');
					breakdownTable.find('tr[data-subsection="' + local.data[local.pathway].items[d.id].name + '"]').addClass('tr-hovered');
				},
				onmouseout: function (){
					breakdownTable.find('tr').removeClass('tr-hovered');
				}
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
			}
		});

		populateBreakdownTable(pathwayStage);
	};

	var addActionPlanPanel = function(location) {
		createPanel(actionPlanPanel,location);

		suggestedActionPlan = $('#sap');
		adviceList = $('#advice-list');
		patientInfo = $('#patient-info');
		teamTab = $('#tab-sap-team');
		individualTab = $('#tab-sap-individual');

		$('#export-plan').on('click', exportPlan);

		$('#action-plan-tabs').find('a').click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});

		suggestedActionPlan.on('click', 'input[type=checkbox]', function(){
			var idx = suggestedActionPlan.find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.subselected]) current.actions[local.subselected] = {"agree":[],"done":[]};
			while(current.actions[local.subselected].done.length<=idx){
				current.actions[local.subselected].done.push(false);
			}
			current.actions[local.subselected].done[idx]=this.checked;
			setObj(current);
			updateSapRows();
		});

		adviceList.on('click', 'input[type=checkbox]', function(){
			var idx = adviceList.find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.nhsNumber]) current.actions[local.nhsNumber] = {"agree":[],"done":[]};
			while(current.actions[local.nhsNumber].done.length<=idx){
				current.actions[local.nhsNumber].done.push(false);
			}
			current.actions[local.nhsNumber].done[idx]=this.checked;
			setObj(current);
			updateSapRows();
		});

		teamTab.on('click', '.edit-plan', function(){
			displayPersonalisedActionPlan(local.subselected, teamTab.find('.panel-footer'), true, true);
		}).on('click', '.add-plan', function(){
			var obj = getObj();
			obj.plans.team[local.subselected] = teamTab.find('textarea').val();
			setObj(obj);

			displayPersonalisedActionPlan(local.subselected, teamTab.find('.panel-footer'), true, false);
		}).on('change', 'input[type=radio]', function(){
			var idx = Math.floor(suggestedActionPlan.find('input[type=radio]').index(this)/2);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.subselected]) current.actions[local.subselected] = {"agree":[],"done":[]};
			while(current.actions[local.subselected].agree.length<=idx){
				current.actions[local.subselected].agree.push("");
			}
			current.actions[local.subselected].agree[idx]=this.value==="yes";
			setObj(current);

			updateSapRows();
		});

		individualTab.on('click', '.edit-plan', function(){
			displayPersonalisedActionPlan(local.nhsNumber, individualTab.find('.panel-footer'), false, true);
		}).on('click', '.add-plan', function(){
			var obj = getObj();
			obj.plans.individual[local.nhsNumber] = individualTab.find('textarea').val();
			setObj(obj);

			displayPersonalisedActionPlan(local.nhsNumber, individualTab.find('.panel-footer'), false, false);
		}).on('change', 'input[type=radio]', function(){
			var idx = Math.floor(adviceList.find('input[type=radio]').index(this)/2);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.nhsNumber]) current.actions[local.nhsNumber] = {"agree":[],"done":[]};
			while(current.actions[local.nhsNumber].agree.length<=idx){
				current.actions[local.nhsNumber].agree.push("");
			}
			current.actions[local.nhsNumber].agree[idx]=this.value==="yes";
			setObj(current);

			updateSapRows();
		});
	};

	var selectPanel = function(pathwayStage) {
		//move to top left..
		showPanel(pathwayStage, topLeftPanel, false);

		switchToThreePanelLayout();

		addActionPlanPanel(bottomLeftPanel);

		updateBreadcrumbs([local.pathway, local.categories[pathwayStage].d1]);
	};

	var populatePatientPanel = function (id, sortField, sortAsc) {
		var patients = local.data[local.pathway].items[id].patients.map(function(nhsNumber) {
			var ret = local.data[local.pathway].patients[nhsNumber];
			ret.nhsNumber = nhsNumber;
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

		createPanel(patientList, patientsPanel, data);

		$('#patients-placeholder').hide();

		//Wire up copy paste
		ZeroClipboard.destroy(); //tidy up
		var client = new ZeroClipboard( $('.btn-copy') );

		client.on( 'ready', function() {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
			});
		});
	};

	var populateSuggestedActionsPanel = function (id){
		if(local.selected==="Exclusions"){
			suggestedActionPlan.html('No team actions for excluded patients');
			$('#sap-placeholder').hide();
			$('#team-footer').hide();
		} else {
			if(!local.data[local.pathway].items[id].index){
				local.data[local.pathway].items[id].index = function(){
					return ++window.INDEX||(window.INDEX=0);
				};
				local.data[local.pathway].items[id].lastIndex = function(){
					return window.INDEX;
				};
				local.data[local.pathway].items[id].resetIndex = function(){
					window.INDEX=null;
				};
			}

			createPanel(sapTemplate, suggestedActionPlan, local.data[local.pathway].items[id], {"chk" : $('#checkbox-template').html() });

			$('#sap-placeholder').hide();

			displayPersonalisedActionPlan(id, teamTab.find('.panel-footer'), true, false);

			updateCheckboxes(id);
		}
	};

	var populateBreakdownTable = function(id){
		var data = local.data[local.pathway].all[id.toLowerCase()];
		for(var i = 0 ; i< data.items.length; i++){
			data.items[i].color = local.charts['breakdown-chart'].color(data.items[i].name);
		}
		createPanel(breakdownTableTemplate, breakdownTable, data);
	};

	var highlightOnHoverAndEnableSelectByClick = function(panelSelector) {
		panelSelector.children('div').on('mouseover',function(){
			$(this).addClass('panel-primary').removeClass('panel-default');

			var pathwayStage = $(this).data('stage');

			//Make the icon grow
			cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').addClass('fa-3x');
		}).on('mouseout',function(){
			$(this).removeClass('panel-primary').addClass('panel-default');

			var pathwayStage = $(this).data('stage');

			//Make the icon shrink
			if(!cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').data('selected')) cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').removeClass('fa-3x');
		}).on('click', function(){
			hideAllPanels();

			var pathwayStage = $(this).data('stage');

			selectPanel(pathwayStage);

			addBreakdownPanel(local.categories[pathwayStage].d1, local.categories[pathwayStage].d2, pathwayStage);

			//Unselect all other pathway nodes and keep this one enlarged
			cdTimeLineBlock.find('span').data('selected', false).removeClass('fa-3x');
			cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').data('selected',true).addClass('fa-3x');
		});
	};

	/********************************
	* Charts - draw
	********************************/
	var drawBpTrendChart = function(nhsNumber){
		destroyCharts(['chart-demo-trend']);
		if(!local.data[local.pathway].patients || !local.data[local.pathway].patients[nhsNumber] || !local.data[local.pathway].patients[nhsNumber].bp) return;

		var chartOptions = {
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: local.data[local.pathway].patients[nhsNumber].bp
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

		if(local.data[local.pathway].patients[nhsNumber].contacts){
			chartOptions.grid = {
				x: {
					lines: local.data[local.pathway].patients[nhsNumber].contacts
				}
			};
		}

		local.charts['chart-demo-trend'] = c3.generate(chartOptions);
	};

	var drawContactChart = function(nhsNumber){
		destroyCharts(['chart-demo-trend']);
		if(!local.data[local.pathway].patients || !local.data[local.pathway].patients[nhsNumber] || !local.data[local.pathway].patients[nhsNumber].contact) return;
		local.charts['chart-demo-trend'] = c3.generate({
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: local.data[local.pathway].patients[nhsNumber].contact,
				type:'bar'
			},
			tooltip: {
				grouped: false,
			  //contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
				//return defaultTitleFormat;//... // formatted html as you want
			  //},
				format: {
					value: function () { return ""; } //function (value, ratio, id, index)
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

	var selectPieSlice = function (chart, id){
		local.chartClicked=true;
		$('#' + chart + ' path.c3-arc').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
		local.charts[chart].unselect();
		local.charts[chart].select(id);
	};

	var destroyCharts = function(charts){
		for(var i = 0 ; i<charts.length; i++){
			if(local.charts[charts[i]]) {
				local.charts[charts[i]].destroy();
				delete local.charts[charts[i]];
			}
		}
	};

	var showOverview = function(){

		//Unselect all nodes on pathway
		cdTimeLineBlock.find('span').data('selected', false).removeClass('fa-3x');

		switchToFourPanelLayout();

		hideAllPanels();

		updateBreadcrumbs([local.pathway]);

		showPanel(local.categories.monitoring.name, topLeftPanel, true);
		showPanel(local.categories.treatment.name, topRightPanel, true);
		showPanel(local.categories.diagnosis.name, bottomLeftPanel, true);
		showPanel(local.categories.exclusions.name, bottomRightPanel, true);
	};

	var updateCheckboxes = function(id){
		var current = getObj();

		suggestedActionPlan.find('input[type=checkbox]').each(function(i){
			if(current.actions && current.actions[id] && current.actions[id].done.length>i && current.actions[id].done[i]){
				$(this).prop('checked', true);
			}
		});

		suggestedActionPlan.find('input[type=radio]').each(function(i){
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

		adviceList.find('input[type=checkbox]').each(function(i){
			if(current.actions && current.actions[id] && current.actions[id].done.length>i && current.actions[id].done[i]){
				$(this).prop('checked', true);
			}
		});

		adviceList.find('input[type=radio]').each(function(i){
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
		suggestedActionPlan.find('.suggestion').add(adviceList.find('.suggestion')).each(function(){
			$(this).find('td').last().children().hide();
		});

		suggestedActionPlan.add(adviceList).find('input[type=checkbox]').each(function(){
			if(this.checked){
				$(this).parent().parent().parent().addClass('success');
			} else {
				$(this).parent().parent().parent().removeClass('success');
			}
		});

		suggestedActionPlan.add(adviceList).find('input[type=radio]:checked').each(function(){
			if(this.value==="yes"){
				$(this).parent().parent().parent().parent().removeClass('danger');
				$(this).parent().parent().parent().parent().find('td').last().children().show();
			} else {
				$(this).parent().parent().parent().parent().addClass('danger');
			}
		});
	};

	var populateIndividualSuggestedActions = function (nhsNumber) {
		var examples = [["Increase ramipril by 2.5mg","Increase amlodipine by 5mg","Start a diuretic"],
						  ["Increase losartan by 25mg","Increase bisoprolol by 2.5mg","Start a calcium channel blocker"],
						  ["Refer to secondary care"]];
		var data = {"nhsNumber" : nhsNumber};

		if(local.selected && local.selected === "Uncontrolled"){
			var r = Math.floor(Math.random()*3);
			data.hasActions = true;
			data.actions = examples[r];
		} else if (local.selected && local.selected === "Exclusions" && local.subselected){
			data.isExclusion = true;
			data.exclusionReason = local.data[local.pathway].items[local.subselected].desc;

			if(local.subselected!="Exclusion code") {
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
			};
		}
		$('#advice-placeholder').hide();
		$('#advice').show();

		createPanel(individualPanel, adviceList, data, {"chk" : $('#checkbox-template').html() });

		var client = new ZeroClipboard( $('#code-clip') );

		client.on( 'ready', function() {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
			});
		});

		updateCheckboxes(nhsNumber);

		createPanel(bpTrendPanel, patientInfo);

		if(local.selected && local.selected === "Uncontrolled"){
			drawBpTrendChart(nhsNumber);
		} else if(local.selected && local.selected === "Unmeasured"){
			drawContactChart(nhsNumber);
		} else if(local.selected && local.selected === "Exclusions"){
			drawBpTrendChart(nhsNumber);
		}

		displayPersonalisedActionPlan(nhsNumber, individualTab.find('.panel-footer'), false, false);
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

		createPanel(isEditable ? actionPlan : actionPlanDisplay, parentElem, {"plan" : plan});
	};

	var displaySelectedPatient = function(id){
		//find patient - throw error if not exists

		//if screen not in correct segment then select it
		if(local.page !== 'main-dashboard'){
			$('.page').hide();
			$('#main-dashboard').show();

			showSidePanel();
			showOverview();

			addPatientPanel(farRightPanel);
		}

		var pathwayStage = local.data[local.pathway].patients[id].pathwayStage;
		var subsection = local.data[local.pathway].patients[id].subsection;

		//select patient
		selectPanel(pathwayStage);

		addBreakdownPanel(local.categories[pathwayStage].d1, local.categories[pathwayStage].d2, pathwayStage);

		populatePatientPanel(subsection);
		populateSuggestedActionsPanel(subsection);
		local.subselected = subsection;
		breakdownTable.find('tr').removeClass('selected');
		breakdownTable.find('tr[data-subsection="'+subsection+'"]').addClass('selected');

		setTimeout(function(){ return selectPieSlice('breakdown-chart', subsection);},500);

		$('.list-item').removeClass('highlighted');
		$('.list-item:has(button[data-clipboard-text=' + id +'])').addClass('highlighted');
		$('#demographic-placeholder').hide();

		drawBpTrendChart(id);
		local.nhsNumber = id;

		$('a[href=#tab-sap-individual]').tab('show');

		populateIndividualSuggestedActions(id);

		//Unselect all other pathway nodes and keep this one enlarged
		cdTimeLineBlock.find('span').data('selected', false).removeClass('fa-3x');
		cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').data('selected',true).addClass('fa-3x');
	};

	var showPage = function (page) {
		local.page = page;
		$('.page').hide();
		$('#' + page).show();

		if (page === 'main-dashboard') {
			showSidePanel();
			showOverview();

			addPatientPanel(farRightPanel);
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
		var data = getObj(),i,j,mainId,suggs;


		addHeading("Action Plan",24);
		//Measured
		addHeading("Measured",20);

		var internalFunc = function(el) {
			if(data.plans.individual[el]) {
				addLine("Patient "+ el +":" +data.plans.individual[el]);
			}
		};
		for(i=0; i< local.data[local.pathway].Measured.breakdown.length; i++){
			mainId = local.data[local.pathway].Measured.breakdown[i][0];
			addHeading(mainId, 18);
			addLine(local.data[local.pathway].items[mainId].main);

			suggs = local.data[local.pathway].items[mainId].suggestions;
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
			local.data[local.pathway].items[mainId].patients.forEach(internalFunc);
		}

		for(i=0; i< local.data[local.pathway].Controlled.breakdown.length; i++){
			mainId = local.data[local.pathway].Controlled.breakdown[i][0];
			addHeading(mainId, 18);
			addLine(local.data[local.pathway].items[mainId].main);

			suggs = local.data[local.pathway].items[mainId].suggestions;
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
			local.data[local.pathway].items[mainId].patients.forEach(internalFunc);
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

	var onSelected = function($e, nhsNumberObject) {
		//Hide the suggestions panel
		$('#search-box').find('.tt-dropdown-menu').css('display', 'none');

		//Clear the patient search box - needs a slight delay for some reason
		setTimeout(function() {$('#search-box > span > input.typeahead.tt-input, #search-box > span > input.typeahead.tt-hint').val('');},400);

		displaySelectedPatient(nhsNumberObject.value);
	};

	var wireUpPages = function () {
		showPage('login');

		//Templates
		monitoringPanel = $('#monitoring-panel');
		treatmentPanel = $('#treatment-panel');
		diagnosisPanel = $('#diagnosis-panel');
		exclusionPanel = $('#exclusion-panel');
		patientsPanelTemplate = $('#patients-panel');
		breakdownPanel = $('#breakdown-panel');
		actionPlanPanel = $('#action-plan-panel');
		patientList = $('#patient-list');
		sapTemplate = $('#sap-template');
		breakdownTableTemplate = $('#breakdown-table-template');
		individualPanel = $('#individual-panel');
		bpTrendPanel = $('#bp-trend-panel');
		actionPlan = $('#action-plan');
		actionPlanDisplay = $('#action-plan-display');

		//Selectors
		bottomLeftPanel = $('#bottom-left-panel');
		bottomRightPanel = $('#bottom-right-panel');
		topLeftPanel = $('#top-left-panel');
		topRightPanel = $('#top-right-panel');
		farRightPanel = $('#right-panel');
		cdTimeLineBlock = $('.cd-timeline-block');

		$('#topnavbar').on('click', 'a', function () {
			$('#navbar').children('.nav').find(".active").removeClass("active");
			$(this).parent().addClass("active");
			if (this.href.split('#')[1] === 'help') { showPage('help-page'); } 
			else showPage('main-dashboard');
		});
		
		$('#enter-button').on('click', function (e) {
			showPage('main-dashboard');
			$('#navbar').children('.nav').find(".active").removeClass("active");
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
		cdTimeLineBlock.find('span').on('mouseover',function(){
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
			cdTimeLineBlock.find('span').data('selected', false).removeClass('fa-3x');
			$(this).data('selected',true).addClass('fa-3x');

			selectPanel(pathwayStage);

			addBreakdownPanel(local.categories[pathwayStage].d1, local.categories[pathwayStage].d2, pathwayStage);
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
			local: $.map(local.data[local.pathway].patientArray, function(state) { return { value: state }; })
		});

		states.initialize();

		$('#search-box').find('.typeahead').typeahead(
			{hint: true, highlight: true, minLength: 2},
			{name: 'patients', displayKey: 'value', source: states.ttAdapter()}
		).on('typeahead:selected', onSelected)
		.on('typeahead:autocompleted', onSelected);
	};

	var loadData = function(callback) {
		$.getJSON("data.json", function(file) {
			var d="", i, j, k;
			var data = file.data;
			for(i = 0 ; i < data.length; i++){
				d = data[i].disease;
				local.data[d] = {"all" : data[i], "patients" : data[i].patients, "items" : {}, "Measured" : {"header": data[i].monitoring.header,"breakdown":[]}, "Controlled": {"header": data[i].treatment.header,"breakdown":[]}, "Exclusions": {"header": data[i].exclusions.header,"breakdown":[]}};
				local.data[d].patientArray = [];
				for(var o in data[i].patients) {
					if(data[i].patients.hasOwnProperty(o)) {
						local.data[d].patientArray.push(o);
					}
				}
				local.data[d].Measured.main = [['Unmeasured', local.data[d].all.monitoring.unmeasured],['Measured', local.data[d].all.monitoring.measured],['Exclusions', local.data[d].all.exclusions.n]];
				local.data[d].Controlled.main = [['Uncontrolled', local.data[d].all.treatment.uncontrolled],['Controlled', local.data[d].all.treatment.controlled]	,['Exclusions', local.data[d].all.exclusions.n]];
				
				for(j=0; j < local.data[d].all.monitoring.items.length; j++) {
					local.data[d].Measured.breakdown.push([local.data[d].all.monitoring.items[j].name, local.data[d].all.monitoring.items[j].n]);
					local.data[d].items[local.data[d].all.monitoring.items[j].name] = local.data[d].all.monitoring.items[j];
					for(k=0; k < local.data[d].all.monitoring.items[j].patients.length; k++) {
						local.data[d].patients[local.data[d].all.monitoring.items[j].patients[k]].pathwayStage = "monitoring";
						local.data[d].patients[local.data[d].all.monitoring.items[j].patients[k]].subsection = local.data[d].all.monitoring.items[j].name;
					}
				}
				for(j=0; j < local.data[d].all.treatment.items.length; j++) {
					local.data[d].Controlled.breakdown.push([local.data[d].all.treatment.items[j].name, local.data[d].all.treatment.items[j].n]);
					local.data[d].items[local.data[d].all.treatment.items[j].name] = local.data[d].all.treatment.items[j];
					for(k=0; k < local.data[d].all.treatment.items[j].patients.length; k++) {
						local.data[d].patients[local.data[d].all.treatment.items[j].patients[k]].pathwayStage = "treatment";
						local.data[d].patients[local.data[d].all.treatment.items[j].patients[k]].subsection = local.data[d].all.treatment.items[j].name;
					}
				}
				for(j=0; j < local.data[d].all.exclusions.items.length; j++) {
					local.data[d].Exclusions.breakdown.push([local.data[d].all.exclusions.items[j].name, local.data[d].all.exclusions.items[j].n]);
					local.data[d].items[local.data[d].all.exclusions.items[j].name] = local.data[d].all.exclusions.items[j];
					for(k=0; k < local.data[d].all.exclusions.items[j].patients.length; k++) {
						local.data[d].patients[local.data[d].all.exclusions.items[j].patients[k]].pathwayStage = "exclusions";
						local.data[d].patients[local.data[d].all.exclusions.items[j].patients[k]].subsection = local.data[d].all.exclusions.items[j].name;
					}
				}
			}
			
			callback();
		});
	};
	
	var initialize = function(){
		loadData(wireUpPages);
	};
	
	window.bb = {
		init : initialize
	};
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
	bb.init();
	
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