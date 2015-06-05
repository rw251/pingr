/*jslint browser: true*/
/*jshint -W055 */
/*global $, c3, Mustache, ZeroClipboard, console, jsPDF, Bloodhound, bb*/

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
    "actionPlan": {},
		"categories" : {
			"diagnosis": {"name": "diagnosis", "display": "Diagnosis"},
			"monitoring": {"name": "monitoring", "display": "Monitoring"},
			"treatment": {"name": "treatment", "display": "Treatment"},
			"exclusions": {"name": "exclusions", "display": "Exclusions"}
		},
		"page" : "",
		"pathway" : "Blood Pressure"
	};

	var bottomLeftPanel, bottomRightPanel, topLeftPanel, topRightPanel, farRightPanel, monitoringPanel, treatmentPanel,
		diagnosisPanel,	exclusionPanel, patientsPanelTemplate, breakdownPanel, actionPlanPanel, patientList, suggestedPlanTemplate,
		breakdownTableTemplate,	individualPanel, bpTrendPanel, patientsPanel,	suggestedPlanTeam, adviceList, breakdownTable,
    patientInfo, teamTab, individualTab, cdTimeLineBlock, actionPlanList;

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
					html.push('<a href="#main">' + items[i] + '</a>');
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
		if(suggestedPlanTeam) suggestedPlanTeam.html('');
		$('#advice').html('');
		$('#advice-placeholder').show();
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
		if(pathwayStage === local.categories.monitoring.name) showMonitoringPanel(location, enableHover);
		if(pathwayStage === local.categories.treatment.name) showTreatmentPanel(location, enableHover);
		if(pathwayStage === local.categories.diagnosis.name) showDiagnosisPanel(location, enableHover);
		if(pathwayStage === local.categories.exclusions.name) showExclusionsPanel(location, enableHover);

		if(enableHover) highlightOnHoverAndEnableSelectByClick(location);
    else location.children('div').addClass('unclickable');
	};

	var showMonitoringPanel = function(location, enableHover) {
		var percentChange = local.data[local.pathway].monitoring.trend[1][1]-local.data[local.pathway].monitoring.trend[1][30];
		var numberChange = local.data[local.pathway].monitoring.trend[2][1]-local.data[local.pathway].monitoring.trend[2][30];
		createPanel(monitoringPanel, location, {
			percent: local.data[local.pathway].monitoring.trend[1][1],
			percentChange: Math.abs(percentChange),
			percentUp: percentChange>=0,
			number: local.data[local.pathway].monitoring.trend[2][1],
			numberUp: numberChange>=0,
			numberChange: Math.abs(numberChange)
			}, {"change-bar": $('#change-bar').html()}
		);

		destroyCharts(['monitoring-chart']);
		local.charts["monitoring-chart"] = c3.generate({
			bindto: '#monitoring-chart',
			data: {
				x: 'x',
				columns: local.data[local.pathway].monitoring.trend,
				axes: {
					"%" : 'y',
					"n" : 'y2'
				}
			},
      tooltip: {
        format: {
          title: function () { return 'Click for more detail'; },
          value: function () { return undefined;}
        },
        show : enableHover
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
				y : {
					min : 0
				},
				y2: {
					show: true,
					min: 0
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
		var percentChange = local.data[local.pathway].treatment.trend[1][1]-local.data[local.pathway].treatment.trend[1][30];
		var numberChange = local.data[local.pathway].treatment.trend[2][1]-local.data[local.pathway].treatment.trend[2][30];
		createPanel(treatmentPanel, location, {
			percent: local.data[local.pathway].treatment.trend[1][1],
			percentChange: Math.abs(percentChange),
			percentUp: percentChange>=0,
			number: local.data[local.pathway].treatment.trend[2][1],
			numberUp: numberChange>=0,
			numberChange: Math.abs(numberChange)
			}, {"change-bar": $('#change-bar').html()}
		);

		destroyCharts(['treatment-chart']);
		local.charts["treatment-chart"] = c3.generate({
			bindto: '#treatment-chart',
			data: {
				x: 'x',
				columns: local.data[local.pathway].treatment.trend,
				axes: {
					"%" : 'y',
					"n" : 'y2'
				}
			},
      tooltip: {
        format: {
          title: function () { return 'Click for more detail'; },
          value: function () { return undefined;}
        },
        show : enableHover
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
				y : {
					min : 0
				},
				y2: {
					show: true,
					min: 0
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
		createPanel(diagnosisPanel, location);

		c3.generate({
			bindto: '#diagnosis-chart',
			data: {
				columns: [
					['data1', 30, 200, 100, 400, 150]
				],
				type: 'bar'
			},
      tooltip: {
        format: {
          title: function () { return 'Click for more detail'; },
          value: function () { return undefined;}
        },
        show : enableHover
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
		createPanel(exclusionPanel, location);

		c3.generate({
			bindto: '#exclusion-chart',
			data: {
				columns: [
					['data1', 122, 78]
				],
				type: 'bar'
			},
      tooltip: {
        format: {
          title: function () { return 'Click for more detail'; },
          value: function () { return undefined;}
        },
        show : enableHover
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
      var patientId = $(this).find('td button').attr('data-patient-id');
			$('#demographic-placeholder').hide();

			drawBpTrendChart(patientId);
      local.patientId = patientId;

			$('a[href=#tab-plan-individual]').tab('show');

			populateIndividualSuggestedActions(patientId);

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

	var addBreakdownPanel = function (pathwayStage){
		local.selected = pathwayStage;

		createPanel(breakdownPanel, topRightPanel,{"pathwayStage" : pathwayStage, "header": local.data[local.pathway][pathwayStage] ? local.data[local.pathway][pathwayStage].header : ""});

		breakdownTable = $('#breakdown-table');

		topRightPanel.off('click','.panel-body');
		topRightPanel.on('click', '.panel-body', function(){
			if(!local.chartClicked){
        /*jshint unused: true*/
				$('path.c3-arc').attr('class', function(index, classNames) {
					return classNames.replace(/_unselected_/g, '');
				});
        /*jshint unused: false*/

				if(local.charts['breakdown-chart']) local.charts['breakdown-chart'].unselect();

				//hideAllPanels();
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
			//populateSuggestedActionsPanel(subselected);
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
				columns: local.data[local.pathway][pathwayStage].breakdown,
				type: 'pie',
				selection: { enabled: true },
				order: null,
				onclick: function (d) {
					selectPieSlice('breakdown-chart', d.id);
					populatePatientPanel(d.id);
					//populateSuggestedActionsPanel(d.id);
					breakdownTable.find('tr').removeClass('selected');
					breakdownTable.find('tr[data-subsection="' + local.data[local.pathway][pathwayStage].bdown[d.id].name + '"]').addClass('selected');
					local.subselected = d.id;
				},
				onmouseover: function(d){
					breakdownTable.find('tr').removeClass('tr-hovered');
					breakdownTable.find('tr[data-subsection="' + local.data[local.pathway][pathwayStage].bdown[d.id].name + '"]').addClass('tr-hovered');
				},
				onmouseout: function (){
					breakdownTable.find('tr').removeClass('tr-hovered');
				}
			},
			pie: {
				label: {
          /*jshint unused: true*/
					format: function (value, ratio, id) {
						return id;// + ' ('+value+')';
					}
          /*jshint unused: false*/
				}
			},
			legend: {
				show: false
			}
		});

		populateBreakdownTable(pathwayStage);
	};

	var addActionPlanPanel = function(location, pathwayStage) {
		createPanel(actionPlanPanel,location,{"pathwayStage" : pathwayStage});

		suggestedPlanTeam = $('#suggestedPlanTeam');
		adviceList = $('#advice-list');
		patientInfo = $('#patient-info');
		teamTab = $('#tab-plan-team');
		individualTab = $('#tab-plan-individual');

		$('#export-plan').on('click', exportPlan);

		$('#action-plan-tabs').find('a').click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});

		suggestedPlanTeam.on('click', 'input[type=checkbox]', function(){
			var idx = suggestedPlanTeam.find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.selected]) current.actions[local.selected] = {"agree":[],"done":[]};
			while(current.actions[local.selected].done.length<=idx){
				current.actions[local.selected].done.push(false);
			}
			current.actions[local.selected].done[idx]=this.checked;
			setObj(current);

      if(this.checked) {
        recordEvent("Item completed", pathwayStage);
      }

			updateSapRows();
		});

		adviceList.on('click', 'input[type=checkbox]', function(){
			var idx = adviceList.find('input[type=checkbox]').index(this);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.patientId]) current.actions[local.patientId] = {"agree":[],"done":[]};
			while(current.actions[local.patientId].done.length<=idx){
				current.actions[local.patientId].done.push(false);
			}
			current.actions[local.patientId].done[idx]=this.checked;
			setObj(current);
			updateSapRows();
		});

    $('#personalPlanTeam').on('click', 'input[type=checkbox]', function(){
			var idx = $(this).closest('tr').prevAll().length;
      var obj = getObj();
      if(!obj.plans.team[pathwayStage]) obj.plans.team[pathwayStage] = [];
      obj.plans.team[pathwayStage][idx].done = this.checked;
      setObj(obj);

      if(this.checked){
        $(this).parent().parent().parent().addClass('success');
        recordEvent("Personal plan item", pathwayStage);
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
      //displayPersonalisedActionPlan(pathwayStage, $('#personalPlanTeam'), true);
		});

		teamTab.on('click', '.edit-plan', function(){
      var idx = $(this).closest('tr').prevAll().length;

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        displayPersonalisedActionPlan(pathwayStage, $('#personalPlanTeam'), true);
      }).off('shown.bs.modal').on('shown.bs.modal', function () {
        $('#editActionPlanItem').focus();
      }).off('click','.save-plan').on('click', '.save-plan',function(){
        var obj = getObj();
        if(!obj.plans.team[pathwayStage]) obj.plans.team[pathwayStage] = [];
  			obj.plans.team[pathwayStage][idx].text = $('#editActionPlanItem').val();
  			setObj(obj);

        $('#editPlan').modal('hide');
      }).off('keyup','#editActionPlanItem').on('keyup', '#editActionPlanItem',function(e){
        if(e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
		}).on('click', '.delete-plan', function(){
      var idx = $(this).closest('tr').prevAll().length;
      var obj = getObj();
      if(!obj.plans.team[pathwayStage]) obj.plans.team[pathwayStage] = [];
			obj.plans.team[pathwayStage].splice(idx,1);
			setObj(obj);

			displayPersonalisedActionPlan(pathwayStage, $('#personalPlanTeam'), true);
		}).on('click', '.add-plan', function(){
			var obj = getObj();
      if(!obj.plans.team[pathwayStage]) obj.plans.team[pathwayStage] = [];
			obj.plans.team[pathwayStage].push({"text" : $(this).parent().parent().find('input[type=text]').val(), "done": false});
			setObj(obj);

			displayPersonalisedActionPlan(pathwayStage, $('#personalPlanTeam'), true);
		}).on('change', 'input[type=radio]', function(){
      if(this.value==="no") launchTeamModal(local.selected, $(this).closest('tr').children().first().children().first().text());
			var idx = Math.floor(suggestedPlanTeam.find('input[type=radio]').index(this)/2);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.selected]) current.actions[local.selected] = {"agree":[],"done":[]};
			while(current.actions[local.selected].agree.length<=idx){
				current.actions[local.selected].agree.push("");
			}
			current.actions[local.selected].agree[idx]=this.value==="yes";
			setObj(current);

			updateSapRows();
		}).on('keyup', 'input[type=text]', function(e){
      if(e.which === 13) {
        teamTab.find('.add-plan').click();
      }
    });

		individualTab.on('click', '.edit-plan', function(){
      var idx = $(this).closest('tr').prevAll().length;

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        displayPersonalisedActionPlan(local.patientId, $('#personalPlanIndividual'), false);
      }).off('shown.bs.modal').on('shown.bs.modal', function () {
        $('#editActionPlanItem').focus();
      }).off('click','.save-plan').on('click', '.save-plan',function(){
        var obj = getObj();
        if(!obj.plans.individual[local.patientId]) obj.plans.individual[local.patientId] = [];
  			obj.plans.individual[local.patientId][idx].text = $('#editActionPlanItem').val();
  			setObj(obj);

        $('#editPlan').modal('hide');
      }).off('keyup','#editActionPlanItem').on('keyup', '#editActionPlanItem',function(e){
        if(e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
		}).on('click', '.delete-plan', function(){
      var idx = $(this).closest('tr').prevAll().length;
      var obj = getObj();
      if(!obj.plans.individual[local.patientId]) obj.plans.individual[local.patientId] = [];
			obj.plans.individual[local.patientId].splice(idx,1);
			setObj(obj);

      displayPersonalisedActionPlan(local.patientId, $('#personalPlanIndividual'), false);
		}).on('click', '.add-plan', function(){
			var obj = getObj();
      if(!obj.plans.individual[local.patientId]) obj.plans.individual[local.patientId] = [];
			obj.plans.individual[local.patientId].push({"text": $(this).parent().parent().find('input[type=text]').val(), "done": false});
			setObj(obj);

			displayPersonalisedActionPlan(local.patientId, $('#personalPlanIndividual'), false);
		}).on('change', 'input[type=radio]', function(){
      if(this.value==="no") launchPatientActionModal(local.patientId, $(this).closest('tr').children().first().children().first().text());
			var idx = Math.floor(adviceList.find('input[type=radio]').index(this)/2);
			var current = getObj();
			if(!current.actions) current.actions = {};
			if(!current.actions[local.patientId]) current.actions[local.patientId] = {"agree":[],"done":[]};
			while(current.actions[local.patientId].agree.length<=idx){
				current.actions[local.patientId].agree.push("");
			}
			current.actions[local.patientId].agree[idx]=this.value==="yes";
			setObj(current);

			updateSapRows();
		}).on('keyup', 'input[type=text]', function(e){
      if(e.which === 13) {
        individualTab.find('.add-plan').click();
      }
    });
	};

	var selectPanel = function(pathwayStage) {
		//move to top left..
		showPanel(pathwayStage, topLeftPanel, false);
    topLeftPanel.children('div').removeClass('panel-default');

		switchToThreePanelLayout();

		addActionPlanPanel(bottomLeftPanel, pathwayStage);
    populateSuggestedActionsPanel(pathwayStage);

		updateBreadcrumbs([local.pathway, pathwayStage]);

    //update patient panel
    patientsPanel.parent().parent().removeClass('panel-default').addClass('panel-' + pathwayStage);
	};

	var populatePatientPanel = function (id, sortField, sortAsc) {
    var pathwayStage = local.selected;
		var patients = local.data[local.pathway][pathwayStage].bdown[id].patients.map(function(patientId) {
			var ret = local.data[local.pathway].patients[patientId];
			ret.nhsNumber = local.patLookup ? local.patLookup[patientId] : patientId;
      ret.patientId = patientId;
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

		setupClipboard($('.btn-copy'), true);
	};

	var populateSuggestedActionsPanel = function (pathwayStage){
		if(pathwayStage === local.categories.exclusions.name){
			suggestedPlanTeam.html('No team actions for excluded patients');
		} else if(pathwayStage === local.categories.diagnosis.name){
			suggestedPlanTeam.html('No team actions for these patients');
		} else {
			if(!local.data[local.pathway][pathwayStage].index){
				local.data[local.pathway][pathwayStage].index = function(){
					return ++window.INDEX||(window.INDEX=0);
				};
				local.data[local.pathway][pathwayStage].lastIndex = function(){
					return window.INDEX;
				};
				local.data[local.pathway][pathwayStage].resetIndex = function(){
					window.INDEX=null;
				};
			}

			createPanel(suggestedPlanTemplate, suggestedPlanTeam, local.data[local.pathway][pathwayStage], {"item" : $('#suggested-plan-item').html(), "chk" : $('#checkbox-template').html() });

			displayPersonalisedActionPlan(pathwayStage, $('#personalPlanTeam'), true);

			updateCheckboxes(pathwayStage);
		}
	};

	var populateBreakdownTable = function(id){
		var data = local.data[local.pathway][id.toLowerCase()];
		for(var i = 0 ; i< data.items.length; i++){
			data.items[i].color = local.charts['breakdown-chart'].color(data.items[i].name);
		}
		createPanel(breakdownTableTemplate, breakdownTable, data);
	};

	var highlightOnHoverAndEnableSelectByClick = function(panelSelector) {
		panelSelector.children('div').removeClass('unclickable').on('mouseover',function(){
			$(this).removeClass('panel-default');

			var pathwayStage = $(this).data('stage');

			//Make the icon grow
			cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').addClass('fa-3x');
      //Change the color
      cdTimeLineBlock.find('span[data-stage=' + pathwayStage + '] i.fa-circle-thin').removeClass('icon-background-border');
		}).on('mouseout',function(){

			//un-highlight the appropriate panel if no other selected
      if(cdTimeLineBlock.find('span').map(function(){ return $(this).data('selected');}).get().indexOf(true) === -1)
			   $(this).addClass('panel-default');

			var pathwayStage = $(this).data('stage');

			//Make the icon shrink and change color
			if(!cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').data('selected')) {
        cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').removeClass('fa-3x');
          cdTimeLineBlock.find('span[data-stage=' + pathwayStage + '] i.fa-circle-thin').addClass('icon-background-border');
      }
		}).on('click', function(){
			window.location.hash = $(this).data('stage');
		});
	};

	/********************************
	* Charts - draw
	********************************/
	var drawBpTrendChart = function(patientId){
		destroyCharts(['chart-demo-trend']);
		if(!local.data[local.pathway].patients || !local.data[local.pathway].patients[patientId] || !local.data[local.pathway].patients[patientId].bp) return;

		var chartOptions = {
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: local.data[local.pathway].patients[patientId].bp
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

		if(local.data[local.pathway].patients[patientId].contacts){
			chartOptions.grid = {
				x: {
					lines: local.data[local.pathway].patients[patientId].contacts
				}
			};
		}

		local.charts['chart-demo-trend'] = c3.generate(chartOptions);
	};

	var selectPieSlice = function (chart, id){
		local.chartClicked=true;
    /*jshint unused: true*/
		$('#' + chart + ' path.c3-arc').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
    /*jshint unused: false*/
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
		cdTimeLineBlock.find('span').data('selected', false).find('i.fa-circle-thin').addClass('icon-background-border');

		switchToFourPanelLayout();

		hideAllPanels();

		updateBreadcrumbs([local.pathway]);

		showPanel(local.categories.diagnosis.name, topLeftPanel, true);
		showPanel(local.categories.monitoring.name, topRightPanel, true);
		showPanel(local.categories.treatment.name, bottomLeftPanel, true);
		showPanel(local.categories.exclusions.name, bottomRightPanel, true);
	};

	var updateCheckboxes = function(id){
		var current = getObj();
		var wireUpRadioButtons = function(i) {
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
		};

		var wireUpCheckboxes =function(i){
			if(current.actions && current.actions[id] && current.actions[id].done.length>i && current.actions[id].done[i]){
				$(this).prop('checked', true);
			}
		};

		suggestedPlanTeam.find('input[type=checkbox]').each(wireUpCheckboxes);

		suggestedPlanTeam.find('input[type=radio]').each(wireUpRadioButtons);

		adviceList.find('input[type=checkbox]').each(wireUpCheckboxes);

		adviceList.find('input[type=radio]').each(wireUpRadioButtons);

		updateSapRows();
	};

	var updateSapRows = function(){
		suggestedPlanTeam.find('.suggestion').add(adviceList.find('.suggestion')).each(function(){
			$(this).find('td').last().children().hide();
		});

		suggestedPlanTeam.add(adviceList).find('input[type=checkbox]').each(function(){
			if(this.checked){
				$(this).parent().parent().parent().addClass('success');
			} else {
				$(this).parent().parent().parent().removeClass('success');
			}
		});

    var any = false;
    suggestedPlanTeam.add(adviceList).find('input[type=radio]:checked').each(function(){
			if(this.value==="yes"){
				$(this).parent().parent().parent().parent().removeClass('danger');
				$(this).parent().parent().parent().parent().find('td').last().children().show();
        any = true;
			} else {
				$(this).parent().parent().parent().parent().addClass('danger');
			}
		});

    suggestedPlanTeam.find('table thead tr th').last().html( any ? 'Completed' : '');
	};

	var populateIndividualSuggestedActions = function (patientId) {
		var data = {"nhsNumber" : local.patLookup ? local.patLookup[patientId] : patientId, "patientId" : patientId};
    var pathwayStage = local.selected;

		if (local.selected && local.selected === local.categories.exclusions.name && local.subselected){
			data.isExclusion = true;
			data.exclusionReason = local.data[local.pathway][pathwayStage].bdown[local.subselected].desc;

			if(local.subselected!="Exclusion code") {
			  data.isReadCode = true;
			}
		}

    data.suggestions = local.data[local.pathway][pathwayStage].bdown[local.subselected].suggestions;
    data.section = local.data[local.pathway][pathwayStage].bdown[local.subselected].desc;
    data.category = local.data[local.pathway].patients[patientId].category;

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

    $('#patientDisagreeButton').on('click', function(){
      launchPatientModal(patientId, "overall");
    });

		setupClipboard( $('.btn-copy'), true );

		updateCheckboxes(patientId);

		createPanel(bpTrendPanel, patientInfo);

    drawBpTrendChart(patientId);

		displayPersonalisedActionPlan(patientId, $('#personalPlanIndividual'), false);
	};

	var displayPersonalisedActionPlan = function(id, parentElem, isTeam) {
		var plans = getObj().plans;

		var plan = "";

		if(isTeam && id) {
			if(plans.team[id]) plan = plans.team[id];
		} else if(!isTeam && id) {
			if(plans.individual[id]) plan = plans.individual[id];
		}

		createPanel(actionPlanList, parentElem, {"suggestions" : plan}, {"action-plan": $('#action-plan').html(), "action-plan-item": $('#action-plan-item').html(), "chk" : $('#checkbox-template').html() });


	};

	var displaySelectedPatient = function(id){
		//find patient - throw error if not exists

		var pathwayStage = local.data[local.pathway].patients[id].pathwayStage;
		var subsection = local.data[local.pathway].patients[id].subsection;
    var nhs = local.patLookup ? local.patLookup[id] : id;

    window.location.hash = pathwayStage;

		populatePatientPanel(subsection);
		populateSuggestedActionsPanel(pathwayStage);
		local.subselected = subsection;
		breakdownTable.find('tr').removeClass('selected');
		breakdownTable.find('tr[data-subsection="'+subsection+'"]').addClass('selected');

		setTimeout(function(){ return selectPieSlice('breakdown-chart', subsection);},500);

		$('.list-item').removeClass('highlighted');
		$('.list-item:has(button[data-clipboard-text=' + nhs +'])').addClass('highlighted');
		$('#demographic-placeholder').hide();

		drawBpTrendChart(id);
    local.patientId = id;

		$('a[href=#tab-plan-individual]').tab('show');

		populateIndividualSuggestedActions(id);
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

  var launchModal = function(data, label, value){
    var template = $('#modal-why').html();
    Mustache.parse(template);   // optional, speeds up future uses

    var reasonTemplate = $('#modal-why-item').html();
    Mustache.parse(reasonTemplate);

    var rendered = Mustache.render(template, data, {"item" : reasonTemplate});
    $('#modal').html(rendered);

    $('#modal .modal').off('click','.save-plan').on('click', '.save-plan', {"label" : label}, function(e){
      var obj = getObj();
      if(!obj.feedback) obj.feedback = {};
      if(!obj.feedback[e.data.label]) obj.feedback[label] = [];
      var reason = $('input:radio[name=reason]:checked').val();
      var reasonText = $('#modal input[type=text]').val();
      var item = {"val" : value, "reason" : reason};
      if(reasonText !== "") item.text = reasonText;
      obj.feedback[e.data.label].push(item);
      setObj(obj);

      $('#modal .modal').modal('hide');
    }).modal();
  };

  var launchTeamModal = function(label, value){
    launchModal({"header" : "Why?", "placeholder":"Tell us more so we won’t make this error again...", "reasons" : [{"reason":"Already done this","value":"done"},{"reason":"Wouldn't work","value":"nowork"},{"reason":"Something else","value":"else"}]},label, value);
  };

  var launchPatientModal = function(label, value){
    launchModal({"header" : "Why?", "placeholder":"Tell us more so we won’t make this error again...", "reasons" : [{"reason":"Meets the target","value":"meetstarget"},{"reason":"Should be excluded","value":"shouldexclude"},{"reason":"Should be in recently measured / recently changed / suboptimal rx group","value":"othergroup"},{"reason":"Something else","value":"else"}]},label, value);
  };

  var launchPatientActionModal = function(label, value){
    launchModal({"header" : "Why?", "placeholder":"Tell us more so we won’t make this error again...", "reasons" : [{"reason":"Already done this","value":"done"},{"reason":"Wouldn't work","value":"nowork"},{"reason":"Something else","value":"else"}]},label, value);
  };

	var getObj = function(){
		return JSON.parse(localStorage.bb);
	};

	var setObj = function(obj){
		localStorage.bb = JSON.stringify(obj);
	};

 local.tmp = null;
	var setupClipboard = function(selector, destroy) {
		if(destroy)	ZeroClipboard.destroy(); //tidy up

		var client = new ZeroClipboard(selector);

		client.on( 'ready', function() {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
        $(event.target).popover({
          trigger: 'manual',
          template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
          delay: {show:500, hide:500}
        });
        clearTimeout(local.tmp);
        $(event.target).popover('show');
        local.tmp = setTimeout(function(){$(event.target).popover('hide');}, 600);
			});
		});
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
		for(i=0; i< local.data[local.pathway].monitoring.breakdown.length; i++){
			mainId = local.data[local.pathway].monitoring.breakdown[i][0];
			addHeading(mainId, 18);
			addLine(local.data[local.pathway][pathwayStage].bdown[mainId].main);

			suggs = local.data[local.pathway][pathwayStage].bdown[mainId].suggestions;
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
			local.data[local.pathway][pathwayStage].bdown[mainId].patients.forEach(internalFunc);
		}

		for(i=0; i< local.data[local.pathway].treatment.breakdown.length; i++){
			mainId = local.data[local.pathway].treatment.breakdown[i][0];
			addHeading(mainId, 18);
			addLine(local.data[local.pathway][pathwayStage].bdown[mainId].main);

			suggs = local.data[local.pathway][pathwayStage].bdown[mainId].suggestions;
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
			local.data[local.pathway][pathwayStage].bdown[mainId].patients.forEach(internalFunc);
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

  var recordEvent = function(name, pathwayStage) {
    var obj = getObj();
    if(!obj.events) obj.events = {};
    if(!obj.events[pathwayStage]) obj.events[pathwayStage] = [];
    obj.events[pathwayStage].push({"name": name, "date": new Date()});
    setObj(obj);
  };

  /*jshint unused: true*/
	var onSelected = function($e, nhsNumberObject) {
  /*jshint unused: false*/
		//Hide the suggestions panel
		$('#search-box').find('.tt-dropdown-menu').css('display', 'none');

		//Clear the patient search box - needs a slight delay for some reason
		setTimeout(function() {$('#search-box > span > input.typeahead.tt-input, #search-box > span > input.typeahead.tt-hint').val('');},400);

		displaySelectedPatient(nhsNumberObject.id);
	};

  var loadContent = function(hash, isPoppingState){
    if(!isPoppingState) {
      window.location.hash = hash;
    }

    if(hash === ''){
      showPage('login');
    }else if(hash === "#main") {
      showPage('main-dashboard');
      $('#navbar').children('.nav').find(".active").removeClass("active");
    } else if (hash === "#help") {
      showPage('help-page');
    } else {
      //if screen not in correct segment then select it
      if(local.page !== 'main-dashboard'){
        $('.page').hide();
        $('#main-dashboard').show();

        showSidePanel();
        showOverview();
      }

      addPatientPanel(farRightPanel);
      hideAllPanels();

      //Unselect all other nodes and keep this one enlarged
      var pathwayStage = hash.substr(1);
      cdTimeLineBlock.find('span').data('selected', false).removeClass('fa-3x');
      cdTimeLineBlock.find('span').data('selected', false).find('i.fa-circle-thin').addClass('icon-background-border');
			cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').data('selected',true).addClass('fa-3x');
			cdTimeLineBlock.find('span[data-stage=' + pathwayStage + ']').data('selected',true).find('i.fa-circle-thin').removeClass('icon-background-border');

      selectPanel(pathwayStage);

      addBreakdownPanel(pathwayStage);
    }
  };

  var wireUpSearchBox = function () {
    if(local.states) {
      local.states.clearPrefetchCache();
    }

    local.states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(local.data[local.pathway].patientArray, function(state) { return { id: state, value: local.patLookup ? local.patLookup[state] : state }; })
    });

    local.states.initialize(true);

    $('#search-box').find('.typeahead').typeahead('destroy');
    $('#search-box').find('.typeahead').typeahead(
      {hint: true, highlight: true, minLength: 2},
      {name: 'patients', displayKey: 'value', source: local.states.ttAdapter()}
    ).on('typeahead:selected', onSelected)
    .on('typeahead:autocompleted', onSelected);
  };

	var wireUpPages = function () {
		showPage('login');

    //History
    window.onpopstate = function() {
        loadContent(window.location.hash, true);
    };

		//Templates
		monitoringPanel = $('#monitoring-panel');
		treatmentPanel = $('#treatment-panel');
		diagnosisPanel = $('#diagnosis-panel');
		exclusionPanel = $('#exclusion-panel');
		patientsPanelTemplate = $('#patients-panel');
		breakdownPanel = $('#breakdown-panel');
		actionPlanPanel = $('#action-plan-panel');
		patientList = $('#patient-list');
		suggestedPlanTemplate = $('#suggested-plan-template');
		breakdownTableTemplate = $('#breakdown-table-template');
		individualPanel = $('#individual-panel');
		bpTrendPanel = $('#bp-trend-panel');
		actionPlanList = $('#action-plan-list');

		//Selectors
		bottomLeftPanel = $('#bottom-left-panel');
		bottomRightPanel = $('#bottom-right-panel');
		topLeftPanel = $('#top-left-panel');
		topRightPanel = $('#top-right-panel');
		farRightPanel = $('#right-panel');
		cdTimeLineBlock = $('.cd-timeline-block');

		$('#pick-nice').on('click', function(e){
			$('#pick-button').html('NICE <span class="caret"></span>');
			$('#guide-amount').html('<i class="fa fa-warning"></i> 96</span>');
			$('#guide-text').html('CVD events could be prevented');
      e.preventDefault();
		});

		$('#pick-qof').on('click', function(e){
			$('#pick-button').html('QOF <span class="caret"></span>');
			$('#guide-amount').html('<i class="fa fa-warning"></i> 12</span>');
			$('#guide-text').html('QOF points could be achieved');
      e.preventDefault();
		});

		//Wire up the pathway in the side panel
		cdTimeLineBlock.find('span').on('mouseover',function(){
			//Make the icon grow
			$(this).addClass('fa-3x');
      //Change icon color
			$(this).find('i.fa-circle-thin').removeClass('icon-background-border');
			//highlight the appropriate panel
			$('div[data-stage=' + $(this).data('stage') +']').removeClass('panel-default');
		}).on('mouseout',function(){
			//Make the icon shrink and change color
			if(!$(this).data('selected')) {
        $(this).removeClass('fa-3x');
  			$(this).find('i.fa-circle-thin').addClass('icon-background-border');
      }
			//un-highlight the appropriate panel if no other selected
      if(cdTimeLineBlock.find('span').map(function(){ return $(this).data('selected');}).get().indexOf(true) === -1)
			   $('div[data-stage=' + $(this).data('stage') +']').addClass('panel-default');
		}).on('click', function() {
      window.location.hash = $(this).data('stage');
		});

		/**********************************
		 ** Patient search auto complete **
		 **********************************/
    wireUpSearchBox();

    $('#data-file').on('change', function(evt){
      $('#data-file-wrapper').addClass('disabled').text("Loading...");
      var file = evt.target.files[0]; // FileList object
      var reader = new FileReader();

      reader.onload = (function() {
        return function(e) {
          var JsonObj = JSON.parse(e.target.result);
          getData(null, JsonObj.data);
          console.log(JsonObj);

          wireUpSearchBox();

          setTimeout(function() { $('#data-file-wrapper').hide(500); }, 1000);
        };
      })(file);

      reader.readAsText(file);
    });

    $('#patient-file').on('change', function(evt){
      $('#patient-file-wrapper').addClass('disabled').text("Loading...");
      var file = evt.target.files[0]; // FileList object
      var reader = new FileReader();

      reader.onload = (function() {
        return function(e) {
          var lines = e.target.result.split("\n");
          local.patLookup = {};
          for(var i = 0; i < lines.length; i++){
            var fields = lines[i].split(",");
            if(fields.length!==2) continue;
            local.patLookup[fields[0].trim()] = fields[1].trim();
          }

          wireUpSearchBox();

          setTimeout(function() { $('#patient-file-wrapper').hide(500); }, 1000);
        };
      })(file);

      reader.readAsText(file);
    });
	};

  var loadActionPlan = function(callback) {
    $.getJSON("action-plan.json", function(file){
      local.actionPlan = file;
      callback();
    });
  };

  var loadData = function(data){
    var d="", i, j, k;
    for(i = 0 ; i < data.length; i++){
      d = data[i].disease;
      local.data[d] = {"patients" : data[i].patients,
        "monitoring" : {"header": data[i].monitoring.header,"breakdown":[], "suggestions" : local.actionPlan.monitoring.practice, "bdown":{}, "trend":data[i].monitoring.trend, "table-headings":data[i].monitoring["table-headings"], "items" : data[i].monitoring.items},
        "treatment": {"header": data[i].treatment.header,"breakdown":[], "suggestions" : local.actionPlan.treatment.practice, "bdown":{}, "trend":data[i].treatment.trend, "table-headings":data[i].treatment["table-headings"], "items" : data[i].treatment.items},
        "diagnosis": {"header": data[i].diagnosis.header,"breakdown":[], "suggestions" : local.actionPlan.diagnosis.practice, "bdown":{}, "trend":data[i].diagnosis.trend, "table-headings":data[i].diagnosis["table-headings"], "items" : data[i].diagnosis.items},
        "exclusions": {"header": data[i].exclusions.header,"breakdown":[], "suggestions" : local.actionPlan.exclusions.practice, "bdown":{}, "trend":data[i].exclusions.trend, "table-headings":data[i].exclusions["table-headings"], "items" : data[i].exclusions.items}};
      local.data[d].patientArray = [];
      for(var o in data[i].patients) {
        if(data[i].patients.hasOwnProperty(o)) {
          local.data[d].patientArray.push(o);
        }
      }

      for(j=0; j < local.data[d].monitoring.items.length; j++) {
        local.data[d].monitoring.breakdown.push([local.data[d].monitoring.items[j].name, local.data[d].monitoring.items[j].n]);
        local.data[d].monitoring.bdown[local.data[d].monitoring.items[j].name] = local.data[d].monitoring.items[j];
        local.data[d].monitoring.bdown[local.data[d].monitoring.items[j].name].suggestions = local.actionPlan.monitoring.individual[local.data[d].monitoring.items[j].name];
        for(k=0; k < local.data[d].monitoring.items[j].patients.length; k++) {
          local.data[d].patients[local.data[d].monitoring.items[j].patients[k]].pathwayStage = "monitoring";
          local.data[d].patients[local.data[d].monitoring.items[j].patients[k]].subsection = local.data[d].monitoring.items[j].name;
        }
      }
      for(j=0; j < local.data[d].treatment.items.length; j++) {
        local.data[d].treatment.breakdown.push([local.data[d].treatment.items[j].name, local.data[d].treatment.items[j].n]);
        local.data[d].treatment.bdown[local.data[d].treatment.items[j].name] = local.data[d].treatment.items[j];
        local.data[d].treatment.bdown[local.data[d].treatment.items[j].name].suggestions = local.actionPlan.treatment.individual[local.data[d].treatment.items[j].name];
        for(k=0; k < local.data[d].treatment.items[j].patients.length; k++) {
          local.data[d].patients[local.data[d].treatment.items[j].patients[k]].pathwayStage = "treatment";
          local.data[d].patients[local.data[d].treatment.items[j].patients[k]].subsection = local.data[d].treatment.items[j].name;
        }
      }
      for(j=0; j < local.data[d].exclusions.items.length; j++) {
        local.data[d].exclusions.breakdown.push([local.data[d].exclusions.items[j].name, local.data[d].exclusions.items[j].n]);
        local.data[d].exclusions.bdown[local.data[d].exclusions.items[j].name] = local.data[d].exclusions.items[j];
        local.data[d].exclusions.bdown[local.data[d].exclusions.items[j].name].suggestions = local.actionPlan.exclusions.individual[local.data[d].exclusions.items[j].name];
        for(k=0; k < local.data[d].exclusions.items[j].patients.length; k++) {
          local.data[d].patients[local.data[d].exclusions.items[j].patients[k]].pathwayStage = "exclusions";
          local.data[d].patients[local.data[d].exclusions.items[j].patients[k]].subsection = local.data[d].exclusions.items[j].name;
        }
      }
      for(j=0; j < local.data[d].diagnosis.items.length; j++) {
        local.data[d].diagnosis.breakdown.push([local.data[d].diagnosis.items[j].name, local.data[d].diagnosis.items[j].n]);
        local.data[d].diagnosis.bdown[local.data[d].diagnosis.items[j].name] = local.data[d].diagnosis.items[j];
        local.data[d].diagnosis.bdown[local.data[d].diagnosis.items[j].name].suggestions = local.actionPlan.diagnosis.individual[local.data[d].diagnosis.items[j].name];
        for(k=0; k < local.data[d].diagnosis.items[j].patients.length; k++) {
          local.data[d].patients[local.data[d].diagnosis.items[j].patients[k]].pathwayStage = "diagnosis";
          local.data[d].patients[local.data[d].diagnosis.items[j].patients[k]].subsection = local.data[d].diagnosis.items[j].name;
        }
      }
    }
  };

	var getData = function(callback, json) {
    if(json) {
      loadData(json);
      if(typeof callback === 'function') callback();
    } else {
      var r = Math.random();
  		$.getJSON("data.json?v="+r, function(file) {
  			loadData(file.data);
        if(typeof callback === 'function') callback();
  		});
    }
	};

	var initialize = function(){
    loadActionPlan(function(){
      getData(wireUpPages);
    });
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
  if(!obj.version || obj.version!=="1.2"){
    localStorage.bb = JSON.stringify({"version" : "1.2", "plans" : {"team" : {}, "individual" : {}}});
  }

	$('[data-toggle="tooltip"]').tooltip();
});
