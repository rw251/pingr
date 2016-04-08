var data = require('./data.js'),
  lookup = require('./lookup.js'),
  base = require('./base.js'),
  patients = require('./panels/patients.js'),
  patientList = require('./panels/patientList.js'),
  teamActionPlan = require('./panels/teamActionPlan.js'),
  allPatients = require('./panels/allPatients.js'),
  welcome = require('./panels/welcome.js'),
  layout = require('./layout.js'),
  overview = require('./panels/overview.js'),
  indicatorView = require('./panels/indicator.js'),
  patientView = require('./panels/patientView.js');

var template = {

  loadContent: function(hash, isPoppingState) {
    base.hideTooltips();

    var i, pathwayId, pathwayStage, standard, indicator, patientId;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    if (hash === '') {
      base.clearBox();
      layout.showPage('login');
      $('html').removeClass('scroll-bar');
    } else {
      $('html').addClass('scroll-bar');
      var params = {};
      var urlBits = hash.split('/');
      if(hash.indexOf('?')>-1) {
        hash.split('?')[1].split('&').forEach(function(param){
          var elems = param.split("=");
          params[elems[0]] = elems[1];
        });
        urlBits = hash.split('?')[0].split('/');
      }

      if (urlBits[0] === "#overview" && !urlBits[1]) {
        base.clearBox();
        base.switchTo101Layout();
        layout.showMainView();

        $('#mainTitle').show();
        base.updateTitle("Overview");

        //Show overview panels
        data.pathwayId = "htn";//TODO fudge
        teamActionPlan.show(farRightPanel);
        farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        overview.create(template.loadContent);

        base.wireUpTooltips();
      } else if (urlBits[0] === "#overview") {
        pathwayId = urlBits[1];
        pathwayStage = urlBits[2];
        standard = urlBits[3];
        var tab = params.tab || "trend";

        base.clearBox();
        base.switchTo21Layout();
        layout.showMainView();

        $('#mainTitle').show();

        //Show overview panels
        data.pathwayId = pathwayId;
        teamActionPlan.show(farRightPanel);
        farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
        indicatorView.create(pathwayId, pathwayStage, standard, tab, template.loadContent);

        base.wireUpTooltips();
      } else if (urlBits[0] === "#main") {
        base.clearBox();
        pathwayId = urlBits[1];
        data.pathwayId = pathwayId;
        pathwayStage = urlBits[2];
        var yesPeople = urlBits[3] !== "no";
        standard = urlBits[4];

        if (pathwayStage && layout.page !== 'main-dashboard') {
          $('.page').hide();
          $('#main-dashboard').show();

          ////layout.showSidePanel();
          layout.showOverviewPanels();
          layout.showHeaderBarItems();
        }

        if (pathwayStage) {
          if (yesPeople) {
            template.showPathwayStageViewOk(pathwayId, pathwayStage, template.shouldWeFade(lookup.currentUrl, hash));
          } else {
            template.showPathwayStageView(pathwayId, pathwayStage, standard, template.shouldWeFade(lookup.currentUrl, hash));
          }
        } else {
          template.showOverview(pathwayId);
        }

        base.wireUpTooltips();

      } else if (urlBits[0] === "#help") {
        base.clearBox();
        layout.showPage('help-page');

        ////layout.showSidePanel();
        layout.showHeaderBarItems();
        ////layout.showNavigation(data.diseases, -1, $('#help-page'));
        ////layout.clearNavigation();
      } else if (urlBits[0] === "#patient") {

        patientId = urlBits[1];
        pathwayId = urlBits[2];
        pathwayStage = urlBits[3];
        standard = urlBits[4];

        //allPatients.showView(patientId, true);
        base.clearBox();
        base.switchTo21Layout();
        layout.showMainView();

        $('#mainTitle').show();

        //Show overview panels
        data.pathwayId = pathwayId;
        teamActionPlan.show(farRightPanel);
        
        patientView.create(patientId);
        base.wireUpTooltips();

        /*if (patientId) {
          var nhs = data.patLookup ? data.patLookup[patientId] : patientId;
          $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0, $('#patients td').filter(function() {
            return $(this).text().trim() === nhs;
          }).position().top - 140);
          $('#patients').find('tr:contains(' + nhs + ')').addClass("highlighted");
        }*/
      } else if (urlBits[0] === "#patients") {

        patientId = urlBits[1];
        pathwayId = urlBits[2];

        allPatients.showView(patientId, true);

        base.wireUpTooltips();

        if (patientId) {
          var nhs = data.patLookup ? data.patLookup[patientId] : patientId;
          $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0, $('#patients td').filter(function() {
            return $(this).text().trim() === nhs;
          }).position().top - 140);
          $('#patients').find('tr:contains(' + nhs + ')').addClass("highlighted");
        }
      } else if (urlBits[0] === "#welcome") {
        base.clearBox();
        layout.showPage('welcome');

        ////layout.showSidePanel();
        layout.showHeaderBarItems();
        ////layout.showNavigation(data.diseases, -1, $('#welcome'));

        $('#welcome-tabs li').removeClass('active');
        $('#outstandingTasks').closest('li').addClass('active');

        welcome.populate();


      } else {
        //if screen not in correct segment then select it
        alert("shouldn't get here");
        pathwayStage = hash.substr(1);

        template.showPathwayStageView(pathwayStage);

        base.wireUpTooltips();
      }
    }

    lookup.currentUrl = hash;
  },

  //Show the overview page for a disease
  showOverview: function(disease) {
    data.pathwayId = disease;

    layout.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(disease));

    $('aside li ul li').removeClass('active');
    $('aside a[href="#main/' + disease + '"]:contains("Overview")').parent().addClass('active');

    $('#mainTitle').show();
    base.updateTitle(data[data.pathwayId]["display-name"] + ": Overview (practice-level data)");

    //Show overview panels
    template.showOverviewPanels();
    teamActionPlan.show(farRightPanel);
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
  },

  showOverviewPanels: function() {
    base.switchTo221Layout();

    template.showPanel(lookup.categories.diagnosis.name, topLeftPanel, true);
    template.showPanel(lookup.categories.monitoring.name, topRightPanel, true);
    template.showPanel(lookup.categories.treatment.name, bottomLeftPanel, true);
    template.showPanel(lookup.categories.exclusions.name, bottomRightPanel, true);

    base.wireUpTooltips();
  },

  showPanel: function(pathwayStage, location, enableHover) {
    base.showPathwayStageOverviewPanel(location, enableHover, data.pathwayId, pathwayStage);

    if (enableHover) template.highlightOnHoverAndEnableSelectByClick(location);
    else location.children('div').addClass('unclickable');
  },

  //Show the pathway stage for a disease
  showPathwayStageView: function(pathwayId, pathwayStage, standard, shouldFade) {
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    data.pathwayId = pathwayId;
    layout.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage, "g");
    $('aside a').filter(function() {
      return this.href.match(re);
    }).parent().addClass('active');

    base.switchTo110Layout();

    if (!standard) {
      standard = Object.keys(data[pathwayId][pathwayStage].standards)[0];
    }

    var panel = patients.create(pathwayId, pathwayStage, standard);

    if (shouldFade) {
      farLeftPanel.fadeOut(100, function() {
        $(this).html(panel);
        patients.wireUp(pathwayId, pathwayStage, farLeftPanel, standard);
        patientList.populate(pathwayId, pathwayStage, standard, null);
        $('#mainTitle').hide();
        base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(100);
      });
    } else {
      farLeftPanel.html(panel);
      patients.wireUp(pathwayId, pathwayStage, farLeftPanel, standard);
      patientList.populate(pathwayId, pathwayStage, standard, null);
      $('#mainTitle').hide();
      base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
    }

    var tempMust = $('#patient-panel-placeholder').html();
    farRightPanel.html(Mustache.render(tempMust));
  },

  showPathwayStageViewOk: function(pathwayId, pathwayStage, shouldFade) {
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    layout.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage, "g");
    $('aside a').filter(function() {
      return this.href.match(re);
    }).parent().addClass('active');

    base.switchTo110Layout();

    var panel = patients.createOk(pathwayId, pathwayStage);

    if (shouldFade) {
      farLeftPanel.fadeOut(200, function() {
        $(this).html(panel);
        patients.wireUpOk(pathwayId, pathwayStage, farLeftPanel);
        patients.populateOk(pathwayId, pathwayStage, null);
        $('#mainTitle').hide();
        base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(300);
      });
      var tempMust = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(tempMust));
    } else {
      farLeftPanel.html(panel);
      patients.wireUpOk(pathwayId, pathwayStage, farLeftPanel);
      patients.populateOk(pathwayId, pathwayStage, null);
      $('#mainTitle').hide();
      base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
    }
  },

  highlightOnHoverAndEnableSelectByClick: function(panelSelector) {
    panelSelector.children('div').removeClass('unclickable').on('mouseover', function() {
      $(this).removeClass('panel-default');
    }).on('mouseout', function(e) {
      $(this).addClass('panel-default');
    }).on('click', 'tr.standard-row', function(e) {
      history.pushState(null, null, '#main/' + data.pathwayId + '/' + $(this).closest('.panel').data('stage') + '/no/' + $(this).data('standard'));
      template.loadContent('#main/' + data.pathwayId + '/' + $(this).closest('.panel').data('stage') + '/no/' + $(this).data('standard'), true);
      // do not give a default action
      e.preventDefault();
      e.stopPropagation();
      return false;
    }).on('click', function(e) {
      // keep the link in the browser history
      history.pushState(null, null, '#main/' + data.pathwayId + '/' + $(this).data('stage') + '/no');
      template.loadContent('#main/' + data.pathwayId + '/' + $(this).data('stage') + '/no', true);
      // do not give a default action
      return false;
    });

  },

  displaySelectedPatient: function(id) {
    var nhs = data.patLookup ? data.patLookup[id] : id;

    history.pushState(null, null, '#patients/' + id);
    template.loadContent('#patients/' + id, true);

    $('.list-item').removeClass('highlighted');
    $('.list-item:has(button[data-clipboard-text=' + nhs + '])').addClass('highlighted');

    //scroll to patients
    $('#patients').find('div.table-scroll').getNiceScroll().doScrollPos(0, $('#patients td').filter(function() {
      return $(this).text().trim() === nhs;
    }).position().top - 140);
  },

  shouldWeFade: function(oldHash, newHash) {
    oldHash = oldHash.split('/');
    newHash = newHash.split('/');

    if (oldHash[0] === newHash[0] && oldHash[1] === newHash[1] && oldHash[2] === newHash[2] && oldHash[0] && newHash[0]) return false;
    return true;
  }

};

module.exports = template;
