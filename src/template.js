var data = require('./data.js'),
  lookup = require('./lookup.js'),
  base = require('./base.js'),
  patients = require('./panels/patients.js'),
  teamActionPlan = require('./panels/teamActionPlan.js'),
  allPatients = require('./panels/allPatients.js'),
  welcome = require('./panels/welcome.js'),
  layout = require('./layout.js');

var template = {

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

  loadContent: function(hash, isPoppingState) {
    base.hideTooltips();

    var i, pathwayId, pathwayStage;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    if (hash === '') {
      base.clearBox();
      layout.showPage('login');
      $('html').removeClass('scroll-bar');
    } else {
      $('html').addClass('scroll-bar');
      var urlBits = hash.split('/');
      if (urlBits[0] === "#main") {
        base.clearBox();
        pathwayId = urlBits[1];
        data.pathwayId = pathwayId;
        pathwayStage = urlBits[2];
        var yesPeople = urlBits[3] !== "no";
        var standard = urlBits[4];

        if (pathwayStage && layout.page !== 'main-dashboard') {
          $('.page').hide();
          $('#main-dashboard').show();

          layout.showSidePanel();
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

        layout.showSidePanel();
        layout.showHeaderBarItems();
        layout.showNavigation(data.diseases, -1, $('#help-page'));
        layout.clearNavigation();
      } else if (urlBits[0] === "#patients") {

        var patientId = urlBits[1];
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

        layout.showSidePanel();
        layout.showHeaderBarItems();
        layout.showNavigation(data.diseases, -1, $('#welcome'));

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

  showOverviewPanels: function() {
    base.switchTo221Layout();

    template.showPanel(lookup.categories.diagnosis.name, topLeftPanel, true);
    template.showPanel(lookup.categories.monitoring.name, topRightPanel, true);
    template.showPanel(lookup.categories.treatment.name, bottomLeftPanel, true);
    template.showPanel(lookup.categories.exclusions.name, bottomRightPanel, true);

    base.wireUpTooltips();
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
        patients.populate(pathwayId, pathwayStage, standard, null);
        $('#mainTitle').hide();
        base.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(100);
      });
    } else {
      farLeftPanel.html(panel);
      patients.wireUp(pathwayId, pathwayStage, farLeftPanel, standard);
      patients.populate(pathwayId, pathwayStage, standard, null);
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

  showPanel: function(pathwayStage, location, enableHover) {
    base.showPathwayStageOverviewPanel(location, enableHover, data.pathwayId, pathwayStage);

    if (enableHover) template.highlightOnHoverAndEnableSelectByClick(location);
    else location.children('div').addClass('unclickable');
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

  launchPatientModal: function(pathwayId, pathwayStage, label, value, justtext) {
    var reasons = [],
      header;
    if (justtext !== true && (pathwayStage === lookup.categories.monitoring.name || pathwayStage === lookup.categories.treatment.name)) {
      if (pathwayStage === lookup.categories.monitoring.name) reasons.push({
        "reason": "Has actually already been monitored",
        "value": "alreadymonitored"
      });
      else if (pathwayStage === lookup.categories.treatment.name) reasons.push({
        "reason": "Is actually treated to target",
        "value": "treated"
      });
      reasons.push({
        "reason": "Should be excluded – please see the suggested way on how to do this below in the 'suggested actions panel'",
        "value": "shouldexclude"
      });
      var breach = data.patients[data.patientId].breach.filter(function(val) {
        return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage;
      })[0];
      for (var prop in data[pathwayId][pathwayStage].bdown) {
        if (breach.subsection !== prop) {
          reasons.push({
            "reason": "Should be in the '" + prop + "' group",
            "value": "shouldbe_" + prop.replace(/\s+/g, '')
          });
        }
      }
      reasons.push({
        "reason": "Something else",
        "value": "else"
      });
    }
    if (justtext) {
      header = "Disagree with quality standard missed";
    } else {
      header = "Disagree with improvement opportunity";
    }
    base.launchModal({
      "header": header,
      "item": value,
      "placeholder": "Provide more information here...",
      "reasons": reasons
    }, label, value);
  },

  shouldWeFade: function(oldHash, newHash) {
    oldHash = oldHash.split('/');
    newHash = newHash.split('/');

    if (oldHash[0] === newHash[0] && oldHash[1] === newHash[1] && oldHash[2] === newHash[2] && oldHash[0] && newHash[0]) return false;
    return true;
  }

};

module.exports = template;
