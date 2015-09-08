/*jslint browser: true*/
/*jshint -W055 */
/*global $, c3, Mustache, ZeroClipboard, console, jsPDF, Bloodhound, bb, alert*/

/*
 * For each disease area there will be 4 stages: Diagnosis, Monitoring, Treatment and Exclusions.
 * Each stage gets a single panel on the front screen.
 * Clicking on a panel takes you to a screen specific to that stage, but similar in layour and content
 *  to all the others.
 */

(function () {
  'use strict';

  var location = window.history.location || window.location;
	/*******************************
	 *** Define local properties ***
	 *******************************/
	var local= {
		"charts" : {},
    "currentUrl" : "",
		"data" : {},
    "options":[],
    "elements" : {},
    "actionPlan": {},
		"categories" : {
			"diagnosis": {"name": "diagnosis", "display": "Diagnosis"},
			"monitoring": {"name": "monitoring", "display": "Monitoring"},
			"treatment": {"name": "treatment", "display": "Control"},
			"exclusions": {"name": "exclusions", "display": "Exclusions"}
		},
		"page" : "",
		"pathwayId" : "htn",
    "colors" : ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    "diseases" : [],
    "pathwayNames" : {},
    "monitored" : {"bp" : "Blood Pressure", "asthma" : "Peak Expiratory Flow"},
    "tmp" : null
	};

	var bottomLeftPanel, bottomRightPanel, topPanel, topLeftPanel, topRightPanel, midPanel, farLeftPanel, farRightPanel, monitoringPanel, treatmentPanel,
		diagnosisPanel,	exclusionPanel, patientsPanelTemplate, breakdownPanel, actionPlanPanel, patientList, patientListSimple, suggestedPlanTemplate,
		breakdownTableTemplate,	individualPanel, valueTrendPanel, medicationPanel, patientsPanel,	suggestedPlanTeam, adviceList, breakdownTable,
    patientInfo, teamTab, individualTab, actionPlanList;


  //Side panel, navigation, header bar and main page
  var showMainView = function(idx){
    //Set up navigation panel
    showSidePanel();
    showNavigation(local.diseases, idx, $('#main-dashboard'));

    showHeaderBarItems();

    //Show main dashboard page
    showPage('main-dashboard');
  };

  //Show the overview page for a disease
  var showOverview = function(disease){
    local.pathwayId = disease;

    showMainView(local.diseases.map(function(v){ return v.id; }).indexOf(disease));

    $('aside li ul li').removeClass('active');
    $('aside a[href="#main/' + disease + '"]:contains("Overview")').parent().addClass('active');

    $('#mainTitle').show();
    updateTitle(local.data[local.pathwayId]["display-name"] + ": overview (practice-level data)");

    //Show overview panels
    showOverviewPanels();
    showTeamActionPlanPanel(farRightPanel);
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
  };

  //Show the pathway stage for a disease
  var showPathwayStageView = function(pathwayId, pathwayStage, standard, shouldFade){
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    local.pathwayId = pathwayId;
    showMainView(local.diseases.map(function(v){ return v.id; }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage,"g");
    $('aside a').filter(function(){
      return this.href.match(re);
    }).parent().addClass('active');

    switchTo110Layout();

    if(!standard) {
      standard = Object.keys(local.data[pathwayId][pathwayStage].standards)[0];
    }

    var panel = createPatientPanel(pathwayId, pathwayStage, standard);

    if(shouldFade){
      farLeftPanel.fadeOut(100, function(){
        $(this).html(panel);
        wireUpPatientPanel(pathwayId, pathwayStage, farLeftPanel, standard);
        populatePatientPanel(pathwayId, pathwayStage, standard, null);
        $('#mainTitle').hide();
        updateTitle(local.data[pathwayId][pathwayStage].text.page.text,local.data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(100, function(){
          //patientsPanel.parent().parent().parent().parent().removeClass('panel-default').addClass('panel-' + pathwayStage);
          //farRightPanel.children(':first').removeClass('panel-default').addClass('panel-' + pathwayStage);
        })
      });
    } else {
      farLeftPanel.html(panel);
      wireUpPatientPanel(pathwayId, pathwayStage, farLeftPanel, standard);
      populatePatientPanel(pathwayId, pathwayStage, standard, null);
      $('#mainTitle').hide();
      updateTitle(local.data[pathwayId][pathwayStage].text.page.text,local.data[pathwayId][pathwayStage].text.page.tooltip);
      //farRightPanel.children(':first').removeClass('panel-default').addClass('panel-' + pathwayStage);
    }

    var template = $('#patient-panel-placeholder').html();
    farRightPanel.html(Mustache.render(template));
  };

  var showPathwayStageViewOk = function(pathwayId, pathwayStage, shouldFade){
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    showMainView(local.diseases.map(function(v){ return v.id; }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage,"g");
    $('aside a').filter(function(){
      return this.href.match(re);
    }).parent().addClass('active');

    switchTo110Layout();

    var panel = createPatientPanelOk(pathwayId, pathwayStage);

    if(shouldFade){
      farLeftPanel.fadeOut(200, function(){
        $(this).html(panel);
        wireUpPatientPanelOk(pathwayId, pathwayStage, farLeftPanel);
        populatePatientPanelOk(pathwayId, pathwayStage, null);
        $('#mainTitle').hide();
        updateTitle(local.data[pathwayId][pathwayStage].text.page.text, local.data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(300, function(){
          //patientsPanel.parent().parent().parent().parent().removeClass('panel-default').addClass('panel-' + pathwayStage);
          //farRightPanel.children(':first').removeClass('panel-default').addClass('panel-' + pathwayStage);
        })
      });
      var template = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(template));
    } else {
        farLeftPanel.html(panel);
        wireUpPatientPanelOk(pathwayId, pathwayStage, farLeftPanel);
        populatePatientPanelOk(pathwayId, pathwayStage, null);
        $('#mainTitle').hide();
        updateTitle(local.data[pathwayId][pathwayStage].text.page.text, local.data[pathwayId][pathwayStage].text.page.tooltip);
        //farRightPanel.children(':first').removeClass('panel-default').addClass('panel-' + pathwayStage);
    }
  };


  //Show patient view within the pathway stage view
  var showPathwayStagePatientView = function(patientId, pathwayId, pathwayStage, standard){
    local.patientId = patientId;

    switchTo110Layout();

    showIndividualPatientPanel(pathwayId, pathwayStage, standard, patientId);
  };

  var formatStandard = function (standard) {
    if (!standard.id) { return standard.text; }
    var data = $(standard.element).data();
    // <i class="fa fa-smile-o" style="color:green"></i> OK
    // <i class="fa fa-flag" style="color:orange"></i> Improvement opportunity
    // Not relevant
    var standardHtml = '';
    //if diagnosis opportunity then not relevant for other stages
    //if no mention anywhere then not relevant for that disease
    switch(getPatientStatus(local.patientId, data.pathwayId, data.pathwayStage, data.standard)){
      case "ok":
        standardHtml = '<span class="standard-achieved" data-toggle="tooltip" data-placement="left" title="' + local.data[data.pathwayId][data.pathwayStage].standards[data.standard]["dropdown-tooltip"] + ' - STANDARD ACHIEVED">' + standard.text + ' <i class="fa fa-smile-o" style="color:green"></i></span>';
        break;
      case "missed":
        standardHtml = '<span class="standard-missed" data-toggle="tooltip" data-placement="left" title="' + local.data[data.pathwayId][data.pathwayStage].standards[data.standard]["dropdown-tooltip"] + ' - STANDARD MISSED">' + standard.text + ' <i class="fa fa-flag" style="color:red"></i></span>';
        break;
      case "not":
        standardHtml = '<span class="standard-not-relevant" data-toggle="tooltip" data-placement="left" title="' + local.data[data.pathwayId][data.pathwayStage].standards[data.standard]["dropdown-tooltip"] + ' - STANDARD NOT RELEVANT">' + standard.text + ' <i class="fa fa-meh-o" style="color:gray"></i></span>';
        break;
    }
    var $standard = $(standardHtml);
    return $standard;
  };

  var getPatientStatus = function(patientId, pathwayId, pathwayStage, standard){
    if(local.data.patients[patientId].breach){
      if(local.data.patients[patientId].breach.filter(function(val){
        return val.pathwayId===pathwayId && val.pathwayStage===pathwayStage && val.standard===standard;
      }).length>0) {
        return "missed";
      } else if(local.data.patients[patientId].breach.filter(function(val){
        return val.pathwayId===pathwayId && val.pathwayStage==="diagnosis";
      }).length>0 && pathwayStage!=="diagnosis"){
        return "not";
      } else if(local.data.patients[patientId].breach.filter(function(val){
        return val.pathwayId===pathwayId;
      }).length>0){
        return "ok";
      } else {
        return "not";
      }
    } else {
      return "not";
    }
  };

  var showIndividualPatientPanel = function(pathwayId, pathwayStage, standard, patientId){
    var stan = local.data[pathwayId][pathwayStage].standards[standard] ? local.data[pathwayId][pathwayStage].standards[standard].tab.title : "UNSPECIFIED";

    local.options.sort(function(a,b){
      a = getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if(a===b) return 0;
      if(a==="not") return 1;
      if(b==="not") return -1;
      if(a==="ok") return 1;
      if(b==="ok") return -1;
      alert("!!!!!!!");
    });

    var panel = createPanel($('#patient-panel'), {"options":local.options,"standard":stan,"pathwayStage" : pathwayStage, "nhsNumber" : local.patLookup ? local.patLookup[patientId] : patientId, "patientId" : patientId},{"option":$('#patient-panel-drop-down-options').html()});

    if(standard === null){
      //Must be a patient from the *** OK group
      standard = local.options.filter(function(val){return val.pathwayId===pathwayId && val.pathwayStage === pathwayStage;})[0].standard;
    }

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = createIndividualActionPlanPanel(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = createQualStanPanel(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = createTrendPanel(pathwayId, pathwayStage, standard, patientId);
    var medPanel = createMedicationPanel(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = createOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medPanel).append(codesPanel);

    if(farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(500, function(){
        $(this).html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpQualStan(pathwayId, pathwayStage, standard, patientId);
        wireUpStandardDropDown(pathwayId, pathwayStage, standard, showIndividualPatientPanel);
        wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
        //wireUpCodesPanel();
        drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        $(this).fadeIn(500, function(){});
      });
    } else {
      farRightPanel.html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpQualStan(pathwayId, pathwayStage, standard, patientId);
        wireUpStandardDropDown(pathwayId, pathwayStage, standard, showIndividualPatientPanel);
        wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
        drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        farRightPanel.fadeIn(500, function(){
      });
    }
  };

  //Show patient view from the all patient screen
  var showIndividualPatientView = function(pathwayId, pathwayStage, standard, patientId){
    local.patientId = patientId;

    local.options.sort(function(a,b){
      a = getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if(a===b) return 0;
      if(a==="not") return 1;
      if(b==="not") return -1;
      if(a==="ok") return 1;
      if(b==="ok") return -1;
      alert("!!!!!!!");
    });

    if(pathwayId===null){
      //Show patient but don't select
      var p = createPanel($('#patient-panel'), {"options":local.options, "nhsNumber" : local.patLookup ? local.patLookup[patientId] : patientId, "patientId" : patientId},{"option":$('#patient-panel-drop-down-options').html()});
      farRightPanel.html(p).show();
      farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');

      $('select').select2({templateResult: formatStandard, minimumResultsForSearch: Infinity, placeholder: "Please select an improvement opportunity area..."});
      $('span.select2-selection__rendered').attr("title","");
      $('select').on('change', function(){
        var data = $(this).find(':selected').data();
        showIndividualPatientView(data.pathwayId, data.pathwayStage, data.standard, local.patientId);
      }).on("select2:open", function (e) {
        wireUpTooltips();
      });
      return;
    }

    var panel = createPanel($('#patient-panel'), {"options":local.options,"standard":local.data[pathwayId][pathwayStage].standards[standard].tab.title,"pathwayStage" : pathwayStage, "nhsNumber" : local.patLookup ? local.patLookup[patientId] : patientId, "patientId" : patientId},{"option":$('#patient-panel-drop-down-options').html()});

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = createIndividualActionPlanPanel(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = createQualStanPanel(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = createTrendPanel(pathwayId, pathwayStage, standard, patientId);
    var medPanel = createMedicationPanel(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = createOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medPanel).append(codesPanel);

    if(farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(100, function(){
        $(this).html($('#temp-hidden').html());
          $('#temp-hidden').html("");
          wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
          wireUpQualStan(pathwayId, pathwayStage, standard, patientId);
          wireUpStandardDropDown(pathwayId, pathwayStage, standard, showIndividualPatientView);
          wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
          wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
          wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
          drawTrendChart(patientId, pathwayId, pathwayStage, standard);
          $(this).fadeIn(100, function(){
        });
      });
    } else {
        farRightPanel.html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpQualStan(pathwayId, pathwayStage, standard, patientId);
        wireUpStandardDropDown(pathwayId, pathwayStage, standard, showIndividualPatientView);
        wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
        wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
        drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        farRightPanel.fadeIn(100, function(){
      });
    }
  };

  var showAllPatientView = function(patientId, reload){
    $('#mainTitle').hide();
    updateTitle("List of all patients at your practice");

    if(!patientId) local.pathwayId="";
    if(!patientId || reload) {

      showMainView(local.diseases.length);

      switchTo110Layout();
      hideAllPanels();

      showAllPatientPanel(farLeftPanel);
      populateAllPatientPanel();
    }

    if(patientId){
      //showIndividualPatientView(local.data.patients[patientId].breach[0].pathwayId, local.data.patients[patientId].breach[0].pathwayStage,local.data.patients[patientId].breach[0].standard, patientId);
      showIndividualPatientView(null, null, null, patientId);
    }
  };

  //id is either "team" or the patientId
  var recordFeedback = function(pathwayId, id, suggestion, reason, reasonText ){
    local.reason = {"reason":reason, "reasonText":reasonText};
    var obj = getObj();

    var item = {"pathwayId": pathwayId, "id": id, "val" : suggestion};
    if(reasonText !== "") item.reasonText = reasonText;
    if(reason !== "") item.reason = reason;
    obj.feedback.push(item);
    setObj(obj);
  };

  var recordEvent = function(pathwayId, id, name) {
    var obj = getObj();
    obj.events.push({"pathwayId": pathwayId, "id": id, "name": name, "date": new Date()});
    setObj(obj);
  };

  var recordPlan = function(id, text, pathwayId){
    if(!id) alert("PLAN");
    var obj = getObj();

    if(!obj.actions[id]) obj.actions[id] = {};
    var planId = Date.now()+"";
    obj.actions[id][planId] = {"text":text, "agree":null, "done":false, "pathwayId" : pathwayId, "history" : ["You added this on " + (new Date()).toDateString()]};

    setObj(obj);
    return planId;
  };

  var findPlan = function(obj, planId){
    for(var k in obj.actions){
      if(obj.actions[k][planId] && obj.actions[k][planId].text) return k;
    }
    return -1;
  };

  var editPlan = function(planId, text, done){
    var obj = getObj();
    var id = findPlan(obj, planId);
    if(text) obj.actions[id][planId].text = text;
    if(done===true || done===false) obj.actions[id][planId].done = done;
    setObj(obj);
  };

  var deletePlan = function(planId){
    var obj = getObj();
    var id = findPlan(obj, planId);
    delete obj.actions[id][planId];
    setObj(obj);
  };

  var listPlans = function(id, pathwayId){
    var obj = getObj(), arr = [];
    if(!id) return obj.actions;
    for(var prop in obj.actions[id]){
      obj.actions[id][prop].id = prop;
      if((!pathwayId || pathwayId === obj.actions[id][prop].pathwayId) && obj.actions[id][prop].text) arr.push(obj.actions[id][prop]);
    }
    return arr;
  };

  var getReason = function(id, actionId){
    var obj = getObj();

    if(obj.actions[id] && obj.actions[id][actionId]) return obj.actions[id][actionId].reason;
    return null;
  };

  var editAction = function(id, actionId, agree, done, reason){
    var obj = getObj(), log;
    if(!id) alert("ACTION TEAM/IND ID");
    if(!actionId) alert("ACTION ID");

    if(!obj.actions[id]) {
      obj.actions[id] = {};
    }


    if(agree) {
      log = "You agreed with this suggested action on " + (new Date()).toDateString();
    } else if(agree===false) {
      var reasonText = local.reason.reason === "" && local.reason.reasonText === "" ? " - no reason given" : " . You disagreed because you said: '" + local.reason.reason + "; " + local.reason.reasonText +".'";
      log = "You disagreed with this action on " + (new Date()).toDateString() + reasonText;
    }

    if(done) {
      log = "You agreed with this suggested action on " + (new Date()).toDateString();
    }

    if(!obj.actions[id][actionId]) {
      obj.actions[id][actionId] = {"agree" : agree ? agree : false, "done" : done ? done : false, "history" : [log]};
    } else {
      if(agree===true || agree===false) obj.actions[id][actionId].agree=agree;
      if(done===true || done===false) obj.actions[id][actionId].done=done;
      if(log){
        if(obj.actions[id][actionId].history) obj.actions[id][actionId].history.unshift(log);
        else obj.actions[id][actionId].done.history = [log];
      }
    }

    if(reason && obj.actions[id][actionId].agree === false){
      obj.actions[id][actionId].reason = reason;
    } else {
      delete obj.actions[id][actionId].reason;
    }

    setObj(obj);
    showSaved();
  };

  var ignoreAction = function(id, actionId){
    var obj = getObj();
    obj.actions[id][actionId].agree=null;
    delete obj.actions[id][actionId].reason;
    //obj.actions[id][actionId].done=null;
    setObj(obj);
  };

  var listActions = function(id, pathwayId){
    var obj = getObj(), arr = [];
    if(!id) return obj.actions;
    if(!obj.actions[id]) return arr;
    for(var prop in obj.actions[id]){
      obj.actions[id][prop].id = prop;
      if(!obj.actions[id][prop].text)
        arr.push(obj.actions[id][prop]);
    }
    return arr;
  };

  var getAgreeReason = function(pathwayId, pathwayStage, standard, patientId, item) {
    var obj = getObj();
    if(!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if(!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val){
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    return items.length===1 ? items[0].reason || {} : {};
  };

  var editPatientAgree = function(pathwayId, pathwayStage, standard, patientId, item, agree, reason){
    var obj = getObj();
    if(!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if(!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val){
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    var log = "You " + (agree ? "" : "dis") + "agreed with this on " + (new Date()).toDateString();

    if(items.length===1) {
      items[0].agree = agree;
      items[0].history.push(log);
      items[0].reason = reason;
    } else if(items.length==0){
      obj.agrees[patientId].push({"pathwayId":pathwayId, "pathwayStage":pathwayStage, "standard": standard,"item":item, "agree":agree, "reason":reason, "history" : [log]});
    } else {
      console.log("ERRORRR!!!!!!!");
    }

    setObj(obj);
    showSaved();
  };

  var getPatientAgreeObject = function(pathwayId, pathwayStage, standard, patientId, item){
    var obj = getObj();
    if(!pathwayId || !pathwayStage) alert("EDITPATIENTAGREE");

    if(!obj.agrees[patientId]) obj.agrees[patientId] = [];
    var items = obj.agrees[patientId].filter(function(val){
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });
    if(items.length===1) return items[0];
    return {};
  };

  var getPatientAgree = function(pathwayId, pathwayStage, standard, patientId, item){
    var obj = getObj();

    if(!obj.agrees[patientId]) return null;
    var item = obj.agrees[patientId].filter(function(val){
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard && val.item === item;
    });

    if(item.length===1) {
        return item[0].agree;
    }
    return null;
  };

	/**************
	 *** Layout ***
	 **************/

  var switchTo121Layout = function(){
    if(local.layout === "121") return;
    local.layout === "121";
    farLeftPanel.removeClass('col-lg-6').addClass('col-lg-3').show();
    topPanel.hide();
    topLeftPanel.removeClass('col-xl-6').html("").hide();
    bottomLeftPanel.removeClass('col-xl-6').html("").hide();
    topRightPanel.addClass('col-xl-12').removeClass('col-xl-6').show();
    bottomRightPanel.addClass('col-xl-12').removeClass('col-xl-6').show();
    midPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
    farRightPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
  };

  var switchTo110Layout = function(){
    if(local.layout === "110") return;
    local.layout === "110";
    farLeftPanel.removeClass('col-lg-3').addClass('col-lg-6').show();
    topPanel.hide();
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    midPanel.hide();
    farRightPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
  };

  var switchTo120Layout = function(){
    if(local.layout === "120") return;
    local.layout === "120";
    farLeftPanel.removeClass('col-lg-6').addClass('col-lg-3').show();
    topPanel.hide();
    topLeftPanel.removeClass('col-xl-6').html("").hide();
    bottomLeftPanel.removeClass('col-xl-6').html("").hide();
    topRightPanel.addClass('col-xl-12').removeClass('collg-6').show();
    bottomRightPanel.addClass('col-xl-12').removeClass('col-xl-6').show();
    midPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
    farRightPanel.hide();
  };

	var switchTo221Layout = function(){
    if(local.layout === "221") return;
    local.layout === "221";
    farLeftPanel.hide();
    topPanel.hide();
    topLeftPanel.addClass('col-xl-6').show();
    bottomLeftPanel.addClass('col-xl-6').show();
    topRightPanel.removeClass('col-xl-12').addClass('col-xl-6').show();
    bottomRightPanel.removeClass('col-xl-12').addClass('col-xl-6').show();
    midPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
    farRightPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
	};

  var updateTitle = function(title, tooltip){
    $('.pagetitle').html(title).attr('title', tooltip).tooltip({delay: { "show": 500, "hide": 100 }});
  }

	var showSidePanel = function() {
    if(local.elements.navigtion) return;
    local.elements.navigtion=true;
		$('#main').addClass('content');
		$('#topnavbar').addClass('full');
		$('#aside-toggle').show();
		$('#bottomnavbar').hide();
	};

	var hideSidePanel = function() {
    if(local.elements.navigtion===false) return;
    local.elements.navigtion=false;
		$('#main').removeClass('content');
		$('#topnavbar').removeClass('full');
		$('#aside-toggle').hide();
		$('#bottomnavbar').show();
	};

  var showHeaderBarItems = function() {
    if(local.elements.headerbar) return;
    local.elements.headerbar = true;
    $('.hide-if-logged-out').show();
  };

  var hideHeaderBarItems = function() {
    if(local.elements.headerbar===false) return;
    local.elements.headerbar = false;
    $('.hide-if-logged-out').hide();
  };

	/**************
	 *** Panels ***
	 **************/

  var hideAllPanels = function(){
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    farLeftPanel.hide();
    farRightPanel.hide();
    topPanel.hide();
  };

	var createPanel = function(templateSelector, data, templates){
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
    return rendered;
	};

	var createPanelShow = function(templateSelector, panelSelector, data, templates){
		var rendered = createPanel(templateSelector, data, templates);
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
		var percentChange = local.data[local.pathwayId].monitoring.trend[1][1]-local.data[local.pathwayId].monitoring.trend[1][30];
		var numberChange = local.data[local.pathwayId].monitoring.trend[2][1]-local.data[local.pathwayId].monitoring.trend[2][30];

    var standards = [];
    for(var key in local.data[local.pathwayId].monitoring.standards){
      var num = removeDuplicates(local.data[local.pathwayId].monitoring.standards[key].opportunities.reduce(function(a,b){
        return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
      })).length;
      var denom = num + local.data[local.pathwayId].monitoring.patientsOk.length;
      standards.push({
        "standard" : local.data[local.pathwayId].monitoring.standards[key].tab.title,
        "tooltip" : local.data[local.pathwayId].monitoring.standards[key]["standard-met-tooltip"],
        "numerator":num,
        "denominator":denom,
        "percentage": (num*100/denom).toFixed(0)
      });
    }

		createPanelShow(monitoringPanel, location, {
			percent: local.data[local.pathwayId].monitoring.trend[1][1],
			percentChange: Math.abs(percentChange),
			percentUp: percentChange>=0,
			number: local.data[local.pathwayId].monitoring.trend[2][1],
			numberUp: numberChange>=0,
			numberChange: Math.abs(numberChange),
      pathway: local.pathwayNames[local.pathwayId],
      pathwayNameShort: local.pathwayId,
      title: local.data[local.pathwayId].monitoring.text.panel.text,
      standards: standards
    }, /*{"change-bar": $('#change-bar').html(), */{"row": $('#overview-panel-table-row').html()}
		);

    $('#monitoring-trend-toggle').on('click', function(e){
      if($(this).text()==="Trend"){
        $(this).text("Table");
        $('#monitoring-chart-table').hide();
        $('#monitoring-chart').show();
      } else {
        $(this).text("Trend");
        $('#monitoring-chart-table').show();
        $('#monitoring-chart').hide();
      }
      e.stopPropagation();
    });

		destroyCharts(['monitoring-chart']);
    setTimeout(function(){
  		local.charts["monitoring-chart"] = c3.generate({
  			bindto: '#monitoring-chart',
  			data: {
  				x: 'x',
  				columns: local.data[local.pathwayId].monitoring.trend/*,
  				axes: {
  					"%" : 'y',
  					"n" : 'y2'
  				}*/
  			},
        zoom: {
            enabled: true
        },
        tooltip: {
          format: {
            title: function (x) { return x.toDateString() + (enableHover ? '<br>Click for more detail' : ''); },
            value: function (value) { return  enableHover ? value+'%':undefined;}
          }
        },
  			axis: {
  				x: {
  					type: 'timeseries',
  					tick: {
  						format: '%d-%m-%Y',
  						count: 7,
  						culling: {
  							max: 4
  						}
  					},
            label: {
              text: 'Date',
              position: 'outer-center'
            }
  				},
  				y : {
  					min : 0,
            label: {
              text: 'Proportion (%)',
              position: 'outer-middle'
            }
  				}/*,
  				y2: {
  					show: true,
  					min: 0,
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
  				}*/
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
    },1);
	};

	var showTreatmentPanel = function(location, enableHover) {
		var percentChange = local.data[local.pathwayId].treatment.trend[1][1]-local.data[local.pathwayId].treatment.trend[1][30];
		var numberChange = local.data[local.pathwayId].treatment.trend[2][1]-local.data[local.pathwayId].treatment.trend[2][30];

    var standards = [];
    for(var key in local.data[local.pathwayId].treatment.standards){
      var num = removeDuplicates(local.data[local.pathwayId].treatment.standards[key].opportunities.reduce(function(a,b){
        return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
      })).length;
      var denom = num + local.data[local.pathwayId].treatment.patientsOk.length;
      standards.push({
        "standard" : local.data[local.pathwayId].treatment.standards[key].tab.title,
        "tooltip" : local.data[local.pathwayId].treatment.standards[key]["standard-met-tooltip"],
        "numerator":num,
        "denominator":denom,
        "percentage": (num*100/denom).toFixed(0)
      });
    }

		createPanelShow(treatmentPanel, location, {
			percent: local.data[local.pathwayId].treatment.trend[1][1],
			percentChange: Math.abs(percentChange),
			percentUp: percentChange>=0,
			number: local.data[local.pathwayId].treatment.trend[2][1],
			numberUp: numberChange>=0,
			numberChange: Math.abs(numberChange),
      pathway: local.pathwayNames[local.pathwayId],
      pathwayNameShort: local.pathwayId,
      title: local.data[local.pathwayId].treatment.text.panel.text,
      standards: standards
    }, /*{"change-bar": $('#change-bar').html(),*/ {"row": $('#overview-panel-table-row').html()}
  		);

    $('#treatment-trend-toggle').on('click', function(e){
      if($(this).text()==="Trend"){
        $(this).text("Table");
        $('#treatment-chart-table').hide();
        $('#treatment-chart').show();
      } else {
        $(this).text("Trend");
        $('#treatment-chart-table').show();
        $('#treatment-chart').hide();
      }
      e.stopPropagation();
    });

		destroyCharts(['treatment-chart']);
    setTimeout(function(){
  		local.charts["treatment-chart"] = c3.generate({
  			bindto: '#treatment-chart',
  			data: {
  				x: 'x',
  				columns: local.data[local.pathwayId].treatment.trend/*,
  				axes: {
  					"%" : 'y',
  					"n" : 'y2'
  				}*/
  			},
        zoom: {
            enabled: true
        },
        tooltip: {
          format: {
            title: function (x) { return x.toDateString() + (enableHover ? '<br>Click for more detail' : ''); },
            value: function (value) { return  enableHover ? value+'%':undefined;}
          }
        },
  			axis: {
  				x: {
  					type: 'timeseries',
  					tick: {
  						format: '%d-%m-%Y',
  						count: 7,
  						culling: {
  							max: 4
  						}
  					},
            label: {
              text: 'Date',
              position: 'outer-center'
            }
  				},
  				y : {
  					min : 0,
            label: {
              text: 'Proportion (%)',
              position: 'outer-middle'
            }
  				}/*,
  				y2: {
  					show: true,
  					min: 0,
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
  				}*/
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
    },1);
	};

	var showDiagnosisPanel = function(location, enableHover) {

    var standards = [];
    for(var key in local.data[local.pathwayId].diagnosis.standards){
      var num = removeDuplicates(local.data[local.pathwayId].diagnosis.standards[key].opportunities.reduce(function(a,b){
        return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
      })).length;
      var denom = num + local.data[local.pathwayId].diagnosis.patientsOk.length;
      standards.push({
        "standard" : local.data[local.pathwayId].diagnosis.standards[key].tab.title,
        "tooltip" : local.data[local.pathwayId].diagnosis.standards[key]["standard-met-tooltip"],
        "numerator":num,
        "denominator":denom,
        "percentage": (num*100/denom).toFixed(0)
      });
    }

		createPanelShow(diagnosisPanel, location, {
      pathway: local.pathwayNames[local.pathwayId],
      pathwayNameShort: local.pathwayId,
      title: local.data[local.pathwayId].diagnosis.text.panel.text,
      number: local.data[local.pathwayId].diagnosis.n,
			numberUp: local.data[local.pathwayId].diagnosis.change>=0,
			numberChange: Math.abs(local.data[local.pathwayId].diagnosis.change),
      standards: standards
    }, /*{"change-bar-number": $('#change-bar-number').html(),*/ {"row": $('#overview-panel-table-row').html()}
		);

    $('#diagnosis-trend-toggle').on('click', function(e){
      if($(this).text()==="Trend"){
        $(this).text("Table");
        $('#diagnosis-chart-table').hide();
        $('#diagnosis-chart').show();
      } else {
        $(this).text("Trend");
        $('#diagnosis-chart-table').show();
        $('#diagnosis-chart').hide();
      }
      e.stopPropagation();
    });

    destroyCharts(['diagnosis-chart']);
    setTimeout(function(){
  		local.charts["diagnosis-chart"] = c3.generate({
  			bindto: '#diagnosis-chart',
  			data: {
  				x: 'x',
  				columns: local.data[local.pathwayId].diagnosis.trend/*,
  				axes: {
  					"%" : 'y',
  					"n" : 'y2'
  				}*/
  			},
        zoom: {
            enabled: true
        },
        tooltip: {
          format: {
            title: function (x) { return x.toDateString() + (enableHover ? '<br>Click for more detail' : ''); },
            value: function (value) { return  enableHover ? value+'%':undefined;}
          }
        },
  			axis: {
  				x: {
  					type: 'timeseries',
  					tick: {
  						format: '%d-%m-%Y',
  						count: 7,
  						culling: {
  							max: 4
  						}
  					},
            label: {
              text: 'Date',
              position: 'outer-center'
            }
  				},
  				y : {
  					min : 0,
            label: {
              text: 'Proportion (%)',
              position: 'outer-middle'
            }
  				}/*,
  				y2: {
  					show: true,
  					min: 0,
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
  				}*/
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
    },1);
	};

	var showExclusionsPanel = function(location, enableHover) {

    var standards = [];
    for(var key in local.data[local.pathwayId].exclusions.standards){
      var num = removeDuplicates(local.data[local.pathwayId].exclusions.standards[key].opportunities.reduce(function(a,b){
        return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
      })).length;
      var denom = num + local.data[local.pathwayId].exclusions.patientsOk.length;
      standards.push({
        "standard" : local.data[local.pathwayId].exclusions.standards[key].tab.title,
        "tooltip" : local.data[local.pathwayId].exclusions.standards[key]["standard-met-tooltip"],
        "numerator":num,
        "denominator":denom,
        "percentage": (num*100/denom).toFixed(0)
      });
    }

		createPanelShow(exclusionPanel, location, {
      pathway: local.pathwayNames[local.pathwayId],
      pathwayNameShort: local.pathwayId,
      title: local.data[local.pathwayId].exclusions.text.panel.text,
      number: local.data[local.pathwayId].exclusions.n,
			numberUp: local.data[local.pathwayId].exclusions.change>=0,
			numberChange: Math.abs(local.data[local.pathwayId].exclusions.change),
      standards: standards
    },/* {"change-bar-number": $('#change-bar-number').html(), */{"row": $('#overview-panel-table-row').html()}
		);

    $('#exclusion-trend-toggle').on('click', function(e){
      if($(this).text()==="Trend"){
        $(this).text("Table");
        $('#exclusion-chart-table').hide();
        $('#exclusion-chart').show();
      } else {
        $(this).text("Trend");
        $('#exclusion-chart-table').show();
        $('#exclusion-chart').hide();
      }
      e.stopPropagation();
    });

    destroyCharts(['exclusion-chart']);
    setTimeout(function(){
  		local.charts["exclusion-chart"] = c3.generate({
  			bindto: '#exclusion-chart',
  			data: {
  				x: 'x',
  				columns: local.data[local.pathwayId].exclusions.trend/*,
  				axes: {
  					"%" : 'y',
  					"n" : 'y2'
  				}*/
  			},
        zoom: {
            enabled: true
        },
        tooltip: {
          format: {
            title: function (x) { return x.toDateString() + (enableHover ? '<br>Click for more detail' : ''); },
            value: function (value) { return  enableHover ? value+'%':undefined;}
          }/*,
          position: function (data, width, height, element) {
            console.log(data,width, height, element);
            return {top: height};
          }*/
        },
  			axis: {
  				x: {
  					type: 'timeseries',
  					tick: {
  						format: '%d-%m-%Y',
  						count: 7,
  						culling: {
  							max: 4
  						}
  					},
            label: {
              text: 'Date',
              position: 'outer-center'
            }
  				},
  				y : {
  					min : 0,
            label: {
              text: 'Proportion (%)',
              position: 'outer-middle'
            }
  				}/*,
  				y2: {
  					show: true,
  					min: 0,
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
  				}*/
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
    },1);
	};

  var showPatientDropdownPanel = function(location){
    createPanelShow($('#patient-dropdown-panel'),location, {"patients" : Object.keys(local.data.patients)});
  };

  var createPatientPanel = function(pathwayId, pathwayStage, standard){
    var tabData = [];
    for(var key in local.data[pathwayId][pathwayStage].standards){
      tabData.push({"header": local.data[pathwayId][pathwayStage].standards[key].tab, "active" : key===standard ,"url": window.location.hash.replace(/\/no.*/g,'\/no/'+key)});
    }
    return createPanel(patientsPanelTemplate,{"pathwayStage" : pathwayStage,"header": local.data[pathwayId][pathwayStage].standards[standard].chartTitle,"tooltip":local.data[pathwayId][pathwayStage].standards[standard].tooltip,"url":window.location.hash.replace(/\/yes.*/g,'').replace(/\/no.*/g,''), "tabs": tabData, "text" : local.data[pathwayId][pathwayStage].text},{"content" : $('#patients-panel-no').html(),"tab-header" : $('#patients-panel-no-tabs').html(),"tab-content" : $('#patients-panel-no-page').html()});
  };

  var createPatientPanelOk = function(pathwayId, pathwayStage){
    return createPanel(patientsPanelTemplate,{"ok": true, "pathwayStage" : pathwayStage,"url":window.location.hash.replace(/\/yes/g,'').replace(/\/no/g,''), "text" : local.data[pathwayId][pathwayStage].text},{"content" : $('#patients-panel-yes').html()});
  };

  var wireUpPatientPanel = function(pathwayId, pathwayStage, location, standard){
    patientsPanel = $('#patients');

		patientsPanel.on('click', 'thead tr th.sortable', function(){	//Sort columns when column header clicked
			var sortAsc = !$(this).hasClass('sort-asc');
			if(sortAsc) {
				$(this).removeClass('sort-desc').addClass('sort-asc');
			} else {
				$(this).removeClass('sort-asc').addClass('sort-desc');
			}
			populatePatientPanel(pathwayId, local.selected, standard, local.subselected, $(this).index(), sortAsc);
		}).on('click', 'tbody tr', function(e){	//Select individual patient when row clicked
      clearBox();
			$('.list-item').removeClass('highlighted');
			$(this).addClass('highlighted').removeAttr("title");

      var patientId = $(this).find('td button').attr('data-patient-id');

      showPathwayStagePatientView(patientId, pathwayId, local.selected, standard);

			e.preventDefault();
      e.stopPropagation();
		}).on('click', 'tbody tr button', function(e){
			//don't want row selected if just button pressed?
			e.preventDefault();
			e.stopPropagation();
		});

    local.selected = pathwayStage;
    local.subselected = null;

		location.off('click','#chart-panel');
		location.on('click', '#chart-panel', function(){
			if(!local.chartClicked){
        /*jshint unused: true*/
				$('path.c3-bar').attr('class', function(index, classNames) {
					return classNames.replace(/_unselected_/g, '');
				});
        /*jshint unused: false*/

				if(local.charts['breakdown-chart']) local.charts['breakdown-chart'].unselect();

        populatePatientPanel(pathwayId, pathwayStage, standard, null);
        local.subselected = null;

        farRightPanel.fadeOut(200);
				//hideAllPanels();
			}
			local.chartClicked=false;
		});

		destroyCharts(['breakdown-chart']);
    setTimeout(function(){
  		local.charts['breakdown-chart'] = c3.generate({
  			bindto: '#breakdown-chart',
  			tooltip: {
  				format: {
            name: function (name,a,b) {
              var text=local.data[pathwayId][pathwayStage].standards[standard].opportunities[local.index].desc;
              var html = "";
              while(text.length>40) {
                if(text.indexOf(' ', 40) < 0) break;
                html += text.substr(0,text.indexOf(' ', 40)) + '<br>';
                text = text.substr(text.indexOf(' ', 40)+1);
              }
              html += text;
              return html;
            },
  					value: function (value, ratio, id, index) {
              local.index = index;
  						return value;
  					}
  				}
  			},
  			data: {
  				columns: [
            ["Patients"].concat(local.data[pathwayId][pathwayStage].standards[standard].opportunities.map(function(val){return val.patients.length;}))
          ],
  				type: 'bar',
          labels: true,
          color: function (color, d) {
            return local.colors[d.index];
          },
          selection:{
            enabled: true
          },
  				onclick: function (d) {
  					selectPieSlice('breakdown-chart', d);
  					populatePatientPanel(pathwayId, pathwayStage, standard, local.data[pathwayId][pathwayStage].standards[standard].opportunities[d.index].name);
  					local.subselected = local.data[pathwayId][pathwayStage].standards[standard].opportunities[d.index].name;

            //colour table appropriately - need to add opacity
            var sliceColourHex = local.colors[d.index];
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            sliceColourHex = sliceColourHex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sliceColourHex);
            var opacity = 0.2;
            var sliceColour = 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ',' + opacity + ')';

            $('.table.patient-list.table-head-hidden').css({"backgroundColor": sliceColour});
  				}
  			},
        bar: {
          width: {
            ratio: 0.5
          }
        },
  			legend: {
  				show: false
  			},
        grid:{
          focus: {
              show:false
          }
        },
        axis: {
  				x: {
  					type: 'category',
  					categories: local.data[pathwayId][pathwayStage].standards[standard].opportunities.map(function(val){return val.name;}),
            label: false/*{
              show: false,
              text: 'Disease',
              position: 'outer-center'
            }*/
  				},
          y : {
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
          }
  			}
  		});
    },1);
  };

  var wireUpPatientPanelOk = function(pathwayId, pathwayStage, location){
    patientsPanel = $('#patients');

		patientsPanel.on('click', 'thead tr th.sortable', function(){	//Sort columns when column header clicked
			var sortAsc = !$(this).hasClass('sort-asc');
			if(sortAsc) {
				$(this).removeClass('sort-desc').addClass('sort-asc');
			} else {
				$(this).removeClass('sort-asc').addClass('sort-desc');
			}
			populatePatientPanelOk(pathwayId, local.selected, local.subselected, $(this).index(), sortAsc);
		}).on('click', 'tbody tr', function(e){	//Select individual patient when row clicked
      clearBox();
			$('.list-item').removeClass('highlighted');
			$(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      showPathwayStagePatientView(patientId, pathwayId, local.selected, null);
			e.preventDefault();
      e.stopPropagation();
		}).on('click', 'tbody tr button', function(e){
			//don't want row selected if just button pressed?
			e.preventDefault();
			e.stopPropagation();
		});

    local.selected = pathwayStage;
    local.subselected = null;
  };

  var showAllPatientPanel = function(location) {
		createPanelShow($('#all-patients-panel'),location, {"n" : getAllPatients().length});

		patientsPanel = $('#patients');

		patientsPanel.on('click', 'tbody tr', function(e){	//Select individual patient when row clicked
      clearBox();
			$('.list-item').removeClass('highlighted');
			$(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      showAllPatientView(patientId);

			e.preventDefault();
			e.stopPropagation();
		}).on('click', 'tbody tr button', function(e){
			//don't want row selected if just button pressed?
			e.preventDefault();
			e.stopPropagation();
		});

    /*var c = patientsPanel.getNiceScroll();
    if(c && c.length>0){
      c.resize();
    } else {
      patientsPanel.niceScroll({
  			cursoropacitymin: 0.3,
  			cursorwidth: "7px",
  			horizrailenabled: false
  		});
    }*/
	};

  var showTeamActionPlanPanel = function(location){
    createPanelShow($('#team-action-plan-panel'),location);

		suggestedPlanTeam = $('#suggestedPlanTeam');

		suggestedPlanTeam.on('click', '.cr-styled input[type=checkbox]', function(){
      var ACTIONID = $(this).closest('tr').data('id');
      editAction("team", ACTIONID, null, this.checked);

      if(this.checked) {
        recordEvent(local.pathwayId, "team", "Item completed");
        var self = this;
        $(self).parent().attr("title","").attr("data-original-title","").tooltip('fixTitle').tooltip('hide');
        wireUpTooltips();
        setTimeout(function(e){
          $(self).parent().fadeOut(300, function(){
            var parent = $(this).parent();
            $(this).replaceWith(createPanel($('#checkbox-template'),{"done":true}));
            parent.find('button').on('click', function(){
              ACTIONID = $(this).closest('tr').data('id');
              editAction("team", ACTIONID, null, false);
              $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
              updateTeamSapRows();
            });
          });
        },1000);
      }

			updateTeamSapRows();
		});

    $('#personalPlanTeam').on('click', 'input[type=checkbox]', function(){
			var PLANID = $(this).closest('tr').data("id");
      editPlan(PLANID, null, this.checked);

      if(this.checked){
        $(this).parent().parent().parent().addClass('success');
        recordEvent(local.pathwayId, "team", "Personal plan item");
        var self = this;
        $(self).parent().attr("title","").attr("data-original-title","").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e){
          $(self).parent().fadeOut(300, function(){
            var parent = $(this).parent();
            $(this).replaceWith(createPanel($('#checkbox-template'),{"done":true}));
            wireUpTooltips();
            parent.find('button').on('click', function(){
              PLANID = $(this).closest('tr').data('id');
              editPlan("team", PLANID, null, false);
              $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
              updateTeamSapRows();
            });
          });
        },1000);
      }

		}).on('click', '.btn-undo', function(e){
      var PLANID = $(this).closest('tr').data('id');
      editPlan(PLANID, null, false);
      $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
      updateTeamSapRows();
      e.stopPropagation();
    });

    var teamTab = $('#tab-plan-team'),  current;
		teamTab.on('click', '.edit-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('shown.bs.modal').on('shown.bs.modal', function () {
        $('#editActionPlanItem').focus();
      }).off('click','.save-plan').on('click', '.save-plan',function(){

        editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup','#editActionPlanItem').on('keyup', '#editActionPlanItem',function(e){
        if(e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
		}).on('click', '.delete-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#team-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('click','.delete-plan').on('click', '.delete-plan',function(){
        deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
		}).on('click', '.add-plan', function(){
      recordPlan("team", $(this).parent().parent().find('textarea').val(), local.pathwayId);

			displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
		}).on('change', '.btn-toggle input[type=checkbox]', function(){
      updateTeamSapRows();
    }).on('click', '.btn-undo', function(e){
      var ACTIONID = $(this).closest('tr').data('id');
      editAction("team", ACTIONID, null, false);
      $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
      updateTeamSapRows();
    }).on('click', '.btn-yes,.btn-no', function(e){
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')){
        //unselecting
        if(checkbox.val()==="no"){
          launchTeamModal(local.selected, checkbox.closest('tr').children().first().children().first().text(), getReason("team", ACTIONID), true, function(){
            editAction("team", ACTIONID, false, null, local.reason);
            updateTeamSapRows();
            wireUpTooltips();
          }, null,function(){
            ignoreAction("team", ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            updateTeamSapRows();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          ignoreAction("team", ACTIONID);
          other.removeClass("inactive");
        }
      } else if((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if(checkbox.val()==="no") {
          launchTeamModal(local.selected, checkbox.closest('tr').children().first().children().first().text(), getReason("team", ACTIONID), false, function(){
            editAction("team", ACTIONID, false, null, local.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked","checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            updateTeamSapRows();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        }
        else {
          editAction("team", ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
		}).on('keyup', 'input[type=text]', function(e){
      if(e.which === 13) {
        teamTab.find('.add-plan').click();
      }
    });

    populateTeamSuggestedActionsPanel();
  };

  var createIndividualActionPlanPanel = function(pathwayStage) {
    return createPanel($('#individual-action-plan-panel'),{"pathwayStage" : pathwayStage || "default", "noHeader" : true});
  };

  var createIndividualActionPlanPanelShow = function(location, pathwayStage) {
    createPanelShow($('#individual-action-plan-panel'),location,{"pathwayStage" : pathwayStage || "default", "noHeader" : true});
  };

  var wireUpIndividualActionPlanPanel = function(pathwayId, pathwayStage, standard, patientId) {
    individualTab = $('#tab-plan-individual');

    $('#advice-list').on('click', '.cr-styled input[type=checkbox]', function(){
      var ACTIONID = $(this).closest('tr').data('id');
      editAction(local.patientId, ACTIONID, null, this.checked);

      if(this.checked) {
        recordEvent(pathwayId, local.patientId, "Item completed");
        var self = this;
        $(self).parent().attr("title","").attr("data-original-title","").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e){
          $(self).parent().fadeOut(300, function(){
            var parent = $(this).parent();
            $(this).replaceWith(createPanel($('#checkbox-template'),{"done":true}));
            wireUpTooltips();
            parent.find('button').on('click', function(){
              ACTIONID = $(this).closest('tr').data('id');
              editAction(local.patientId, ACTIONID, null, false);
              $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
              updateIndividualSapRows();
            });
          });
        },1000);
      }

      updateIndividualSapRows();
    });

    $('#personalPlanIndividual').on('click', 'input[type=checkbox]', function(){
      var PLANID = $(this).closest('tr').data("id");
      editPlan(PLANID, null, this.checked);

      if(this.checked){
        $(this).parent().parent().parent().addClass('success');
        recordEvent(pathwayId, local.patientId, "Personal plan item");
        var self = this;
        $(self).parent().attr("title","").attr("data-original-title","").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e){
          $(self).parent().fadeOut(300, function(){
            var parent = $(this).parent();
            $(this).replaceWith(createPanel($('#checkbox-template'),{"done":true}));
            wireUpTooltips();
            parent.find('button').on('click', function(){
              PLANID = $(this).closest('tr').data('id');
              editPlan(local.patientId, PLANID, null, false);
              $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
              updateIndividualSapRows();
            });
          });
        },1000);
      }
    }).on('click', '.btn-undo', function(e){
      var PLANID = $(this).closest('tr').data('id');
      editPlan(PLANID, null, false);
      $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
      updateIndividualSapRows();
      e.stopPropagation();
    });

    individualTab.on('click', '.edit-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        displayPersonalisedIndividualActionPlan(local.patientId, $('#personalPlanIndividual'));
      }).off('shown.bs.modal').on('shown.bs.modal', function () {
        $('#editActionPlanItem').focus();
      }).off('click','.save-plan').on('click', '.save-plan',function(){

        editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup','#editActionPlanItem').on('keyup', '#editActionPlanItem',function(e){
        if(e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#individual-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        displayPersonalisedIndividualActionPlan(local.patientId, $('#personalPlanIndividual'));
      }).off('click','.delete-plan').on('click', '.delete-plan',function(){
        deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.add-plan', function(){
      recordPlan(local.patientId, $(this).parent().parent().find('textarea').val(), pathwayId);

      displayPersonalisedIndividualActionPlan(local.patientId, $('#personalPlanIndividual'));
    }).on('change', '.btn-toggle input[type=checkbox]', function(){
      updateIndividualSapRows();
    }).on('click', '.btn-undo', function(e){
      var ACTIONID = $(this).closest('tr').data('id');
      editAction(local.patientId, ACTIONID, null, false);
      $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
      updateIndividualSapRows();
    }).on('click', '.btn-yes,.btn-no', function(e){
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')){
        //unselecting
        if(checkbox.val()==="no"){
          launchPatientActionModal(local.selected, checkbox.closest('tr').children().first().children().first().text(), getReason(local.patientId, ACTIONID), true, function(){
            editAction(local.patientId, ACTIONID, false, null, local.reason);
            updateIndividualSapRows();
            wireUpTooltips();
          }, null,function(){
            ignoreAction(local.patientId, ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            updateIndividualSapRows();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          ignoreAction(local.patientId, ACTIONID);
          other.removeClass("inactive");
        }
      } else if((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if(checkbox.val()==="no") {
          launchPatientActionModal(local.selected, checkbox.closest('tr').children().first().children().first().text(), getReason(local.patientId, ACTIONID), false, function(){
            editAction(local.patientId, ACTIONID, false, null, local.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked","checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            updateIndividualSapRows();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        }
        else {
          editAction(local.patientId, ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    }).on('keyup', 'input[type=text]', function(e){
      if(e.which === 13) {
        individualTab.find('.add-plan').click();
      }
    });

    populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard);
  };

	var showIndividualActionPlanPanel = function(location, pathwayId, pathwayStage, standard, patientId) {
    createIndividualActionPlanPanelShow(location, pathwayStage);
    wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
	};

  var createQualStanPanel = function(pathwayId, pathwayStage, standard, patientId){
    var data = {"nhsNumber" : local.patLookup ? local.patLookup[patientId] : patientId, "patientId" : patientId};
    data.standard = local.pathwayNames[pathwayId] + ' - ' + pathwayStage;
    if(local.data.patients[patientId].standards && local.data.patients[patientId].standards[pathwayId]
      && local.data.patients[patientId].standards[pathwayId][pathwayStage]
      && local.data.patients[patientId].standards[pathwayId][pathwayStage][standard]){
        data.standard = local.data.patients[patientId].standards[pathwayId][pathwayStage][standard];
    }

    data.tooltip = local.data[pathwayId][pathwayStage].standards[standard].tab.tooltip;

    switch(getPatientStatus(patientId, pathwayId, pathwayStage, standard)){
      case "ok":
        farRightPanel.removeClass('standard-missed-page').addClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        data.achieved = true;
        data.relevant = true;
        break;
      case "missed":
        farRightPanel.addClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        data.relevant = true;
        data.achieved = false;
        break;
      case "not":
        farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').addClass('standard-not-relevant-page');
        data.relevant = false;
        break;
    }

    var agObj = getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "standard");
    if(agObj && agObj.agree) data.agree = true;
    else if(agObj && agObj.agree===false) data.disagree = true;

    return createPanel($('#qual-standard'), data);
  };

  var wireUpStandardDropDown = function(pathwayId, pathwayStage, standard, callback){
    var breaches = local.options.filter(function(val){
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard;
    });

    if(breaches.length>0)  $('select').val(breaches[0].value);

    $('select').select2({templateResult: formatStandard, minimumResultsForSearch: Infinity});
    $('span.select2-selection__rendered').attr("title","");
    $('select').on('change', function(){
      var data = $(this).find(':selected').data();
      callback(data.pathwayId, data.pathwayStage, data.standard, local.patientId);
    }).on("select2:open", function (e) {
      wireUpTooltips();
    });
  };

  var wireUpQualStan = function(pathwayId, pathwayStage, standard, patientId){
    wireUpAgreeDisagreePanel($('#qual-agree-disagree'),$('#individual-panel-classification'),pathwayId, pathwayStage, standard, patientId, "standard", "quality standard");
  };

  var updateQualStan = function(){
    //$('#individual-panel-classification table').removeClass('panel-green').removeClass('panel-red');
    $('#individual-panel-classification').find('div').each(function(){
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function(){
        var isClassification = $(this).closest("div").data("isClassification")!==undefined;
        any = true;
        var item = getObj().agrees[local.patientId].filter(function(i){return isClassification ? i.item==="section" : i.item!=="section" });
        if(this.value==="yes"){
          //$(this).closest('table').addClass('panel-green');
          if(item && item[0].history){
            var tool = item[0].history[0] + " - click again to cancel";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          //$(this).closest('table').addClass('panel-red');
          if(item && item[0].history){
            var tool = item[0].history[0] + " - click again to edit/cancel";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });

      if(self.find('.btn-toggle input[type=checkbox]:not(:checked)').length==1){
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }

      if(!any){
        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and store it in your saved actions list ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      wireUpTooltips();
    });

    wireUpTooltips();
  };

  var wireUpWelcomePage = function(pathwayId, pathwayStage){
    $('#team-task-panel').on('click', '.cr-styled input[type=checkbox]', function(){
      var ACTIONID = $(this).closest('tr').data('id');
      editAction("team", ACTIONID, null, this.checked);

      if(this.checked) {
        recordEvent(pathwayId, "team", "Item completed");
        var self = this;
        $(self).parent().attr("title","").attr("data-original-title","").tooltip('fixTitle').tooltip('hide');
        wireUpTooltips();
        setTimeout(function(e){
          $(self).parent().fadeOut(300, function(){
            var parent = $(this).parent();
            $(this).replaceWith(createPanel($('#checkbox-template'),{"done":true}));
            parent.find('button').on('click', function(){
              ACTIONID = $(this).closest('tr').data('id');
              editAction("team", ACTIONID, null, false);
              $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
              updateWelcomePage();
            });
          });
        },1000);
      }
			updateWelcomePage();
		}).on('change', '.btn-toggle input[type=checkbox]', function(){
      updateWelcomePage();
    }).on('click', '.edit-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[1]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('shown.bs.modal').on('shown.bs.modal', function () {
        $('#editActionPlanItem').focus();
      }).off('click','.save-plan').on('click', '.save-plan',function(){

        editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup','#editActionPlanItem').on('keyup', '#editActionPlanItem',function(e){
        if(e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
		}).on('click', '.delete-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#team-delete-item').html($($(this).closest('tr').children('td')[1]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('click','.delete-plan').on('click', '.delete-plan',function(){
        deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
		}).on('click', '.btn-undo', function(e){
      var ACTIONID = $(this).closest('tr').data('id');
      editAction("team", ACTIONID, null, false);
      $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
      updateWelcomePage();
    }).on('click', '.btn-yes,.btn-no', function(e){
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')){
        //unselecting
        if(checkbox.val()==="no"){
          launchTeamModal(local.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), getReason("team", ACTIONID), true, function(){
            editAction("team", ACTIONID, false, null, local.reason);
            updateWelcomePage();
            wireUpTooltips();
          },null, function(){
            ignoreAction("team", ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            updateWelcomePage();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          ignoreAction("team", ACTIONID);
          other.removeClass("inactive");
        }
      } else if((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if(checkbox.val()==="no") {
          launchTeamModal(local.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), getReason("team", ACTIONID), false, function(){
            editAction("team", ACTIONID, false, null, local.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked","checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            updateWelcomePage();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        }
        else {
          editAction("team", ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
		});

    $('#individual-task-panel').on('click', '.cr-styled input[type=checkbox]', function(){
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      editAction(patientId, ACTIONID, null, this.checked);

      if(this.checked) {
        recordEvent(pathwayId, patientId, "Item completed");
        var self = this;
        $(self).parent().attr("title","").attr("data-original-title","").tooltip('fixTitle').tooltip('hide');
        wireUpTooltips();
        setTimeout(function(e){
          $(self).parent().fadeOut(300, function(){
            var parent = $(this).parent();
            $(this).replaceWith(createPanel($('#checkbox-template'),{"done":true}));
            parent.find('button').on('click', function(){
              ACTIONID = $(this).closest('tr').data('id');
              editAction(patientId, ACTIONID, null, false);
              $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
              updateWelcomePage();
            });
          });
        },1000);
      }
			updateWelcomePage();
		}).on('change', '.btn-toggle input[type=checkbox]', function(){
      updateWelcomePage();
    }).on('click', '.edit-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[2]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('shown.bs.modal').on('shown.bs.modal', function () {
        $('#editActionPlanItem').focus();
      }).off('click','.save-plan').on('click', '.save-plan',function(){

        editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup','#editActionPlanItem').on('keyup', '#editActionPlanItem',function(e){
        if(e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
		}).on('click', '.delete-plan', function(){
      var PLANID = $(this).closest('tr').data("id");

      $('#team-delete-item').html($($(this).closest('tr').children('td')[2]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('click','.delete-plan').on('click', '.delete-plan',function(){
        deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
		}).on('click', '.btn-undo', function(e){
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      editAction(patientId, ACTIONID, null, false);
      $(this).replaceWith(createPanel($('#checkbox-template'),{"done":false}));
      updateWelcomePage();
    }).on('click', '.btn-yes,.btn-no', function(e){
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      if($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')){
        //unselecting
        if(checkbox.val()==="no"){
          launchPatientActionModal(local.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), getReason(patientId, ACTIONID), true, function(){
            editAction(patientId, ACTIONID, false, null, local.reason);
            updateWelcomePage();
            wireUpTooltips();
          }, null, function(){
            ignoreAction(patientId, ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            updateWelcomePage();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          ignoreAction(patientId, ACTIONID);
          other.removeClass("inactive");
        }
      } else if((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if(checkbox.val()==="no") {
          launchPatientActionModal(local.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), getReason(patientId, ACTIONID), false, function(){
            editAction(patientId, ACTIONID, false, null, local.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked","checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            updateWelcomePage();
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        }
        else {
          editAction(patientId, ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
		});

    updateWelcomePage();
  };

  var updateWelcomePage = function(){
    $('#team-task-panel').add('#individual-task-panel').find('.suggestion').each(function(){
			$(this).find('td').last().children().hide();
		});

    $('#team-task-panel').add('#individual-task-panel').find('.cr-styled input[type=checkbox]').each(function(){
      if(this.checked){
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    $('#team-task-panel').add('#individual-task-panel').find('.btn-undo').each(function(){
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text
    $('#team-task-panel').add('#individual-task-panel').find('tr').each(function(){
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function(){
        any = true;
  			if(this.value==="yes"){
  				self.removeClass('danger');
  				self.addClass('active');
  				self.find('td').last().children().show();
          if(getObj().actions.team[self.data("id")] && getObj().actions.team[self.data("id")].history){
            var tool = $(this).closest('tr').hasClass('success') ? "" : getObj().actions.team[self.data("id")].history[0] + " - click again to cancel";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
  			} else {
  				self.removeClass('active');
  				self.addClass('danger');
  				self.removeClass('success');
          if(getObj().actions.team[self.data("id")] && getObj().actions.team[self.data("id")].history){
            $(this).parent().attr("title", getObj().actions.team[self.data("id")].history[0] + " - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
  			}
      });
      if(self.find('.btn-toggle input[type=checkbox]:not(:checked)').length==1){
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if(!any){
        self.removeClass('danger');
        self.removeClass('active');
        self.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and store it in your saved actions list ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      wireUpTooltips();
		});

    wireUpTooltips();
  };

  var getAgreeTooltip = function(agreeObject){
    return agreeObject.history[agreeObject.history.length-1];
  };

  var getDisgreeTooltip = function(agreeObject){
    return agreeObject.history[agreeObject.history.length-1] + " You said: " + agreeObject.reason;
  };

  var wireUpAgreeDisagree = function(selector, agreeObject){
    if(agreeObject.agree===true){
      selector.children(':nth(0)').addClass('active');
      selector.children(':nth(1)').addClass('inactive');
      selector.children(':nth(0)').attr("title",getAgreeTooltip(agreeObject)).attr("data-original-title", getAgreeTooltip(agreeObject)).tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title","").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      selector.parent().addClass('success').removeClass('danger');
    } else if(agreeObject.agree===false){
      selector.children(':nth(0)').addClass('inactive');
      selector.children(':nth(1)').addClass('active');
      selector.children(':nth(0)').attr("title","").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title",getDisgreeTooltip(agreeObject)).attr("data-original-title", getDisgreeTooltip(agreeObject)).tooltip('fixTitle').tooltip('hide');
      selector.parent().addClass('danger').removeClass('success');
    } else {
      selector.children(':nth(0)').attr("title","Click to agree").attr("data-original-title", "Click to agree").tooltip('fixTitle').tooltip('hide');
      selector.children(':nth(1)').attr("title","Click to disagree").attr("data-original-title", "Click to disagree").tooltip('fixTitle').tooltip('hide');
      selector.parent().removeClass('success').removeClass('danger');
    }
  };

  var wireUpAgreeDisagreePanel = function(agreeDivSelector, panelSelector, pathwayId, pathwayStage, standard, patientId, item, disagreeText) {
    wireUpAgreeDisagree(agreeDivSelector, getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));

    panelSelector.on('change', '.btn-toggle input[type=checkbox]', function(){
      wireUpAgreeDisagree(agreeDivSelector, getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
      wireUpTooltips();
    }).on('click', '.btn-toggle', function(e){
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if($(this).hasClass("active") && other.hasClass("inactive")){
        //unselecting
        if(checkbox.val()==="no"){
          launchStandardModal("Disagree with " + disagreeText, "?", getAgreeReason(pathwayId, pathwayStage, standard, patientId, item), true, function(){
            editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, false, local.reason.reasonText);
            wireUpAgreeDisagree(agreeDivSelector, getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            wireUpTooltips();
          }, null, function(){
            editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, null, "");
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            wireUpAgreeDisagree(agreeDivSelector, getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, null);
          other.removeClass("inactive");
        }
      } else if(!$(this).hasClass("active") && other.hasClass("active")) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if(checkbox.val()==="no") {
          launchStandardModal("Disagree with " + disagreeText, "", "", false, function(){
            editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, false, local.reason.reasonText);
            $(self).removeClass("inactive");
            checkbox.attr("checked","checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            wireUpAgreeDisagree(agreeDivSelector, getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, item));
            wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        }
        else {
          editPatientAgree(pathwayId, pathwayStage, standard, patientId, item, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });
  };

  var wireUpTrendPanel = function(pathwayId, pathwayStage, standard, patientId){
    wireUpAgreeDisagreePanel($('#trend-agree-disagree'),$('#trend-panel'),pathwayId, pathwayStage, standard, patientId, "trend", "trend data");

    $('#trend-panel').on('click', '.table-chart-toggle', function(){
      if($(this).text()==="Table") {
        $(this).text("Chart");
        $('#chart-demo-trend').hide();
        $('#table-demo-trend').show();

        var c =   $('#table-demo-trend .tableScroll').getNiceScroll();
        if(c && c.length>0){
          c.resize();
        } else {
          $('#table-demo-trend .tableScroll').niceScroll({
            cursoropacitymin: 0.3,
            cursorwidth: "7px",
            horizrailenabled: false
          });
        }
      } else {
        $(this).text("Table");
        $('#chart-demo-trend').show();
        $('#table-demo-trend').hide();
      }
    });
  };

  var createTrendPanel = function(pathwayId, pathwayStage, standard, patientId){
    var agree = getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "trend");
    return createPanel(valueTrendPanel, {"pathway": local.monitored[pathwayId], "agree" : agree && agree.agree, "disagree":agree && agree.agree===false, "standard":local.data[pathwayId][pathwayStage].standards[standard].tab.title, "pathwayStage" : pathwayStage});
  };

  var showTrendPanel = function(location, pathwayId, pathwayStage, standard, patientId){
    createPanelShow(valueTrendPanel, location, {"pathway": local.monitored[pathwayId], "pathwayStage" : pathwayStage});

    drawTrendChart(patientId, pathwayId, pathwayStage, standard);
  };

  var wireUpMedicationPanel = function(pathwayId, pathwayStage, standard, patientId){
    wireUpAgreeDisagreePanel($('#medication-agree-disagree'),$('#medication-panel'),pathwayId, pathwayStage, standard, patientId, "medication", "medication data");
  };

  var wireUpOtherCodesPanel = function(pathwayId, pathwayStage, standard, patientId){
    wireUpAgreeDisagreePanel($('#other-codes-agree-disagree'),$('#other-codes-panel'),pathwayId, pathwayStage, standard, patientId, "codes", "other codes");
  };

  var createMedicationPanel = function(pathwayId, pathwayStage, standard, patientId) {
    var medications = local.data.patients[patientId].medications || [];
    var agree = getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "medication");
    return createPanel(medicationPanel, {"areMedications" : medications.length>0, "agree" : agree && agree.agree, "disagree":agree && agree.agree===false, "pathway":local.pathwayNames[pathwayId], "medications": medications, "pathwayStage" : pathwayStage},{"medicationRow":$('#medication-row').html()});
  };

  var showMedicationPanel = function(location, pathwayId, pathwayStage, patientId) {
    var medications = local.data.patients[patientId].medications || [];
    createPanelShow(medicationPanel, location, {"areMedications" : medications.length>0, "pathway":local.pathwayNames[pathwayId], "medications": medications, "pathwayStage" : pathwayStage},{"medicationRow":$('#medication-row').html()});
  };

  var createOtherCodesPanel = function(pathwayId, pathwayStage, standard, patientId) {
    var codes = (local.data.patients[patientId].codes || []).map(function(val){
      val.description = local.data.codes[val.code];
      return val;
    });
    var agree = getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "codes");
    return createPanel($('#other-codes-panel'), {"areCodes" : codes.length>0, "agree" : agree && agree.agree, "disagree":agree && agree.agree===false, "pathway":local.pathwayNames[pathwayId], "standard":local.data[pathwayId][pathwayStage].standards[standard].tab.title , "codes": codes, "pathwayStage" : pathwayStage},{"codeRow":$('#other-codes-row').html()});
  };

  var removeDuplicates = function(array){
    var arrResult = {};
    var rtn = [];
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        arrResult[array[i]] = array[i];
    }
    for(var item in arrResult) {
        rtn.push(arrResult[item]);
    }
    return rtn;
  };

  var numberOfStandardsMissed = function(patientId){
    var a = local.data.patients[patientId].breach.map(function(val){return val.pathwayId + val.pathwayStage + val.standard;});
    var obj = {};
    for(var i = 0; i < a.length; i++){
      obj[a[i]]="";
    }
    return Object.keys(obj).length;
  };

  var getAllPatients = function(){
    var pList=[], i,k, prop;
    for(k=0; k < local.diseases.length; k++){
      for(i in local.categories){
        for(prop in local.data[local.diseases[k].id][i].bdown){
          if(local.data[local.diseases[k].id][i].bdown.hasOwnProperty(prop)){
            pList = pList.concat(local.data[local.diseases[k].id][i].bdown[prop].patients);
          }
        }
      }
    }
    pList = removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
			var ret = local.data.patients[patientId];
			ret.nhsNumber = local.patLookup ? local.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(numberOfStandardsMissed(patientId));
			return ret;
		});

    return patients;
  };

  var populateAllPatientPanel = function(){
    var patients = getAllPatients();

    var data = {"patients": patients, "n" : patients.length, "header-items" : [{"title" : "NHS no.", "isUnSortable" : true}, {"title" : "All opportunities", "isUnSortable" : true, "tooltip":"Total number of improvement opprtunities available across all conditions"}]};

    data.patients.sort(function(a, b){
      if(a.items[0] === b.items[0]) {
        return 0;
      }
      var A = Number(a.items[0]);
      var B = Number(b.items[0]);
      if(isNaN(A) || isNaN(B)){
        A = a.items[0];
        B = b.items[0];
      }
      if(A > B) {
        return -1;
      } else if (A < B) {
        return 1;
      }
    });

		createPanelShow(patientList, patientsPanel, data, {"header-item" : $("#patient-list-header-item").html(), "item" : $('#patient-list-item').html()});

		$('#patients-placeholder').hide();

		setupClipboard($('.btn-copy'), true);

    wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if(c && c.length>0){
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
  			cursoropacitymin: 0.3,
  			cursorwidth: "7px",
  			horizrailenabled: false
  		});
    }
  };

  var wireUpTooltips = function(){
    $('[data-toggle="tooltip"]').tooltip({container: 'body', delay: { "show": 500, "hide": 100 }});
    $('[data-toggle="lone-tooltip"]').tooltip({container: 'body', delay: { "show": 300, "hide": 100 }});
    $('[data-toggle="lone-tooltip"]').on('shown.bs.tooltip',function(e){
      $('[data-toggle="tooltip"]').not(this).tooltip('hide');
    });
  };

	var populatePatientPanel = function (pathwayId, pathwayStage, standard, subsection, sortField, sortAsc) {
    //Remove scroll if exists
    patientsPanel.find('div.table-scroll').getNiceScroll().remove();

    var pList=[], i,k, prop, header;
    patientsPanel.fadeOut(200, function(){
      $(this).fadeIn(200);
    });
    if(pathwayId && pathwayStage && standard && subsection) {
      pList = local.data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val){return val.name===subsection;})[0].patients;
      header = local.data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val){return val.name===subsection;})[0].desc;
    } else if(pathwayId && pathwayStage && standard) {
      pList = local.data[pathwayId][pathwayStage].standards[standard].opportunities.reduce(function(a,b){
        return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
      });
      header = local.data[pathwayId][pathwayStage].standards[standard].tableTitle;
    } else if(pathwayId && pathwayStage && subsection) {
      pList = local.data[pathwayId][pathwayStage].bdown[subsection].patients;
      header = local.data[pathwayId][pathwayStage].bdown[subsection].name;
    } else if(pathwayId && pathwayStage){
      for(prop in local.data[pathwayId][pathwayStage].bdown){
        if(local.data[pathwayId][pathwayStage].bdown.hasOwnProperty(prop)){
          pList = pList.concat(local.data[pathwayId][pathwayStage].bdown[prop].patients);
        }
      }
      header = local.data[pathwayId][pathwayStage].patientListHeader;
    } else if(pathwayId){
      for(i in local.categories){
        for(prop in local.data[pathwayId][i].bdown){
          if(local.data[pathwayId][i].bdown.hasOwnProperty(prop)){
            pList = pList.concat(local.data[pathwayId][i].bdown[prop].patients);
          }
        }
      }
    } else {
      for(k=0; k < local.diseases.length; k++){
        for(i in local.categories){
          for(prop in local.data[local.diseases[k].id][i].bdown){
            if(local.data[local.diseases[k].id][i].bdown.hasOwnProperty(prop)){
              pList = pList.concat(local.data[local.diseases[k].id][i].bdown[prop].patients);
            }
          }
        }
      }
    }
    pList = removeDuplicates(pList);
		var patients = pList.map(function(patientId) {
			var ret = local.data.patients[patientId];
			ret.nhsNumber = local.patLookup ? local.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
			if(ret[local.data[pathwayId][pathwayStage].standards[standard].valueId]) {
        if(local.data[pathwayId][pathwayStage].standards[standard].dateORvalue==="date"){
          ret.items.push(ret[local.data[pathwayId][pathwayStage].standards[standard].valueId][0][ret[local.data[pathwayId][pathwayStage].standards[standard].valueId][0].length-1]);
        } else {
          ret.items.push(ret[local.data[pathwayId][pathwayStage].standards[standard].valueId][1][ret[local.data[pathwayId][pathwayStage].standards[standard].valueId][1].length-1]);
        }
			} else {
        ret.items.push("?");
			}
      ret.items.push(numberOfStandardsMissed(patientId));
			return ret;
		});

		var data = {"patients": patients, "n" : patients.length, "header" : header, "header-items" : [{"title" : "NHS no.", "isSorted":false, "direction":"sort-asc", "tooltip":"NHS number of each patient"}]};

    //middle column is either value or date
    if(local.data[pathwayId][pathwayStage].standards[standard].dateORvalue){
      data["header-items"].push({"title" : local.data[pathwayId][pathwayStage].standards[standard].valueName, "isSorted":false, "direction":"sort-asc"});
    } else {
      if(pathwayStage === local.categories.monitoring.name){
        data["header-items"].push({"title" : "Last BP Date", "isSorted":false, "direction":"sort-asc", "tooltip":"Last date BP was measured"});
      }
      else{
        data["header-items"].push({"title" : "Last SBP", "tooltip":"Last systolic BP reading", "isSorted":false, "direction":"sort-asc"});
      }
    }

    //add qual standard column
    data["header-items"].push({"title" : "All opportunities", "isSorted":true, "direction":"sort-desc", "tooltip":"Total number of improvement opprtunities available across all conditions"});

    if(sortField === undefined) sortField = 2;
		if(sortField !== undefined) {
			data.patients.sort(function(a, b){
        if(sortField===0) { //NHS number
          if(a.nhsNumber === b.nhsNumber) {
  					return 0;
  				}

  				if(a.nhsNumber > b.nhsNumber) {
  					return sortAsc ? 1 : -1;
  				} else if (a.nhsNumber< b.nhsNumber) {
  					return sortAsc ? -1 : 1;
  				}
        } else {
        	if(a.items[sortField-1] === b.items[sortField-1]) {
  					return 0;
  				}

  				if(a.items[sortField-1] == "?") return 1;
  				if(b.items[sortField-1] == "?") return -1;

          var A = Number(a.items[sortField-1]);
          var B = Number(b.items[sortField-1]);
          if(isNaN(A) || isNaN(B)){
            A = a.items[sortField-1];
            B = b.items[sortField-1];
          }
  				if(A > B) {
  					return sortAsc ? 1 : -1;
  				} else if (A < B) {
  					return sortAsc ? -1 : 1;
  				}
        }
			});

      for(var i = 0; i < data["header-items"].length; i++) {
        if(i === sortField){
          data["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
          data["header-items"][i].isAsc = sortAsc;
          data["header-items"][i].isSorted = true;
        } else {
          data["header-items"][i].isSorted = false;
        }
      }
			//data.direction = sortAsc ? "sort-asc" : "sort-desc";
			//data.isSorted = sortAsc;
		}

		createPanelShow(patientList, patientsPanel, data, {"header-item" : $("#patient-list-header-item").html(), "item" : $('#patient-list-item').html()});

		$('#patients-placeholder').hide();

		setupClipboard($('.btn-copy'), true);

    wireUpTooltips();

    patientsPanel.find('div.table-scroll').niceScroll({
			cursoropacitymin: 0.3,
			cursorwidth: "7px",
			horizrailenabled: false
		});
	};

	var populatePatientPanelOk = function (pathwayId, pathwayStage, subsection, sortField, sortAsc) {
    var pList=[], i,k, prop, header, tooltip;
    patientsPanel.fadeOut(200, function(){
      $(this).fadeIn(200);
    });

    pList = local.data[pathwayId][pathwayStage].patientsOk;
    header = local.data[pathwayId][pathwayStage].text.panelOkHeader.text;
    tooltip = local.data[pathwayId][pathwayStage].text.panelOkHeader.tooltip;

    pList = removeDuplicates(pList);
		var patients = pList.map(function(patientId) {
			var ret = local.data.patients[patientId];
			ret.nhsNumber = local.patLookup ? local.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(local.data.patients[patientId].breach ? numberOfStandardsMissed(patientId) : 0);
			return ret;
		});
    var data = {"patients": patients, "n" : patients.length, "header":header, "tooltip":tooltip, "header-items" : [{"title" : "NHS no.", "isSorted":false, "direction":"sort-asc"}, {"title" : "All opportunities", "isSorted":true, "direction":"sort-desc","tooltip":"Total number of improvement opprtunities available across all conditions"}]};

    if(sortField === undefined) sortField = 1;

    data.patients.sort(function(a, b){
      if(sortField===0) { //NHS number
        if(a.nhsNumber === b.nhsNumber) {
          return 0;
        }

        if(a.nhsNumber > b.nhsNumber) {
          return sortAsc ? 1 : -1;
        } else if (a.nhsNumber< b.nhsNumber) {
          return sortAsc ? -1 : 1;
        }
      } else {
        if(a.items[sortField-1] === b.items[sortField-1]) {
          return 0;
        }

        var A = Number(a.items[sortField-1]);
        var B = Number(b.items[sortField-1]);
        if(isNaN(A) || isNaN(B)){
          A = a.items[sortField-1];
          B = b.items[sortField-1];
        }
        if(A > B) {
          return sortAsc ? 1 : -1;
        } else if (A < B) {
          return sortAsc ? -1 : 1;
        }
      }
    });

    for(var i = 0; i < data["header-items"].length; i++) {
      if(i === sortField){
        data["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
        data["header-items"][i].isAsc = sortAsc;
        data["header-items"][i].isSorted = true;
      } else {
        data["header-items"][i].isSorted = false;
      }
    }


		createPanelShow(patientList, patientsPanel, data, {"header-item" : $("#patient-list-header-item").html(), "item" : $('#patient-list-item').html()});

		$('#patients-placeholder').hide();

		setupClipboard($('.btn-copy'), true);

    wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if(c && c.length>0){
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
  			cursoropacitymin: 0.3,
  			cursorwidth: "7px",
  			horizrailenabled: false
  		});
    }
	};

  var addDisagreePersonalTeam = function(plans){
    for(var i = 0; i < plans.length; i++){
      if(plans[i].agree){
        plans[i].disagree = false;
      } else if (plans[i].agree === false){
        plans[i].disagree = true;
      }
    }
    return plans;
  };

  var addDisagree = function(suggestions, actions, id){
    for(var i = 0; i < suggestions.length; i++){
      if(actions[id][suggestions[i].id]){
        if(actions[id][suggestions[i].id].agree) {
          suggestions[i].agree = true;
          suggestions[i].disagree = false;
        } else if(actions[id][suggestions[i].id].agree===false){
          suggestions[i].agree = false;
          suggestions[i].disagree = true;
        }
        if(actions[id][suggestions[i].id].done) suggestions[i].done = actions[id][suggestions[i].id].done;
        else suggestions[i].done = false;
      }
    }
    return suggestions;
  };

  var mergeTeamStuff = function(suggestions){
    var teamActions = listActions();
    if(!teamActions["team"]) return suggestions;

    suggestions = addDisagree(suggestions, teamActions, "team");
    return suggestions;
  };

  var sortSuggestions = function(suggestions){
    suggestions.sort(function(a,b){
      if(a.agree && !a.done){
        if(b.agree && !b.done) return 0;
        return -1;
      } else if(!a.agree && !a.disagree){
        if(!b.agree && !b.disagree) return 0;
        if(b.agree && !b.done) return 1;
        return -1;
      } else if(a.agree && a.done){
        if(b.agree && b.done) return 0;
        if(b.disagree) return -1;
        return 1;
      } else {
        if(b.disagree) return 0;
        return 1;
      }
    });

    return suggestions;
  };

  var populateTeamSuggestedActionsPanel = function (){
    var suggestions = suggestionList(local.actionPlan[local.pathwayId].team);
    suggestions = sortSuggestions(mergeTeamStuff(suggestions));

		createPanelShow(suggestedPlanTemplate, suggestedPlanTeam, {"suggestions" : suggestions}, {"item" : $('#suggested-plan-item').html(), "chk" : $('#checkbox-template').html() });

		displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
	};

	var populateSuggestedActionsPanel = function (pathwayStage){
		if(pathwayStage === local.categories.exclusions.name){
			suggestedPlanTeam.html('No team actions for excluded patients');
		} else if(pathwayStage === local.categories.diagnosis.name){
			suggestedPlanTeam.html('No team actions for these patients');
		} else {
			createPanelShow(suggestedPlanTemplate, suggestedPlanTeam, local.data[local.pathwayId][pathwayStage], {"item" : $('#suggested-plan-item').html(), "chk" : $('#checkbox-template').html() });

			displayPersonalisedIndividualActionPlan(pathwayStage, $('#personalPlanTeam'));

			createPanelShowvidualSapRows();
		}
	};

	var highlightOnHoverAndEnableSelectByClick = function(panelSelector) {
		panelSelector.children('div').removeClass('unclickable').on('mouseover',function(){
			$(this).removeClass('panel-default');
		}).on('mouseout',function(){
      $(this).addClass('panel-default');
    }).on('click', function(){
        // keep the link in the browser history
        history.pushState(null, null, '#main/'+local.pathwayId+'/'+$(this).data('stage')+'/no');
        loadContent('#main/'+local.pathwayId+'/'+$(this).data('stage')+'/no', true);
        // do not give a default action
        return false;
		});
	};

	/********************************
	* Charts - draw
	********************************/

	var drawTrendChart = function(patientId, pathwayId, pathwayStage, standard){
    var i,j;
		destroyCharts(['chart-demo-trend']);
		if(!local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]]) {
      $('#chart-demo-trend').html('No data for this patients');
      $('#chart-demo-trend').parent().find('.table-chart-toggle').hide();
      return;
    }

    var chartData = local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]];
    var tableData = [];
    for(i = 1; i < local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]][0].length; i++){
      tableData.push({
        "item":local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]][1][0],
        "value":local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]][1][i],
        "date":local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]][0][i]
      });
    }
    for(i = 1 ; i < local.data[pathwayId][pathwayStage].standards[standard].chart.length; i++){
      chartData.push(local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[i]][1]);//RW TODO assumption here that all dates are the same
      for(j=1; j < local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]][0].length; j++){
        tableData.push({
          "item":local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[i]][1][0],
          "value":local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[i]][1][j],
          "date":local.data.patients[patientId][local.data[pathwayId][pathwayStage].standards[standard].chart[0]][0][j]
        });
      }
    }
		var chartOptions = {
			bindto: '#chart-demo-trend',
			data: {
        xs :{},
        classes : {},
				columns: chartData.slice()
			},
      zoom: {
          enabled: true
      },
      line: {
        connectNull: false
      },
			axis: {
				x: {
					type: 'timeseries',
					tick: {
  					format: '%d-%m-%Y',
  					count: 7,
  					culling: {
  						max: 3
  					}
					},
          max: new Date()
				}
			}
		};

    var maxValue = 0;
    var standardItems = [];

    for(var i = 1; i < chartOptions.data.columns.length; i++){
      chartOptions.data.xs[chartOptions.data.columns[i][0]] = "x";
      standardItems.push(chartOptions.data.columns[i][0]);

      for(var j = 1; j < chartOptions.data.columns[i].length; j++){
        if(parseFloat(chartOptions.data.columns[i][j]) > maxValue) maxValue = parseFloat(chartOptions.data.columns[i][j]);
      }
    }

    chartOptions.tooltip = {
        format: {
            value: function (value, ratio, id) {
                var text = standardItems.indexOf(id) > -1 ? value : "";
                return text;
            }
        }
    };

    var lines = null;
    var axisnum = 1;
		if(local.data.patients[patientId].contacts){
      for(var i = 0; i< local.data.patients[patientId].contacts.length; i++){
        chartOptions.data.classes[local.data.patients[patientId].contacts[i].text] = 'larger';
        if(!chartOptions.data.xs[local.data.patients[patientId].contacts[i].text]) {
          chartOptions.data.xs[local.data.patients[patientId].contacts[i].text] = "x"+axisnum;
          chartOptions.data.columns.push(["x"+axisnum,local.data.patients[patientId].contacts[i].value]);
          chartOptions.data.columns.push([local.data.patients[patientId].contacts[i].text, (maxValue*1.1).toString()]);
          axisnum++;
        } else {
          var axis = chartOptions.data.xs[local.data.patients[patientId].contacts[i].text];
          for(var j = 1; j <chartOptions.data.columns.length;j++ ){
            if(chartOptions.data.columns[j][0]===axis) {
              chartOptions.data.columns[j].push(local.data.patients[patientId].contacts[i].value);
            } else if(chartOptions.data.columns[j][0]===local.data.patients[patientId].contacts[i].text){
              chartOptions.data.columns[j].push((maxValue*1.1).toString());
            }
          }
        }
        tableData.push({
          "item": "Event",
          "value":local.data.patients[patientId].contacts[i].text ,
          "date":local.data.patients[patientId].contacts[i].value
        });
      }
    }

    var obj = getObj();
    var patientEvents = obj.events.filter(function(val){
      return val.id === patientId;
    });
    if(patientEvents.length>0){

      for(var i = 0; i < patientEvents.length; i++){
        chartOptions.data.classes[patientEvents[i].name] = 'larger';
        if(!chartOptions.data.xs[patientEvents[i].name]) {
          chartOptions.data.xs[patientEvents[i].name] = "x"+axisnum;
          chartOptions.data.columns.push(["x"+axisnum,patientEvents[i].date.substr(0,10)]);
          chartOptions.data.columns.push([patientEvents[i].name, (maxValue*1.1).toString()]);
          axisnum++;
        } else {
          var axis = chartOptions.data.xs[patientEvents[i].name];
          for(var j = 1; j <chartOptions.data.columns.length;j++ ){
            if(chartOptions.data.columns[j][0]===axis) {
              chartOptions.data.columns[j].push(patientEvents[i].date.substr(0,10));
            } else if(chartOptions.data.columns[j][0]===patientEvents[i].name){
              chartOptions.data.columns[j].push((maxValue*1.1).toString());
            }
          }
        }
        tableData.push({
          "item": "Event",
          "value":patientEvents[i].name,
          "date":patientEvents[i].date.substr(0,10)
        });
      }
    }

    tableData.sort(function(a,b){
      if(a.date===b.date) return 0;
      else return a.date < b.date ? 1 : -1;
    });
    //draw Table
    $('#table-demo-trend').html(Mustache.render($('#value-trend-panel-table').html(),{"items":tableData},{"item-row":$('#value-trend-panel-table-row').html()}));

    //draw charts in separate thread and with delay to stop sluggish appearance
    setTimeout(function(){
      local.charts['chart-demo-trend'] = c3.generate(chartOptions);
    }, 1);
	};

	var selectPieSlice = function (chart, d){
		local.chartClicked=true;
		$('#' + chart + ' path.c3-bar').attr('class', function(index, classNames) {
			return classNames + ' _unselected_';
		});
		local.charts[chart].select([d.id], [d.index], true);

    farRightPanel.fadeOut(200, function(){
      var template = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(template)).show();
    });
	};

	var destroyCharts = function(charts){
		for(var i = 0 ; i<charts.length; i++){
			if(local.charts[charts[i]]) {
				local.charts[charts[i]].destroy();
				delete local.charts[charts[i]];
			}
		}
	};

	var showOverviewPanels = function(){
		switchTo221Layout();

		showPanel(local.categories.diagnosis.name, topLeftPanel, true);
		showPanel(local.categories.monitoring.name, topRightPanel, true);
		showPanel(local.categories.treatment.name, bottomLeftPanel, true);
		showPanel(local.categories.exclusions.name, bottomRightPanel, true);

    wireUpTooltips();
	};

  var updateTeamSapRows = function(){
    suggestedPlanTeam.add('#personalPlanTeam').find('.suggestion').each(function(){
			$(this).find('td').last().children().hide();
		});

    suggestedPlanTeam.add('#personalPlanTeam').find('.cr-styled input[type=checkbox]').each(function(){
      if(this.checked){
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    suggestedPlanTeam.add('#personalPlanTeam').find('.btn-undo').each(function(){
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text
    suggestedPlanTeam.add('#personalPlanTeam').find('tr').each(function(){
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function(){
        any = true;
  			if(this.value==="yes"){
  				self.removeClass('danger');
  				self.addClass('active');
  				self.find('td').last().children().show();
          if(getObj().actions.team[self.data("id")].history){
            var tool = $(this).closest('tr').hasClass('success') ? "" : getObj().actions.team[self.data("id")].history[0] + " - click again to cancel";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
  			} else {
  				self.removeClass('active');
  				self.addClass('danger');
  				self.removeClass('success');
          if(getObj().actions.team[self.data("id")] && getObj().actions.team[self.data("id")].history){
            $(this).parent().attr("title", getObj().actions.team[self.data("id")].history[0] + " - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
  			}
      });
      if(self.find('.btn-toggle input[type=checkbox]:not(:checked)').length==1){
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if(!any){
        self.removeClass('danger');
        self.removeClass('active');
        self.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and store it in your saved actions list ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      wireUpTooltips();
		});

    wireUpTooltips();
  };

  var updateIndividualSapRows = function(){
    $('#advice-list').add('#personalPlanIndividual').find('.suggestion').each(function(){
			$(this).find('td').last().children().hide();
		});

    $('#advice-list').add('#personalPlanIndividual').find('.cr-styled input[type=checkbox]').each(function(){
      if(this.checked){
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    $('#advice-list').add('#personalPlanIndividual').find('.btn-undo').each(function(){
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text

    $('#advice-list').add('#personalPlanIndividual').find('tr').each(function(){
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function(){
        any = true;
  			if(this.value==="yes"){
  				self.removeClass('danger');
  				self.addClass('active');
  				self.find('td').last().children().show();
          if(getObj().actions[local.patientId][self.data("id")].history){
            var tool = $(this).closest('tr').hasClass('success') ? "" : getObj().actions[local.patientId][self.data("id")].history[0] + " - click again to cancel";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
  			} else {
  				self.removeClass('active');
  				self.addClass('danger');
          self.removeClass('success');
          if(getObj().actions[local.patientId][self.data("id")] && getObj().actions[local.patientId][self.data("id")].history){
            $(this).parent().attr("title", getObj().actions[local.patientId][self.data("id")].history[0] + " - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
  			}
      });
      if(self.find('.btn-toggle input[type=checkbox]:not(:checked)').length==1){
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if(!any){
        self.removeClass('danger');
        self.removeClass('active');
        self.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and store it in your saved actions list ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      wireUpTooltips();
		});
    wireUpTooltips();
  };

  var suggestionList = function (ids){
    return ids.map(function(val){
      return {"id" : val.id || val, "text" : local.actionText[val.id || val].text, "subsection" : val.subsection};
    });
  };

  var mergeIndividualStuff = function(suggestions, patientId){
    var actions = listActions();
    if(!actions[patientId]) return suggestions;

    for(var i = 0; i < suggestions.length; i++){
      if(actions[patientId][suggestions[i].id]){
        if(actions[patientId][suggestions[i].id].agree) {
          suggestions[i].agree = true;
        } else if(actions[patientId][suggestions[i].id].agree===false){
          suggestions[i].disagree = true;
        }
        if(actions[patientId][suggestions[i].id].done) suggestions[i].done = actions[patientId][suggestions[i].id].done;
      }
    }
    return suggestions;
  };

	var populateIndividualSuggestedActions = function (patientId, pathwayId, pathwayStage, standard) {
		var data = {"nhsNumber" : local.patLookup ? local.patLookup[patientId] : patientId, "patientId" : patientId};
    var breaches = local.data.patients[patientId].breach ? local.data.patients[patientId].breach.filter(function(v) {
      return v.pathwayId === pathwayId && v.pathwayStage === pathwayStage && v.standard === standard;
    }) : [];

    if(breaches.length===0){
      data.noSuggestions = true;
    } else {
      var suggestions = [], subsection = "";
      for(var i = 0; i < breaches.length; i++){
        subsection = breaches[i].subsection;
        suggestions = suggestions.concat(local.data[pathwayId][pathwayStage].bdown[subsection].suggestions ?
          local.data[pathwayId][pathwayStage].bdown[subsection].suggestions.map(function(val){
          return {"id":val, "subsection":subsection};
        }) : []);
      }

      data.suggestions = sortSuggestions(mergeIndividualStuff(suggestionList(suggestions), patientId));
      data.section = {
        "name" : local.data[pathwayId][pathwayStage].bdown[subsection].name,
        "agree" : getPatientAgree(pathwayId, pathwayStage, patientId, "section") === true,
        "disagree" : getPatientAgree(pathwayId, pathwayStage, patientId, "section") === false,
      }
      data.category = {
        "name" : local.data.patients[patientId].category,
        "agree" : getPatientAgree(pathwayId, pathwayStage, patientId, "category") === true,
        "disagree" : getPatientAgree(pathwayId, pathwayStage, patientId, "category") === false,
      }
    }

		$('#advice-placeholder').hide();
		$('#advice').show();

		createPanelShow(individualPanel, $('#advice-list'), data, {"chk" : $('#checkbox-template').html() });

    //Wire up any clipboard stuff in the suggestions
    $('#advice-list').find('span:contains("[COPY")').each(function(){
      var html = $(this).html();
      $(this).html(html.replace(/\[COPY:([^\]]*)\]/g,'$1 <button type="button" data-clipboard-text="$1" data-content="Copied" data-toggle="tooltip" data-placement="top" title="Copy $1 to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });

    $('#advice-list').find('span:contains("[INFO")').each(function(){
      var html = $(this).html();
      var subsection = $(this).data().subsection;
      var tooltip = subsection ? "We recommended this because we think this patient is categorised as '" + subsection + "'" : '';
      var newHtml = ' <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="' + tooltip + '"></i>';
      $(this).html(html.replace(/\[INFO\]/g, newHtml));
    });

    $('#advice-list').find('span:contains("[MED-SUGGESTION")').each(function(){
      var html = $(this).html();
      var suggestion = Math.random() <0.33 ? "Increase Ramipril to 10mg per day" : (Math.random() < 0.5 ? "Consider adding an ACE inhibior" : "Consider adding a thiazide-like diuretic");
      $(this).html(html.replace(/\[MED\-SUGGESTION\]/g,suggestion));
    });


		setupClipboard( $('.btn-copy'), true );

		displayPersonalisedIndividualActionPlan(patientId, $('#personalPlanIndividual'));
	};

	var displayPersonalisedTeamActionPlan = function(parentElem) {
		var plans = sortSuggestions(addDisagreePersonalTeam(listPlans("team", local.pathwayId)));

		createPanelShow(actionPlanList, parentElem, {"hasSuggestions" : plans && plans.length > 0, "suggestions" : plans}, {"action-plan": $('#action-plan').html(), "action-plan-item": $('#action-plan-item').html(), "chk" : $('#checkbox-template').html() });

    updateTeamSapRows();
	};

	var displayPersonalisedIndividualActionPlan = function(id, parentElem) {
		var plans = sortSuggestions(addDisagreePersonalTeam(listPlans(id)));

		createPanelShow(actionPlanList, parentElem, {"hasSuggestions" : plans && plans.length > 0, "suggestions" : plans}, {"action-plan": $('#action-plan').html(), "action-plan-item": $('#action-plan-item').html(), "chk" : $('#checkbox-template').html() });

    updateIndividualSapRows();
	};

	var displaySelectedPatient = function(id){
    var nhs = local.patLookup ? local.patLookup[id] : id;

    history.pushState(null, null, '#patients/'+id);
    loadContent('#patients/'+id, true);

    $('.list-item').removeClass('highlighted');
    $('.list-item:has(button[data-clipboard-text=' + nhs +'])').addClass('highlighted');

    //scroll to patients
    $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0,$('#patients td:contains(' + nhs + ')').position().top-140);
	};

	var showPage = function (page) {
    if(local.page === page) return;
		local.page = page;
		$('.page').hide();
		$('#' + page).show();

		if (page !== 'main-dashboard') {
			hideSidePanel();
      hideHeaderBarItems();
		}
	};

  /********************************
	* Modals
	********************************/
  var showSaved = function(){
    $("#saved-message").hide().toggleClass("in").fadeIn(300);
    window.setTimeout(function(){
      $("#saved-message").fadeOut(300, function(){
        $(this).toggleClass("in");
      });
    }, 2000);
  };

  var launchModal = function(data, label, value, reasonText, callbackOnSave, callbackOnCancel, callbackOnUndo){
    var template = $('#modal-why').html();
    Mustache.parse(template);   // optional, speeds up future uses

    var reasonTemplate = $('#modal-why-item').html();
    Mustache.parse(reasonTemplate);

    if(data.reasons && data.reasons.length>0) data.hasReasons = true;

    var rendered = Mustache.render(template, data, {"item" : reasonTemplate});
    $('#modal').html(rendered);

    if(reasonText){
      $('#modal textarea').val(reasonText);
    }
    local.modalSaved = false;
    local.modalUndo = false;

    $('#modal .modal').off('click', '.undo-plan').on('click', '.undo-plan', function(e){
      local.modalUndo = true;
    }).off('submit','form').on('submit', 'form', {"label" : label}, function(e){
      if(!e.data.label) e.data.label = "team";
      var reason = $('input:radio[name=reason]:checked').val();
      var reasonText = $('#modal textarea').val();

      recordFeedback(local.pathwayId, e.data.label, value, reason, reasonText)

      local.modalSaved = true;

      e.preventDefault();
      $('#modal .modal').modal('hide');
    }).modal();

    $('#modal').off('hidden.bs.modal').on('hidden.bs.modal', {"label" : label}, function(e) {
      if(local.modalSaved) {
        local.modalSaved = false;
        if(callbackOnSave) callbackOnSave();
        //showSaved();
      } else if(local.modalUndo){
        local.modalUndo = false;
        if(callbackOnUndo) callbackOnUndo();
      } else {
        //uncheck as cancelled. - but not if value is empty as this unchecks everything - or if already checked
        if(callbackOnCancel) callbackOnCancel();
        //if(value !== "") $('tr:contains('+value+')').find(".btn-toggle input[type=checkbox]:checked").click();
      }
    });
  };

  var launchTeamModal = function(label, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo){
    var reasons = [{"reason":"We've already done this","value":"done"},{"reason":"It wouldn't work","value":"nowork"},{"reason":"Other","value":"else"}];
    if(reason && reason.reason) {
      for(var i = 0; i < reasons.length; i++) {
        if(reasons[i].reason === reason.reason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    launchModal({"header" : "Disagree with a suggested action", "isUndo":isUndo, "item": value, "placeholder":"Enter free-text here...", "reasons" : reasons},label, value, reason ? reason.reasonText : null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  };

  var launchPatientModal = function(pathwayId, pathwayStage, label, value, justtext){
    var reasons = [], header;
    if(justtext!==true && (pathwayStage===local.categories.monitoring.name || pathwayStage===local.categories.treatment.name)) {
      if(pathwayStage===local.categories.monitoring.name) reasons.push({"reason":"Has actually already been monitored","value":"alreadymonitored"});
      else if(pathwayStage===local.categories.treatment.name) reasons.push({"reason":"Is actually treated to target","value":"treated"});
      reasons.push({"reason":"Should be excluded – please see the suggested way on how to do this below in the 'suggested actions panel'","value":"shouldexclude"});
      var breach = local.data.patients[local.patientId].breach.filter(function(val){return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage;})[0];
      for(var prop in local.data[pathwayId][pathwayStage].bdown) {
        if(breach.subsection !== prop) {
          reasons.push({"reason": "Should be in the '" + prop + "' group", "value": "shouldbe_"+prop.replace(/\s+/g, '')});
        }
      }
      reasons.push({"reason":"Something else","value":"else"});
    }
    if(justtext){
      header = "Disagree with quality standard missed";
    } else {
      header = "Disagree with improvement opportunity";
    }
    launchModal({"header" : header, "item" : value, "placeholder":"Provide more information here...", "reasons" : reasons},label, value);
  };

  var launchStandardModal = function(header, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo){
    launchModal({"header" : header, "isUndo":isUndo, "item": value, "placeholder":"Provide more information here..."},null, value, reason, callbackOnSave, callbackOnCancel, callbackOnUndo);
  };

  var launchPatientActionModal = function(label, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo){
    var reasons = [{"reason":"Already done this","value":"done"},{"reason":"Wouldn't work","value":"nowork"},{"reason":"Something else","value":"else"}];
    if(reason && reason.reason) {
      for(var i = 0; i < reasons.length; i++) {
        if(reasons[i].reason === reason.reason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    launchModal({"header" : "Disagree with a suggested action", "isUndo":isUndo, "item": value, "placeholder":"Provide more information here...", "reasons" : reasons},label, value, reason ? reason.reasonText : null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  };

  /*******************
  * Utility functions
  ********************/

	var getObj = function(){
    var obj = JSON.parse(localStorage.bb);
    if(!obj.actions) {
      obj.actions = {};
      setObj(obj);
    }
    if(!obj.plans) {
      obj.plans = {};
      setObj(obj);
    }
    if(!obj.agrees) {
      obj.agrees = {};
      setObj(obj);
    }
    if(!obj.feedback) {
      obj.feedback = [];
      setObj(obj);
    }
    if(!obj.events) {
      obj.events = [];
      setObj(obj);
    }
		return obj;
	};

	var setObj = function(obj){
		localStorage.bb = JSON.stringify(obj);
	};

	var setupClipboard = function(selector, destroy) {
		if(destroy)	ZeroClipboard.destroy(); //tidy up

		var client = new ZeroClipboard(selector);

		client.on( 'ready', function() {
			client.on( 'aftercopy', function(event) {
				console.log('Copied text to clipboard: ' + event.data['text/plain']);
        $(event.target).tooltip('hide');
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

	var exportPlan = function(what){
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
		addHeading("Monitoring",20);

    addLine(what);
    addLine(what);
    addLine(what);

	/*	var internalFunc = function(el) {
      var k;
			if(data.plans.individual[el] || data.actions[el]) {
        addLine("Patient "+ el +":");
        if(data.plans.individual[el]) {
          for(k =0; k < data.plans.individual[el].length; k++){
            if(!data.plans.individual[el][k].done){
              addLine(data.plans.individual[el][k].text);
            }
          }
  			}
        if(data.actions[el]) {
          var pathSec = local.data[local.pathwayId].patients[el].pathwayStage;
          var pathSub = local.data[local.pathwayId].patients[el].subsection;
          for(k =0; k < Math.max(data.actions[el].agree.length, data.actions[el].done.length); k++){
            if(data.actions[el].done.length>k && data.actions[el].done[k] ){
              //Completed so ignore
            } else if(data.actions[el].agree.length>k && data.actions[el].agree[k] ){
              addLine(local.actionPlan[pathSec].individual[pathSub][k].text);
            }
          }   //
  			}
      }
		};

    addHeading("Team plan",14);
    suggs = local.data[local.pathwayId].monitoring.suggestions;
    for(i=0; i<suggs.length; i++){
      if(data.actions.monitoring && data.actions.monitoring.done && data.actions.monitoring.done.length>i && data.actions.monitoring.done[i] ){
        //Completed so ignore
      } else if(data.actions.monitoring && data.actions.monitoring.agree && data.actions.monitoring.agree.length>i && data.actions.monitoring.agree[i] ){
        addLine(suggs[i].text);
      }
    }

    if(data.plans.team.monitoring && data.plans.team.monitoring.filter(function(i,v){if(!v.done) return true; else return false;}).length>0){
      addHeading("Custom team plan",14);
      for(i=0; i < data.plans.team.monitoring.length; i++){
          if(!data.plans.team.monitoring[i].done){
            addLine(data.plans.team.monitoring[i].text);
          }
      }
    }

		addHeading("Custom individual plans",14);
    for(i=0; i< local.data[local.pathwayId].monitoring.breakdown.length; i++){
			mainId = local.data[local.pathwayId].monitoring.breakdown[i][0];
		  local.data[local.pathwayId].monitoring.bdown[mainId].patients.forEach(internalFunc);
    }

    addHeading("Treatment",20);

    addHeading("Team plan",14);
    suggs = local.data[local.pathwayId].treatment.suggestions;
    for(i=0; i<suggs.length; i++){
      if(data.actions.treatment && data.actions.treatment.done && data.actions.treatment.done.length>i && data.actions.treatment.done[i] ){
        //Completed so ignore
      } else if(data.actions.treatment && data.actions.treatment.agree && data.actions.treatment.agree.length>i && data.actions.treatment.agree[i] ){
        addLine(suggs[i].text);
      }
    }

    if(data.plans.team.treatment && data.plans.team.treatment.filter(function(i,v){if(!v.done) return true; else return false;}).length>0){
      addHeading("Custom team plan",14);
      for(i=0; i < data.plans.team.treatment.length; i++){
          if(!data.plans.team.treatment[i].done){
            addLine(data.plans.team.treatment[i].text);
          }
      }
    }

		addHeading("Custom individual plans",14);
    for(i=0; i< local.data[local.pathwayId].monitoring.breakdown.length; i++){
			mainId = local.data[local.pathwayId].monitoring.breakdown[i][0];
		  local.data[local.pathwayId].monitoring.bdown[mainId].patients.forEach(internalFunc);
    }*/

		//trigger download
		doc.save();
	};

  /********************************
	* Page setup
	********************************/

	var onSelected = function($e, nhsNumberObject) {
		//Hide the suggestions panel
		$('#search-box').find('.tt-dropdown-menu').css('display', 'none');

    //clearBox();

		displaySelectedPatient(nhsNumberObject.id);
	};

  var clearBox = function(){
    //Clear the patient search box
    $('.typeahead').typeahead('val', '');
  };

  var clearNavigation = function(){
    $("aside.left-panel nav.navigation > ul > li > ul").slideUp(300);
    $("aside.left-panel nav.navigation > ul > li").removeClass('active');
  };

  var showNavigation = function(list, idx, parent){
    if(local.elements.navigation){

      if(idx===-1){
        clearNavigation();
        $('aside a[href="#welcome"]:first').closest('li').addClass('active');
      } else if (idx >= list.length){
        clearNavigation();
        $('aside a[href="#patients"]').closest('li').addClass('active');
      } else if(!$('aside a[href="#' + list[idx].link + '"]:first').closest('li').hasClass('active')){
        clearNavigation();
        //set active
        $('aside a[href="#' + list[idx].link + '"]').next().slideToggle(300);
        $('aside a[href="#' + list[idx].link + '"]').closest('li').addClass('active');
      }

      return;
    }

    var template = $('#pathway-picker').html();
    var itemTemplate = $('#pathway-picker-item').html();
    Mustache.parse(template);
    Mustache.parse(itemTemplate);

    list = list.slice();
    list[0].isBreakAbovePractice = true;
    for(var i = 0; i < list.length; i++){
      list[i].hasSubItems = true;
    }
    list.unshift({"link":"welcome", "faIcon":"fa-home", "name":"Saved actions", "isBreakAboveHome":true});
    list.push({"link":"patients", "faIcon":"fa-users", "name":"All Patients", "isBreakAbovePatient":true});

    list.map(function(v, i, arr){ v.isSelected = i===idx+1; return v; });

    var renderedBefore = Mustache.render(template, {"items": list}, {"item": itemTemplate, "subItem":$('#pathway-picker-sub-item').html()});
    $('#aside-toggle nav:first').html(renderedBefore);

    $('.user').on('click', function(){
      loadContent('#welcome');
    });

    local.elements.navigation = true;
  };

  var shouldWeFade = function(oldHash, newHash){
      oldHash = oldHash.split('/');
      newHash = newHash.split('/');

      if(oldHash[0] === newHash[0] && oldHash[1] === newHash[1] && oldHash[2] === newHash[2] && oldHash[0] && newHash[0]) return false;
      return true;
  };

  var hideTooltips = function(){
    $('[data-toggle="tooltip"]').tooltip('hide');
  };

  var loadContent = function(hash, isPoppingState){
    hideTooltips();

    var i;
    if(!isPoppingState) {
      window.location.hash = hash;
    }

    if(hash === ''){
      clearBox();
      showPage('login');
      $('html').removeClass('scroll-bar');
    } else {
      $('html').addClass('scroll-bar');
      var urlBits = hash.split('/');
      if(urlBits[0]==="#main") {
        clearBox();
        var pathwayId = urlBits[1];
        var pathwayStage = urlBits[2];
        var yesPeople = urlBits[3] !== "no";
        var standard = urlBits[4];

        if(pathwayStage && local.page !== 'main-dashboard'){
          $('.page').hide();
          $('#main-dashboard').show();

          showSidePanel();
          showOverviewPanels();
          showHeaderBarItems();
        }

        if(pathwayStage) {
          if(yesPeople){
            showPathwayStageViewOk(pathwayId, pathwayStage, shouldWeFade(local.currentUrl, hash));
          } else {
            showPathwayStageView(pathwayId, pathwayStage, standard, shouldWeFade(local.currentUrl, hash));
          }
        } else {
          showOverview(pathwayId);
        }

        wireUpTooltips();

      } else if (urlBits[0] === "#help") {
        clearBox();
        showPage('help-page');

        showSidePanel();
        showHeaderBarItems();
        //hideAllPanels();
        showNavigation(local.diseases, -1, $('#help-page'));
        clearNavigation();
      } else if (urlBits[0]==="#patients") {

        var patientId = urlBits[1];
        var pathwayId = urlBits[2];

        showAllPatientView(patientId, true);

        wireUpTooltips();

        if(patientId) {
          var nhs = local.patLookup ? local.patLookup[patientId] : patientId;
          $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0,$('#patients td:contains(' + nhs + ')').position().top-140);
          $('#patients').find('tr:contains(' + nhs + ')').addClass("highlighted");
        }
      } else if (urlBits[0] === "#welcome") {
        clearBox();
        showPage('welcome');

        showSidePanel();
        showHeaderBarItems();
        //hideAllPanels();
        showNavigation(local.diseases, -1, $('#welcome'));

        $('#welcome-tabs li').removeClass('active');
        $('#outstandingTasks').closest('li').addClass('active');

        populateWelcomeTasks();


      } else {
        //if screen not in correct segment then select it
        alert("shouldn't get here");
        var pathwayStage = hash.substr(1);

        showPathwayStageView(pathwayStage);

        wireUpTooltips();
      }
    }

    local.currentUrl = hash;
  };

  var populateWelcomeTasks = function(complete){

    //add tasks
    var teamTasks = [];
    var individualTasks = [];

    //Add the team tasks
    for(var k in listActions("team")){
      if(listActions("team")[k].agree && ( (!listActions("team")[k].done && !complete) || (listActions("team")[k].done && complete))){
        teamTasks.push({"pathway": "N/A", "task": local.actionText[listActions("team")[k].id].text, "data":listActions("team")[k].id, "tpId":"team", "agree" :true, "done": complete});
      }
    }

    //Add the user added team tasks
    for(var k in listPlans("team")){
      if((!listPlans("team")[k].done && !complete) || (listPlans("team")[k].done && complete)){
        teamTasks.push({"canEdit":true,"pathway": local.pathwayNames[listPlans("team")[k].pathwayId], "pathwayId":listPlans("team")[k].pathwayId, "task": listPlans("team")[k].text, "data": listPlans("team")[k].id, "agree" :listPlans("team")[k].agree, "disagree" : listPlans("team")[k].agree===false, "done": complete});
      }
    }

    //Add individual
    for(var k in listActions()){
      if(k==="team") continue;
      for(var l in listActions()[k]){
        if(local.actionText[l] && listActions()[k][l].agree && ( (!listActions()[k][l].done && !complete) || (listActions()[k][l].done && complete))){
          individualTasks.push({"pathway": "N/A", "patientId":k, "task": local.actionText[l].text, "pathwayId":listPlans()[k][l].pathwayId, "data":l, "tpId":k, "agree" :true, "done": complete});
        }
      }
    }

    //Add custom individual
    for(var k in listPlans()){
      if(k==="team") continue;
      for(var l in listPlans()[k]){
        if(listPlans()[k][l].text && (!listPlans()[k][l].done && !complete) || (listPlans()[k][l].done && complete)){
          individualTasks.push({"canEdit":true,"pathway": local.pathwayNames[listPlans()[k][l].pathwayId], "pathwayId":listPlans()[k][l].pathwayId, "patientId":k, "tpId":k, "task": listPlans()[k][l].text, "data":l, "agree" :true, "done": complete});
        }
      }
    }

    var listTemplate = $('#welcome-task-list').html();
    Mustache.parse(listTemplate);
    $('#welcome-tab-content').html(Mustache.render(listTemplate));

    var addTemplate = $('#action-plan').html();
    Mustache.parse(addTemplate);
    var rendered = Mustache.render(addTemplate);
    $('#team-add-plan').html(rendered);

    var template = $('#welcome-task-items').html();
    var itemTemplate = $('#welcome-task-item').html();
    Mustache.parse(template);
    Mustache.parse(itemTemplate);

    $('#team-add-plan').off('click').on('click', '.add-plan', function(){
      var plan = $(this).parent().parent().find('textarea').val();
      var planId = recordPlan("team", plan, "custom");
      $('#team-task-panel').find('table tbody').append(Mustache.render(itemTemplate, {"pathway": "", "pathwayId":"custom", "canEdit":true, "task": plan, "data": planId, "agree" :null, "done": null}, {"chk" : $('#checkbox-template').html()}));
    });

    rendered = Mustache.render(template, {"tasks": teamTasks, "hasTasks": teamTasks.length>0}, {"task-item" : itemTemplate, "chk" : $('#checkbox-template').html()});
    $('#team-task-panel').children().not(":first").remove();
    $('#team-task-panel').append(rendered);

    rendered = Mustache.render(template, {"tasks": individualTasks, "isPatientTable":true, "hasTasks": individualTasks.length>0}, {"task-item" : itemTemplate, "chk" : $('#checkbox-template').html()});
    $('#individual-task-panel').children().not(":first").remove();
    $('#individual-task-panel').append(rendered);

    wireUpWelcomePage();
  };

  var wireUpSearchBox = function () {
    if(local.states) {
      local.states.clearPrefetchCache();
    }

    local.states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(local.data.patientArray, function(state) { return { id: state, value: local.patLookup ? local.patLookup[state] : state }; })
    });

    local.states.initialize(true);

    $('#search-box').find('.typeahead').typeahead('destroy');
    $('#search-box').find('.typeahead').typeahead(
      {hint: true, highlight: true, minLength: 1, autoselect: true},
      {name: 'patients', displayKey: 'value', source: local.states.ttAdapter(), templates: {
        empty: [
          '<div class="empty-message">',
            '&nbsp; &nbsp; No matches',
          '</div>'
        ].join('\n')}
      }
    ).on('typeahead:selected', onSelected)
    .on('typeahead:autocompleted', onSelected);
    //.on('typeahead:closed', clearBox);

    $('#searchbtn').on('mousedown', function(){
      var val = $('.typeahead').eq(0).val();
      onSelected(null, {"id": val});
    });
  };

  var preWireUpPages = function() {
		showPage('login');

    //Every link element stores href in history
    $(document).on('click', 'a.history', function() {
      // keep the link in the browser history
      history.pushState(null, null, this.href);
      loadContent(location.hash, true);
      // do not give a default action
      return false;
    });

    //Called when the back button is hit
    $(window).on('popstate', function(e) {
      loadContent(location.hash, true);
    });

		//Templates
		monitoringPanel = $('#monitoring-panel');
		treatmentPanel = $('#treatment-panel');
		diagnosisPanel = $('#diagnosis-panel');
		exclusionPanel = $('#exclusion-panel');
		patientsPanelTemplate = $('#patients-panel');
		breakdownPanel = $('#breakdown-panel');
		actionPlanPanel = $('#action-plan-panel');
		patientList = $('#patient-list');
		patientListSimple = $('#patient-list-simple');
		suggestedPlanTemplate = $('#suggested-plan-template');
		breakdownTableTemplate = $('#breakdown-table-template');
		individualPanel = $('#individual-panel');
		valueTrendPanel = $('#value-trend-panel');
    medicationPanel = $('#medications-panel');
		actionPlanList = $('#action-plan-list');

		//Selectors
		bottomLeftPanel = $('#bottom-left-panel');
		bottomRightPanel = $('#bottom-right-panel');
		topPanel = $('#top-panel');
		topLeftPanel = $('#top-left-panel');
		topRightPanel = $('#top-right-panel');
    midPanel = $('#mid-panel');
		farLeftPanel = $('#left-panel');
		farRightPanel = $('#right-panel');
  };

	var wireUpPages = function () {
		$('#pick-nice').on('click', function(e){
      //load data
      var currentColour = $('body').css('backgroundColor');
      $('body').animate({ backgroundColor: "rgba(255,255,0,0.7)" },100).animate({backgroundColor : currentColour},500);
      //flash background
      //$('body').removeClass('qof');
      //e.stopPropagation();
		});

		$('#pick-qof').on('click', function(e){
    var currentColour = $('body').css('backgroundColor');
    $('body').animate({ backgroundColor: "rgba(255,255,0,0.7)" },100).animate({backgroundColor : currentColour},800);
      //$('body').addClass('qof');
      //e.stopPropagation();
		});

    wireUpTooltips();

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
          getData(null, JsonObj);
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

    //exportPlan
    /*$('.download-outstanding').on('click', function(){
      exportPlan('outstanding');
    });
    $('.download-completed').on('click', function(){
      exportPlan('completed');
    });
    $('.download-all').on('click', function(){
      exportPlan('all');
    });
*/
    $('#outstandingTasks').on('click', function(e){
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      var template = $('#welcome-task-list').html();
      var rendered = Mustache.render(template);
      $('#welcome-tab-content').fadeOut(100, function(){
        $(this).html(rendered);
        populateWelcomeTasks();
        $(this).fadeIn(100);
      });
    });

    $('#completedTasks').on('click', function(e){
      e.preventDefault();

      $('#welcome-tabs li').removeClass('active');
      $(this).closest('li').addClass('active');
      var template = $('#welcome-task-list').html();
      var rendered = Mustache.render(template);
      $('#welcome-tab-content').fadeOut(100, function(){
        $(this).html(rendered);
        populateWelcomeTasks(true);
        $(this).fadeIn(100);
      });
    });

    if(bb.hash !== location.hash) location.hash = bb.hash;
    loadContent(location.hash, true);
	};

  var loadActionPlan = function(callback) {
    var r = Math.random();
    $.getJSON("action-plan.json?v="+r, function(file){
      local.actionPlan = file.diseases;
      local.actionText = file.plans;
      callback();
    });
  };

  var loadData = function(file){
    var d="", j, k, key, data = file.diseases;

    local.data = jQuery.extend({}, data); //copy

    local.data.patients = file.patients;
    local.data.codes = file.codes;
    local.data.patientArray = [];
    for(var o in file.patients) {
      if(file.patients.hasOwnProperty(o)) {
        local.data.patientArray.push(o);
      }
    }

    for(d in data){
      local.pathwayNames[d] = data[d]["display-name"];
      var diseaseObject = {"id":d,"link": data[d].link ? data[d].link : "main/"+d, "faIcon":data[d].icon, "name":data[d]["display-name"], "text":{"main":{"tooltip":data[d]["side-panel-tooltip"]}}};
      if(data[d].monitoring.text) { diseaseObject.text.monitoring = data[d].monitoring.text.sidePanel; }
      if(data[d].treatment.text) { diseaseObject.text.treatment = data[d].treatment.text.sidePanel; }
      if(data[d].diagnosis.text) { diseaseObject.text.diagnosis = data[d].diagnosis.text.sidePanel; }
      if(data[d].exclusions.text) { diseaseObject.text.exclusions = data[d].exclusions.text.sidePanel; }
      local.diseases.push(diseaseObject);
      local.data[d].suggestions = local.actionPlan[d].team;
      $.extend(local.data[d].monitoring, {"breakdown":[], "bdown":{}});
      $.extend(local.data[d].treatment, {"breakdown":[], "bdown":{}});
      $.extend(local.data[d].diagnosis, {"breakdown":[], "bdown":{}});
      $.extend(local.data[d].exclusions, {"breakdown":[], "bdown":{}});

      if(!local.data[d].monitoring.header) continue;
      for(key in local.data[d].monitoring.standards){
        local.options.push({"value": local.options.length ,"pathwayId" : d, "pathwayStage" : "monitoring", "standard" : key, "text" : local.pathwayNames[d] + ' - ' + "Monitoring" + ' - ' + local.data[d].monitoring.standards[key].tab.title});
        for(var j = 0; j < local.data[d].monitoring.standards[key].opportunities.length; j++){
          local.data[d].monitoring.bdown[local.data[d].monitoring.standards[key].opportunities[j].name] = local.data[d].monitoring.standards[key].opportunities[j];
          local.data[d].monitoring.bdown[local.data[d].monitoring.standards[key].opportunities[j].name].suggestions = local.actionPlan[d].monitoring.individual[local.data[d].monitoring.standards[key].opportunities[j].name];
          for(k=0; k < local.data[d].monitoring.standards[key].opportunities[j].patients.length; k++) {
            if(!local.data.patients[local.data[d].monitoring.standards[key].opportunities[j].patients[k]].breach) local.data.patients[local.data[d].monitoring.standards[key].opportunities[j].patients[k]].breach = [];
            local.data.patients[local.data[d].monitoring.standards[key].opportunities[j].patients[k]].breach.push({"pathwayId":d, "pathwayStage":"monitoring", "standard": key, "subsection":local.data[d].monitoring.standards[key].opportunities[j].name});
          }
        }
      }
      for(key in local.data[d].diagnosis.standards){
        local.options.push({"value": local.options.length ,"pathwayId" : d, "pathwayStage" : "diagnosis", "standard" : key, "text" : local.pathwayNames[d] + ' - ' + "Diagnosis" + ' - ' + local.data[d].diagnosis.standards[key].tab.title});
        for(var j = 0; j < local.data[d].diagnosis.standards[key].opportunities.length; j++){
          local.data[d].diagnosis.bdown[local.data[d].diagnosis.standards[key].opportunities[j].name] = local.data[d].diagnosis.standards[key].opportunities[j];
          local.data[d].diagnosis.bdown[local.data[d].diagnosis.standards[key].opportunities[j].name].suggestions = local.actionPlan[d].diagnosis.individual[local.data[d].diagnosis.standards[key].opportunities[j].name];
          for(k=0; k < local.data[d].diagnosis.standards[key].opportunities[j].patients.length; k++) {
            if(!local.data.patients[local.data[d].diagnosis.standards[key].opportunities[j].patients[k]].breach) local.data.patients[local.data[d].diagnosis.standards[key].opportunities[j].patients[k]].breach = [];
            local.data.patients[local.data[d].diagnosis.standards[key].opportunities[j].patients[k]].breach.push({"pathwayId":d, "pathwayStage":"diagnosis", "standard": key, "subsection":local.data[d].diagnosis.standards[key].opportunities[j].name});
          }
        }
      }
      for(key in local.data[d].treatment.standards){
        local.options.push({"value": local.options.length ,"pathwayId" : d, "pathwayStage" : "treatment", "standard" : key, "text" : local.pathwayNames[d] + ' - ' + "Treatment" + ' - ' + local.data[d].treatment.standards[key].tab.title});
        for(var j = 0; j < local.data[d].treatment.standards[key].opportunities.length; j++){
          local.data[d].treatment.bdown[local.data[d].treatment.standards[key].opportunities[j].name] = local.data[d].treatment.standards[key].opportunities[j];
          local.data[d].treatment.bdown[local.data[d].treatment.standards[key].opportunities[j].name].suggestions = local.actionPlan[d].treatment.individual[local.data[d].treatment.standards[key].opportunities[j].name];
          for(k=0; k < local.data[d].treatment.standards[key].opportunities[j].patients.length; k++) {
            if(!local.data.patients[local.data[d].treatment.standards[key].opportunities[j].patients[k]].breach) local.data.patients[local.data[d].treatment.standards[key].opportunities[j].patients[k]].breach = [];
            local.data.patients[local.data[d].treatment.standards[key].opportunities[j].patients[k]].breach.push({"pathwayId":d, "pathwayStage":"treatment", "standard": key, "subsection":local.data[d].treatment.standards[key].opportunities[j].name});
          }
        }
      }
      for(key in local.data[d].exclusions.standards){
        local.options.push({"value": local.options.length ,"pathwayId" : d, "pathwayStage" : "exclusions", "standard" : key, "text" : local.pathwayNames[d] + ' - ' + "Exclusions" + ' - ' + local.data[d].exclusions.standards[key].tab.title});
        for(var j = 0; j < local.data[d].exclusions.standards[key].opportunities.length; j++){
          local.data[d].exclusions.bdown[local.data[d].exclusions.standards[key].opportunities[j].name] = local.data[d].exclusions.standards[key].opportunities[j];
          local.data[d].exclusions.bdown[local.data[d].exclusions.standards[key].opportunities[j].name].suggestions = local.actionPlan[d].exclusions.individual[local.data[d].exclusions.standards[key].opportunities[j].name];
          for(k=0; k < local.data[d].exclusions.standards[key].opportunities[j].patients.length; k++) {
            if(!local.data.patients[local.data[d].exclusions.standards[key].opportunities[j].patients[k]].breach) local.data.patients[local.data[d].exclusions.standards[key].opportunities[j].patients[k]].breach = [];
            local.data.patients[local.data[d].exclusions.standards[key].opportunities[j].patients[k]].breach.push({"pathwayId":d, "pathwayStage":"exclusions", "standard": key, "subsection":local.data[d].exclusions.standards[key].opportunities[j].name});
          }
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
  			loadData(file);
        if(typeof callback === 'function') callback();
  		}).fail(function(err){
        alert("data.json failed to load!! - if you've changed it recently check it's valid json at jsonlint.com");
      });
    }
	};

	var initialize = function(){
    preWireUpPages();

    loadActionPlan(function(){
      getData(wireUpPages);
    });
	};

  /*var generateTestPatients = function(n, diseases){
    var patients = {};
    var arr = [];
    var probOfDisease = 0.25;
    var probOfAllOk = 0.2;
    var stages = ["diagnosis", "monitoring", "treatment", "exclusions"];

    for(var i = 0; i < n; i++){
      var id = Math.floor(Math.random() * 10000000000);
      while(arr.indexOf(id)>-1) id = Math.floor(Math.random() * 10000000000);
      arr.push(id);
      patients[id]={};

      for(var d in diseases){
        if(Math.random() < probOfDisease) {
          patients[id][d] = {};

          if(Math.random()>probOfAllOk){
            var stage = stages[Math.floor(Math.random()*4)];
            patients[id][d][stage]={};
          }
        }
      }
    }

    return patients;
  };*/

  /*var generateTestData = function(data){
    var diseases = {};}
    var patients = local.patients.slice();

    for(var dId in data){
      if(dId==="patients" || dId==="patientsArray") continue;
      diseases[dId] = {"diseaseId" : dId, "display-name":data[dId]["display-name"], "icon":data[dId].icon};

      //monitoring
      diseases[dId].monitoring = data[dId].monitoring;
      //rtn.monitoring.trend = generateTrendData("2015-03-01", "2015-06-01", 1, [{"name":"%","start":50,"Pup":0.1,"Pdown":0.3},{"name":"n","start":150,"Pup":0.1,"Pdown":0.3}]);


      //monitoring
      diseases[dId].monitoring = {};

      //monitoring
      diseases[dId].monitoring = {};

      //monitoring
      diseases[dId].monitoring = {};
    }


    localStorage.testData = JSON.stringify({"diseases":diseases, "patients":patients});
    return {"diseases":diseases, "patients":patients};
  };*/

  var getDates = function(n){
    var arr = [];

    var today = new Date();
    var freqInterval = Math.random() < 0.33 ? 50 : (Math.random() < 0.5 ? 100 : 200);

    for(var i = 0; i < n; i++){
      today.setDate(today.getDate() - ((Math.random() * freqInterval) + freqInterval/2));
      arr.unshift(today.toISOString().substr(0,10));
    }

    arr.unshift("x");

    return arr;
  };

  var getValues = function(name, n, low, high){
    var arr = [name];

    var start = Math.floor(Math.random()*(high-low) + low);
    for(var i = 0; i < n; i++){
      start += Math.floor((Math.random()-0.5)*(high-low)/10);
      arr.push(start);
    }

    return arr;
  };

  //0 occasionally 1-9
  var getChadValues = function(n){
    var arr = ["Chad2Vasc"];

    var start = Math.random() < 0.2 ? 0 : 1+Math.floor(Math.random()*8);
    for(var i = 0; i < n; i++){
      start += Math.floor(Math.random()*1.25);
      arr.push(start);
    }
    return arr;
  };

  window.generatePatientData = function(){
    var r = Math.random();
    $.getJSON("data.json?v="+r, function(file) {
        for(var id in file.patients){
          //get 6 dates
          var dateArray = getDates(6);

          if(!file.patients[id].sbp) {
            file.patients[id].sbp = [dateArray,getValues("SBP", 6, 100,180)];
          }

          if(!file.patients[id].dbp) {
            file.patients[id].dbp = [dateArray,getValues("DBP", 6, 50,120)];
          }

          if(!file.patients[id].egfr) {
            file.patients[id].egfr = [dateArray,getValues("EGFR", 6, 15,150)];
          }

          if(file.patients[id].CHA2DS2Vasc.length>2) {
            file.patients[id].CHA2DS2Vasc = [dateArray, getChadValues(6)];
          }

          if(!file.patients[id].pulse) {
            file.patients[id].pulse = [dateArray,getValues("PULSE", 6, 45,95)];
          }

          if(!file.patients[id].INR) {
            file.patients[id].INR = [dateArray,getValues("INR", 6, 100,180)];
          }
        }

        console.log(JSON.stringify(file.patients));
    });
  };

  window.generateTrendData = function(labels, endDate, endValues, minValue, maxValue, changeProbs, favourUpProbs, days){
    var rtn = [["x", endDate.toISOString().substr(0,10)]],i,j;
    for(i=0;i<labels.length;i++){
      rtn.push([labels[i], endValues[i]]);
    }
    for(i=0;i<days;i++){
      endDate.setDate(endDate.getDate()-1);
      rtn[0].push(endDate.toISOString().substr(0,10));
      for(j=0;j<labels.length;j++){
        if(Math.random() < changeProbs[j]){
          if(Math.random() < favourUpProbs[j]){
            endValues[j] = Math.min(maxValue, endValues[j] + 1);
          } else {
            endValues[j] = Math.max(minValue, endValues[j] - 1);
          }
        }
        rtn[j+1].push(endValues[j]);
      }
    }
    return rtn;
  };

	window.bb = {
    "version" : "1.25",
		"init" : initialize,
    "_local":local
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
  //Grab the hash if exists - IE seems to forget it
  bb.hash = location.hash;
	//Load the data then wire up the events on the page
	bb.init();

	//Sorts out the data held locally in the user's browser
	if(!localStorage.bb) localStorage.bb = JSON.stringify({});
	var obj = JSON.parse(localStorage.bb);
  if(!obj.version || obj.version!==bb.version){
    localStorage.bb = JSON.stringify({"version" : bb.version});
  }

	$('[data-toggle="tooltip"]').tooltip({container: 'body', delay: { "show": 500, "hide": 100 }});
  $('[data-toggle="lone-tooltip"]').tooltip({container: 'body', delay: { "show": 300, "hide": 100 }});
  $('[data-toggle="lone-tooltip"]').on('shown.bs.tooltip',function(e){
    $('[data-toggle="tooltip"]').not(this).tooltip('hide');
  });

  //ensure on first load the login screen is cached to the history
  history.pushState(null, null, '');
});
