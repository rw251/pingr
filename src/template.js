var data = require('./data.js'),
  actions = require('./actionplan.js'),
  lookup = require('./lookup.js'),
  local = require('./local.js'),
  chart = require('./chart.js'),
  base = require('./base.js'),
  patients = require('./panels/patients.js'),
  individualActionPlan = require('./panels/individualActionPlan.js'),
  teamActionPlan = require('./panels/teamActionPlan.js'),
  allPatients = require('./panels/allPatients.js'),
  confirm = require('./panels/confirm.js'),
  layout = require('./layout.js');

console.log("template.js: data.lastloader= " + data.lastloader);
data.lastloader = "template.js";

var template = {

  wireUpWelcomePage: function(pathwayId, pathwayStage) {
    $('#team-task-panel').on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      actions.editAction("team", ACTIONID, null, this.checked);

      if (this.checked) {
        actions.recordEvent(pathwayId, "team", "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        base.wireUpTooltips();
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              actions.editAction("team", ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              template.updateWelcomePage();
            });
          });
        }, 1000);
      }
      template.updateWelcomePage();
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      template.updateWelcomePage();
    }).on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[1]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {

        actions.editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#team-delete-item').html($($(this).closest('tr').children('td')[1]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        actions.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      actions.editAction("team", ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      template.updateWelcomePage();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          teamActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), actions.getReason("team", ACTIONID), true, function() {
            actions.editAction("team", ACTIONID, false, null, actions.reason);
            template.updateWelcomePage();
            base.wireUpTooltips();
          }, null, function() {
            actions.ignoreAction("team", ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            template.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          actions.ignoreAction("team", ACTIONID);
          other.removeClass("inactive");
        }
      } else if ((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          teamActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), actions.getReason("team", ACTIONID), false, function() {
            actions.editAction("team", ACTIONID, false, null, actions.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            template.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          actions.editAction("team", ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });

    $('#individual-task-panel').on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      actions.editAction(patientId, ACTIONID, null, this.checked);

      if (this.checked) {
        actions.recordEvent(pathwayId, patientId, "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        base.wireUpTooltips();
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              actions.editAction(patientId, ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              template.updateWelcomePage();
            });
          });
        }, 1000);
      }
      template.updateWelcomePage();
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      template.updateWelcomePage();
    }).on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[2]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('shown.bs.modal').on('shown.bs.modal', function() {
        $('#editActionPlanItem').focus();
      }).off('click', '.save-plan').on('click', '.save-plan', function() {

        actions.editPlan(PLANID, $('#editActionPlanItem').val());

        $('#editPlan').modal('hide');
      }).off('keyup', '#editActionPlanItem').on('keyup', '#editActionPlanItem', function(e) {
        if (e.which === 13) $('#editPlan .save-plan').click();
      }).modal();
    }).on('click', '.delete-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#team-delete-item').html($($(this).closest('tr').children('td')[2]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.populateWelcomeTasks(!$('#outstandingTasks').parent().hasClass("active"));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        actions.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      actions.editAction(patientId, ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      template.updateWelcomePage();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      var patientId = $(this).closest('tr').data('team-or-patient-id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          individualActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), actions.getReason(patientId, ACTIONID), true, function() {
            actions.editAction(patientId, ACTIONID, false, null, actions.reason);
            template.updateWelcomePage();
            base.wireUpTooltips();
          }, null, function() {
            actions.ignoreAction(patientId, ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            template.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          actions.ignoreAction(patientId, ACTIONID);
          other.removeClass("inactive");
        }
      } else if ((!$(this).hasClass("active") && other.hasClass("active")) || $(this).closest('tr').hasClass('success')) {
        //prevent clicking on unselected option or if the row is complete
        e.stopPropagation();
        e.preventDefault();
        return;
      } else {
        //selecting
        var self = this;
        if (checkbox.val() === "no") {
          individualActionPlan.launchModal(data.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), actions.getReason(patientId, ACTIONID), false, function() {
            actions.editAction(patientId, ACTIONID, false, null, actions.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            template.updateWelcomePage();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          actions.editAction(patientId, ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    });

    template.updateWelcomePage();
  },

  updateWelcomePage: function() {
    $('#team-task-panel').add('#individual-task-panel').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });

    $('#team-task-panel').add('#individual-task-panel').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    $('#team-task-panel').add('#individual-task-panel').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text
    $('#team-task-panel').add('#individual-task-panel').find('tr').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          self.removeClass('danger');
          self.addClass('active');
          self.find('td').last().children().show();
          if (local.getObj().actions.team[self.data("id")] && local.getObj().actions.team[self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + local.getObj().actions.team[self.data("id")].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          self.removeClass('active');
          self.addClass('danger');
          self.removeClass('success');
          if (local.getObj().actions.team[self.data("id")] && local.getObj().actions.team[self.data("id")].history) {
            $(this).parent().attr("title", "<p>" + local.getObj().actions.team[self.data("id")].history[0] + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You disagreed - click again to edit/cancel").tooltip('fixTitle').tooltip('hide');
          }
        }
      });
      if (self.find('.btn-toggle input[type=checkbox]:not(:checked)').length == 1) {
        self.find('.btn-toggle input[type=checkbox]:not(:checked)').parent().addClass("inactive").attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
      }
      if (!any) {
        self.removeClass('danger');
        self.removeClass('active');
        self.removeClass('success');

        self.find('.btn-toggle.btn-yes').attr("title", "Click to agree with this action and save it in your agreed actions list  ").tooltip('fixTitle').tooltip('hide');
        self.find('.btn-toggle.btn-no').attr("title", "Click to disagree with this action and remove it from your suggested actions list ").tooltip('fixTitle').tooltip('hide');
      }

      base.wireUpTooltips();
    });

    base.wireUpTooltips();
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

        template.populateWelcomeTasks();


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

  populateWelcomeTasks: function(complete) {

    //add tasks
    var teamTasks = [];
    var individualTasks = [];

    //Add the team tasks
    for (var k in actions.listActions("team")) {
      if (actions.listActions("team")[k].agree && ((!actions.listActions("team")[k].done && !complete) || (actions.listActions("team")[k].done && complete))) {
        teamTasks.push({
          "pathway": "N/A",
          "task": actions.text[actions.listActions("team")[k].id].text,
          "data": actions.listActions("team")[k].id,
          "tpId": "team",
          "agree": true,
          "done": complete
        });
      }
    }

    //Add the user added team tasks
    for (k in actions.listPlans("team")) {
      if ((!actions.listPlans("team")[k].done && !complete) || (actions.listPlans("team")[k].done && complete)) {
        teamTasks.push({
          "canEdit": true,
          "pathway": data.pathwayNames[actions.listPlans("team")[k].pathwayId],
          "pathwayId": actions.listPlans("team")[k].pathwayId,
          "task": actions.listPlans("team")[k].text,
          "data": actions.listPlans("team")[k].id,
          "agree": actions.listPlans("team")[k].agree,
          "disagree": actions.listPlans("team")[k].agree === false,
          "done": complete
        });
      }
    }

    //Add individual
    for (k in actions.listActions()) {
      if (k === "team") continue;
      for (var l in actions.listActions()[k]) {
        if (actions.text[l] && actions.listActions()[k][l].agree && ((!actions.listActions()[k][l].done && !complete) || (actions.listActions()[k][l].done && complete))) {
          individualTasks.push({
            "pathway": "N/A",
            "patientId": k,
            "task": actions.text[l].text,
            "pathwayId": actions.listPlans()[k][l].pathwayId,
            "data": l,
            "tpId": k,
            "agree": true,
            "done": complete
          });
        }
      }
    }

    //Add custom individual
    for (k in actions.listPlans()) {
      if (k === "team") continue;
      for (var l in actions.listPlans()[k]) {
        if (actions.listPlans()[k][l].text && (!actions.listPlans()[k][l].done && !complete) || (actions.listPlans()[k][l].done && complete)) {
          individualTasks.push({
            "canEdit": true,
            "pathway": data.pathwayNames[actions.listPlans()[k][l].pathwayId],
            "pathwayId": actions.listPlans()[k][l].pathwayId,
            "patientId": k,
            "tpId": k,
            "task": actions.listPlans()[k][l].text,
            "data": l,
            "agree": true,
            "done": complete
          });
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

    var tempMust = $('#welcome-task-items').html();
    var itemTemplate = $('#welcome-task-item').html();
    Mustache.parse(tempMust);
    Mustache.parse(itemTemplate);

    $('#team-add-plan').off('click').on('click', '.add-plan', function() {
      var plan = $(this).parent().parent().find('textarea').val();
      var planId = recordPlan("team", plan, "custom");
      $('#team-task-panel').find('table tbody').append(Mustache.render(itemTemplate, {
        "pathway": "",
        "pathwayId": "custom",
        "canEdit": true,
        "task": plan,
        "data": planId,
        "agree": null,
        "done": null
      }, {
        "chk": $('#checkbox-template').html()
      }));
    });

    rendered = Mustache.render(tempMust, {
      "tasks": teamTasks,
      "hasTasks": teamTasks.length > 0
    }, {
      "task-item": itemTemplate,
      "chk": $('#checkbox-template').html()
    });
    $('#team-task-panel').children().not(":first").remove();
    $('#team-task-panel').append(rendered);

    rendered = Mustache.render(tempMust, {
      "tasks": individualTasks,
      "isPatientTable": true,
      "hasTasks": individualTasks.length > 0
    }, {
      "task-item": itemTemplate,
      "chk": $('#checkbox-template').html()
    });
    $('#individual-task-panel').children().not(":first").remove();
    $('#individual-task-panel').append(rendered);

    template.wireUpWelcomePage();
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
