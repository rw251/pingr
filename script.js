/*jslint browser: true*/
/*jshint -W055 */
/*global $, c3, Mustache*/
(function () {
   'use strict';
	var bb = {}, patientId, clip;
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

	var drawBpTrendChart = function(nhs){
		destroyCharts(['chart6']);
		if(!bb.data["Blood Pressure"].patients || !bb.data["Blood Pressure"].patients[nhs] || !bb.data["Blood Pressure"].patients[nhs].bp) return;
		
		var chartOptions = {
			bindto: '#chart-demo-trend',
			data: {
				x: 'x',
				columns: bb.data["Blood Pressure"].patients[nhs].bp
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
		
		if(bb.data["Blood Pressure"].patients[nhs].contacts){
			chartOptions.grid = {
				x: {
					lines: bb.data["Blood Pressure"].patients[nhs].contacts
				}
			};
		}

		bb.chart6 = c3.generate(chartOptions);
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
		
		updateSapRows();
	};
	
	var updateSapRows = function(){
		$('#sap .suggestion').each(function(i){
			$(this).find('td').last().children().hide();
		});
	
		$('#sap').find('input[type=checkbox]').each(function(i){
			if(this.checked){
				$(this).parent().parent().parent().addClass('success');				
			} else {
				$(this).parent().parent().parent().removeClass('success');
			}
		});		
		
		$('#sap').find('input[type=radio]:checked').each(function(i){
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
		var html = "";
		if(bb.selected && bb.selected === "Uncontrolled"){
		var r = Math.floor(Math.random()*3);
html='<span>Patient ' + nhs + '</span><table class="table"><thead><tr><th>Action</th><th>Todo</th><th>Done</th><th>Declined</th></tr></thead><tbody><tr><td>' + examples[r].join('</td><td><input type="checkbox" /></td><td><input type="checkbox" /></td><td><input type="checkbox" /></td></tr><tr><td>')  + '</td><td><input type="checkbox" /></td><td><input type="checkbox" /></td><td><input type="checkbox" /></td></tr></tbody></table>';
		} else if (bb.selected && bb.selected === "Excluded" && bb.subselected){
		html='<div><span>Patient ' + nhs + '</span> is excluded because of "' + bb.data["Blood Pressure"].items[bb.subselected].desc +'"</div>';
		if(bb.subselected!="Exclusion code") {
		  html += '<div>We suggest you add the following exclusion code to their record: 9h3.. <button type="button" data-clipboard-text="9h3.." title="Copy to clipboard." class="btn btn-xs btn-default" id="code-clip"><span class="fa fa-clipboard"></span></button></div>';
		}
		}
		$('#advice-placeholder').hide();
		$('#advice').html(html);
		
		var client = new ZeroClipboard( $('#code-clip') );
		
		client.on( 'ready', function(event) {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
			});
		});
		
		displayPersonlisedActionPlan(nhs,$('#tab-sap-individual .panel-footer'), false, false);
	};
	
	var displayPersonlisedActionPlan = function(id, parentElem, isTeam, isEditable) {
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
	
	var populateSuggestedActions = function (id){
		if(bb.selected==="Excluded"){
			$('#sap').html('No team actions for excluded patients');
			$('#sap-placeholder').hide();
			$('#team-footer').hide();	  
		} else {
			var template = $('#sap-template').html();
			var checkbox = $('#checkbox-template').html();
			Mustache.parse(template);   // optional, speeds up future uses
			if(!bb.data["Blood Pressure"].items[id].index){
				bb.data["Blood Pressure"].items[id].index = function(){
					return ++window.INDEX||(window.INDEX=0);
				};
				bb.data["Blood Pressure"].items[id].lastindex = function(){
					return window.INDEX;
				};
				bb.data["Blood Pressure"].items[id].resetindex = function(){
					window.INDEX=null;
					return;
				};
			}
			var rendered = Mustache.render(template, bb.data["Blood Pressure"].items[id], {"chk" : checkbox });
			$('#sap').html(rendered);
			$('#sap-placeholder').hide();

			displayPersonlisedActionPlan(id, $('#tab-sap-team .panel-footer'), true, false);
			
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

	var populatePatients = function (id, sortField, sortAsc) {
		patientId = id;
		var template = $('#patient-list').html();
		Mustache.parse(template);   // optional, speeds up future uses
		
		var patients = bb.data["Blood Pressure"].items[id].patients.map(function(nhs) {
			var ret = bb.data["Blood Pressure"].patients[nhs];
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

	var populatePanels = function (id) {
		populatePatients(id);
		populateSuggestedActions(id);
	};

	var hidePanels = function(){  
		  $('#sap').html('');
		  $('#sap-placeholder').show();
		  $('#advice').html('');
		  $('#advice-placeholder').show();
		  $('#individual-footer').hide();
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
		
		$('#patients').on('click', 'thead tr th.sortable', function(e){
			var sortAsc = !$(this).hasClass('sort-asc');
			if(sortAsc) {
				$(this).removeClass('sort-desc').addClass('sort-asc');
			} else {
				$(this).removeClass('sort-asc').addClass('sort-desc');
			}
			populatePatients(patientId, $(this).text().substr(0,1) === "L" ? "sbp" : "nhs", sortAsc);
		});
		
		$('#patients')
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
			});
		
		
		$('#tab-performance').on('afterAddClass', function(e) {
			//Events bubble up, but we only care about this element and not children
			if(e.target === e.currentTarget) {
				drawMainCharts();
				showPatientsTab();
			}
		});
		
		$('#tab-trend').bind('afterAddClass', function(e) {
			//Events bubble up, but we only care about this element and not children
			if(e.target === e.currentTarget) {
				drawTrendChart();		
				showPatientsTab();
			}
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
				bb.subselected = bb.data["Blood Pressure"].ids[this.id.slice(4)];
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
			if(!current.actions) current.actions = {};
			if(!current.actions[bb.subselected]) current.actions[bb.subselected] = {"agree":[],"done":[]};
			while(current.actions[bb.subselected].done.length<=idx){
				current.actions[bb.subselected].done.push(false);
			}
			current.actions[bb.subselected].done[idx]=this.checked;
			setObj(current);
			updateSapRows();
		});
		
		$("ul.nav-tabs a").click(function (e) {
			e.preventDefault();  
			$(this).tab('show');
		});
		
		$('#tab-sap-team').on('click', '.edit-plan', function(e){
			displayPersonlisedActionPlan(bb.subselected, $('#tab-sap-team .panel-footer'), true, true);
		}).on('click', '.add-plan', function(e){
			var obj = getObj();
			obj.plans.team[bb.subselected] = $('#tab-sap-team textarea').val();
			setObj(obj);
			
			displayPersonlisedActionPlan(bb.subselected, $('#tab-sap-team .panel-footer'), true, false);
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
			displayPersonlisedActionPlan(bb.nhs, $('#tab-sap-individual .panel-footer'), false, true);
		}).on('click', '.add-plan', function(e){
			var obj = getObj();
			obj.plans.individual[bb.nhs] = $('#tab-sap-individual textarea').val();
			setObj(obj);
			
			displayPersonlisedActionPlan(bb.nhs, $('#tab-sap-individual .panel-footer'), false, false);
		});
		
		$('#export-plan').on('click', function(){
		
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
			for(i=0; i< bb.data["Blood Pressure"].Measured.breakdown.length; i++){
				mainId = bb.data["Blood Pressure"].Measured.breakdown[i][0];
				addHeading(mainId, 18);
				addLine(bb.data["Blood Pressure"].items[mainId].main);
				
				suggs = bb.data["Blood Pressure"].items[mainId].suggestions;
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
				bb.data["Blood Pressure"].items[mainId].patients.forEach(internalFunc);
			}
			
			for(i=0; i< bb.data["Blood Pressure"].Controlled.breakdown.length; i++){
				mainId = bb.data["Blood Pressure"].Controlled.breakdown[i][0];
				addHeading(mainId, 18);
				addLine(bb.data["Blood Pressure"].items[mainId].main);
				
				suggs = bb.data["Blood Pressure"].items[mainId].suggestions;
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
				bb.data["Blood Pressure"].items[mainId].patients.forEach(internalFunc);
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
				bb.data[d] = {"all" : data[i], "ids" : {}, "patients" : data[i].patients, "items" : {}, "Measured" : {"breakdown":[]}, "Controlled": {"breakdown":[]}, "Excluded": {"breakdown":[]}};
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
	bb.wireUpPages();	
	bb.loadData();
	
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
	
	$("#patients").niceScroll({
		//cursorcolor: "#424242", // change cursor color in hex
        cursoropacitymin: 0.3, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
        //cursoropacitymax: 1, // change opacity when cursor is active (scrollabar "visible" state), range from 1 to 0
        cursorwidth: "7px", // cursor width in pixel (you can also write "5px")
        //cursorborder: "1px solid #fff", // css definition for cursor border
        //cursorborderradius: "5px", // border radius in pixel for cursor
		horizrailenabled: false // nicescroll can manage horizontal scroll
	});	
});