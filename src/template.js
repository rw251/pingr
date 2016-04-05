var data = require('./data.js'),
  actions = require('./actionplan.js'),
  lookup = require('./lookup.js'),
  local = require('./local.js'),
  chart = require('./chart.js'),
  base = require('./base.js'),
  patients = require('./panels/patients.js'),
  qualityStandard = require('./panels/qualityStandard.js'),
  confirm = require('./panels/confirm.js');

console.log("template.js: data.lastloader= " + data.lastloader);
data.lastloader = "template.js";

var template = {

  elements: {},

  showOverviewPanels: function() {
    template.switchTo221Layout();

    template.showPanel(lookup.categories.diagnosis.name, topLeftPanel, true);
    template.showPanel(lookup.categories.monitoring.name, topRightPanel, true);
    template.showPanel(lookup.categories.treatment.name, bottomLeftPanel, true);
    template.showPanel(lookup.categories.exclusions.name, bottomRightPanel, true);

    base.wireUpTooltips();
  },

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
          template.launchTeamModal(data.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), actions.getReason("team", ACTIONID), true, function() {
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
          template.launchTeamModal(data.selected, checkbox.closest('tr').children(':nth(1)').find('span').text(), actions.getReason("team", ACTIONID), false, function() {
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
          template.launchPatientActionModal(data.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), actions.getReason(patientId, ACTIONID), true, function() {
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
          template.launchPatientActionModal(data.selected, checkbox.closest('tr').children(':nth(2)').find('span').text(), actions.getReason(patientId, ACTIONID), false, function() {
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

  //Side panel, navigation, header bar and main page
  showMainView: function(idx) {
    //Set up navigation panel
    template.showSidePanel();
    template.showNavigation(data.diseases, idx, $('#main-dashboard'));

    template.showHeaderBarItems();

    //Show main dashboard page
    template.showPage('main-dashboard');
  },
  //Show the overview page for a disease
  showOverview: function(disease) {
    data.pathwayId = disease;

    template.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(disease));

    $('aside li ul li').removeClass('active');
    $('aside a[href="#main/' + disease + '"]:contains("Overview")').parent().addClass('active');

    $('#mainTitle').show();
    template.updateTitle(data[data.pathwayId]["display-name"] + ": Overview (practice-level data)");

    //Show overview panels
    template.showOverviewPanels();
    template.showTeamActionPlanPanel(farRightPanel);
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
  },
  //Show the pathway stage for a disease
  showPathwayStageView: function(pathwayId, pathwayStage, standard, shouldFade) {
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    data.pathwayId = pathwayId;
    template.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage, "g");
    $('aside a').filter(function() {
      return this.href.match(re);
    }).parent().addClass('active');

    template.switchTo110Layout();

    if (!standard) {
      standard = Object.keys(data[pathwayId][pathwayStage].standards)[0];
    }

    var panel = patients.create(pathwayId, pathwayStage, standard);

    if (shouldFade) {
      farLeftPanel.fadeOut(100, function() {
        $(this).html(panel);
        patients.wireUpPatientPanel(pathwayId, pathwayStage, farLeftPanel, standard);
        patients.populatePatientPanel(pathwayId, pathwayStage, standard, null);
        $('#mainTitle').hide();
        template.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(100);
      });
    } else {
      farLeftPanel.html(panel);
      patients.wireUpPatientPanel(pathwayId, pathwayStage, farLeftPanel, standard);
      patients.populatePatientPanel(pathwayId, pathwayStage, standard, null);
      $('#mainTitle').hide();
      template.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
    }

    var tempMust = $('#patient-panel-placeholder').html();
    farRightPanel.html(Mustache.render(tempMust));
  },

  showPathwayStageViewOk: function(pathwayId, pathwayStage, shouldFade) {
    farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');
    template.showMainView(data.diseases.map(function(v) {
      return v.id;
    }).indexOf(pathwayId));

    $('aside li ul li').removeClass('active');
    var re = new RegExp(pathwayStage, "g");
    $('aside a').filter(function() {
      return this.href.match(re);
    }).parent().addClass('active');

    template.switchTo110Layout();

    var panel = patients.createOk(pathwayId, pathwayStage);

    if (shouldFade) {
      farLeftPanel.fadeOut(200, function() {
        $(this).html(panel);
        patients.wireUpPatientPanelOk(pathwayId, pathwayStage, farLeftPanel);
        patients.populatePatientPanelOk(pathwayId, pathwayStage, null);
        $('#mainTitle').hide();
        template.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
        $(this).fadeIn(300);
      });
      var tempMust = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(tempMust));
    } else {
      farLeftPanel.html(panel);
      patients.wireUpPatientPanelOk(pathwayId, pathwayStage, farLeftPanel);
      patients.populatePatientPanelOk(pathwayId, pathwayStage, null);
      $('#mainTitle').hide();
      template.updateTitle(data[pathwayId][pathwayStage].text.page.text, data[pathwayId][pathwayStage].text.page.tooltip);
    }
  },

  //Show patient view within the pathway stage view
  showPathwayStagePatientView: function(patientId, pathwayId, pathwayStage, standard) {
    data.patientId = patientId;

    template.switchTo110Layout();

    template.showIndividualPatientPanel(pathwayId, pathwayStage, standard, patientId);
  },

  /**************
   *** Layout ***
   **************/
  switchTo110Layout: function() {
    if (template.layout === "110") return;
    template.layout = "110";
    farLeftPanel.removeClass('col-lg-3').addClass('col-lg-6').show();
    topPanel.hide();
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    midPanel.hide();
    farRightPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
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
            "task": listPlans()[k][l].text,
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

  switchTo221Layout: function() {
    if (template.layout === "221") return;
    template.layout = "221";
    farLeftPanel.hide();
    topPanel.hide();
    topLeftPanel.addClass('col-xl-6').show();
    bottomLeftPanel.addClass('col-xl-6').show();
    topRightPanel.removeClass('col-xl-12').addClass('col-xl-6').show();
    bottomRightPanel.removeClass('col-xl-12').addClass('col-xl-6').show();
    midPanel.removeClass('col-xl-4').addClass('col-xl-8').show();
    farRightPanel.removeClass('col-xl-8').addClass('col-xl-4').show();
  },

  updateTitle: function(title, tooltip) {
    $('.pagetitle').html(title).attr('title', tooltip).tooltip({
      delay: {
        "show": 500,
        "hide": 100
      }
    });
  },

  clearNavigation: function() {
    $("aside.left-panel nav.navigation > ul > li > ul").slideUp(300);
    $("aside.left-panel nav.navigation > ul > li").removeClass('active');
  },

  showNavigation: function(list, idx, parent) {
    if (template.elements.navigation) {

      if (idx === -1) {
        template.clearNavigation();
        $('aside a[href="#welcome"]:first').closest('li').addClass('active');
      } else if (idx >= list.length) {
        template.clearNavigation();
        $('aside a[href="#patients"]').closest('li').addClass('active');
      } else if (!$('aside a[href="#' + list[idx].link + '"]:first').closest('li').hasClass('active')) {
        template.clearNavigation();
        //set active
        $('aside a[href="#' + list[idx].link + '"]').next().slideToggle(300);
        $('aside a[href="#' + list[idx].link + '"]').closest('li').addClass('active');
      }

      return;
    }

    var tempMust = $('#pathway-picker').html();
    var itemTemplate = $('#pathway-picker-item').html();
    Mustache.parse(tempMust);
    Mustache.parse(itemTemplate);

    list = list.slice();
    list[0].isBreakAbovePractice = true;
    for (var i = 0; i < list.length; i++) {
      list[i].hasSubItems = true;
    }
    list.unshift({
      "link": "welcome",
      "faIcon": "fa-home",
      "name": "Agreed actions",
      "isBreakAboveHome": true,
      "text": {
        "main": {
          "tooltip": "Agreed tooltip - edit in script.js"
        }
      }
    });
    list.push({
      "link": "patients",
      "faIcon": "fa-users",
      "name": "All Patients",
      "isBreakAbovePatient": true,
      "text": {
        "main": {
          "tooltip": "All patients tooltip - edit in script.js"
        }
      }
    });

    list.map(function(v, i, arr) {
      v.isSelected = i === idx + 1;
      return v;
    });

    var renderedBefore = Mustache.render(tempMust, {
      "items": list
    }, {
      "item": itemTemplate,
      "subItem": $('#pathway-picker-sub-item').html()
    });
    $('#aside-toggle nav:first').html(renderedBefore);

    $('.user').on('click', function() {
      template.loadContent('#welcome');
    });

    template.elements.navigation = true;
  },

  showPage: function(page) {
    if (template.page === page) return;
    template.page = page;
    $('.page').hide();
    $('#' + page).show();

    if (page !== 'main-dashboard') {
      template.hideSidePanel();
      template.hideHeaderBarItems();
    }
  },

  showSidePanel: function() {
    if (template.elements.navigtion) return;
    template.elements.navigtion = true;
    $('#main').addClass('content');
    $('#topnavbar').addClass('full');
    $('#aside-toggle').show();
    $('#bottomnavbar').hide();
  },

  hideSidePanel: function() {
    if (template.elements.navigtion === false) return;
    template.elements.navigtion = false;
    $('#main').removeClass('content');
    $('#topnavbar').removeClass('full');
    $('#aside-toggle').hide();
    $('#bottomnavbar').show();
  },

  showHeaderBarItems: function() {
    if (template.elements.headerbar) return;
    template.elements.headerbar = true;
    $('.hide-if-logged-out').show();
  },

  hideHeaderBarItems: function() {
    if (template.elements.headerbar === false) return;
    template.elements.headerbar = false;
    $('.hide-if-logged-out').hide();
  },

  /**************
   *** Panels ***
   **************/

  hideAllPanels: function() {
    topLeftPanel.hide();
    bottomLeftPanel.hide();
    topRightPanel.hide();
    bottomRightPanel.hide();
    farLeftPanel.hide();
    farRightPanel.hide();
    topPanel.hide();
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

  showAllPatientPanel: function(location) {
    base.createPanelShow($('#all-patients-panel'), location, {
      "n": data.getAllPatients().length
    });

    patientsPanel = $('#patients');

    patientsPanel.on('click', 'tbody tr', function(e) { //Select individual patient when row clicked
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      template.showAllPatientView(patientId);

      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });
  },

  showTeamActionPlanPanel: function(location) {
    base.createPanelShow($('#team-action-plan-panel'), location);

    suggestedPlanTeam = $('#suggestedPlanTeam');

    suggestedPlanTeam.on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      actions.editAction("team", ACTIONID, null, this.checked);

      if (this.checked) {
        actions.recordEvent(data.pathwayId, "team", "Item completed");
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
              template.updateTeamSapRows();
            });
          });
        }, 1000);
      }

      template.updateTeamSapRows();
    });

    $('#personalPlanTeam').on('click', 'input[type=checkbox]', function() {
      var PLANID = $(this).closest('tr').data("id");
      editPlan(PLANID, null, this.checked);

      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
        recordEvent(data.pathwayId, "team", "Personal plan item");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            base.wireUpTooltips();
            parent.find('button').on('click', function() {
              PLANID = $(this).closest('tr').data('id');
              editPlan("team", PLANID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              template.updateTeamSapRows();
            });
          });
        }, 1000);
      }

    }).on('click', '.btn-undo', function(e) {
      var PLANID = $(this).closest('tr').data('id');
      actions.editPlan(PLANID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      template.updateTeamSapRows();
      e.stopPropagation();
    });

    var teamTab = $('#tab-plan-team'),
      current;
    teamTab.on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
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

      $('#team-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        actions.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.add-plan', function() {
      actions.recordPlan("team", $(this).parent().parent().find('textarea').val(), data.pathwayId);

      template.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      template.updateTeamSapRows();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      actions.editAction("team", ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      template.updateTeamSapRows();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          template.launchTeamModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), actions.getReason("team", ACTIONID), true, function() {
            actions.editAction("team", ACTIONID, false, null, actions.reason);
            template.updateTeamSapRows();
            base.wireUpTooltips();
          }, null, function() {
            actions.ignoreAction("team", ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            template.updateTeamSapRows();
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
          template.launchTeamModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), actions.getReason("team", ACTIONID), false, function() {
            actions.editAction("team", ACTIONID, false, null, actions.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            template.updateTeamSapRows();
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
    }).on('keyup', 'input[type=text]', function(e) {
      if (e.which === 13) {
        teamTab.find('.add-plan').click();
      }
    });

    template.populateTeamSuggestedActionsPanel();
  },

  populateTeamSuggestedActionsPanel: function() {
    var suggestions = template.suggestionList(actions.plan[data.pathwayId].team);
    suggestions = template.sortSuggestions(template.mergeTeamStuff(suggestions));

    base.createPanelShow(suggestedPlanTemplate, suggestedPlanTeam, {
      "suggestions": suggestions
    }, {
      "item": $('#suggested-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });

    template.displayPersonalisedTeamActionPlan($('#personalPlanTeam'));
  },

  populateSuggestedActionsPanel: function(pathwayStage) {
    if (pathwayStage === lookup.categories.exclusions.name) {
      suggestedPlanTeam.html('No team actions for excluded patients');
    } else if (pathwayStage === lookup.categories.diagnosis.name) {
      suggestedPlanTeam.html('No team actions for these patients');
    } else {
      base.createPanelShow(suggestedPlanTemplate, suggestedPlanTeam, data[data.pathwayId][pathwayStage], {
        "item": $('#suggested-plan-item').html(),
        "chk": $('#checkbox-template').html()
      });

      template.displayPersonalisedIndividualActionPlan(pathwayStage, $('#personalPlanTeam'));

      base.createPanelShowvidualSapRows();
    }
  },

  updateTeamSapRows: function() {
    suggestedPlanTeam.add('#personalPlanTeam').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });

    suggestedPlanTeam.add('#personalPlanTeam').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    suggestedPlanTeam.add('#personalPlanTeam').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text
    suggestedPlanTeam.add('#personalPlanTeam').find('tr').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          self.removeClass('danger');
          self.addClass('active');
          self.find('td').last().children().show();
          if (local.getObj().actions.team[self.data("id")].history) {
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

  updateIndividualSapRows: function() {
    $('#advice-list').add('#personalPlanIndividual').find('.suggestion').each(function() {
      $(this).find('td').last().children().hide();
    });

    $('#advice-list').add('#personalPlanIndividual').find('.cr-styled input[type=checkbox]').each(function() {
      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
      } else {
        $(this).parent().parent().parent().removeClass('success');
      }
    });

    $('#advice-list').add('#personalPlanIndividual').find('.btn-undo').each(function() {
      $(this).parent().parent().addClass('success');
    });

    //no class - user not yet agreed/disagreed - no background / muted text
    //active - user agrees - green background / normal text
    //success - user completed - green background / strikethrough text
    //danger - user disagrees - red background / strikethrough text

    $('#advice-list').add('#personalPlanIndividual').find('tr').each(function() {
      var self = $(this);
      var any = false;
      self.find('.btn-toggle input[type=checkbox]:checked').each(function() {
        any = true;
        if (this.value === "yes") {
          self.removeClass('danger');
          self.addClass('active');
          self.find('td').last().children().show();
          if (local.getObj().actions[data.patientId][self.data("id")].history) {
            var tool = $(this).closest('tr').hasClass('success') ? "" : "<p>" + local.getObj().actions[data.patientId][self.data("id")].history[0] + "</p><p>Click again to cancel</p>";
            $(this).parent().attr("title", tool).attr("data-original-title", tool).tooltip('fixTitle').tooltip('hide');
          } else {
            $(this).parent().attr("title", "You agreed - click again to cancel").tooltip('fixTitle').tooltip('hide');
          }
        } else {
          self.removeClass('active');
          self.addClass('danger');
          self.removeClass('success');
          if (local.getObj().actions[data.patientId][self.data("id")] && local.getObj().actions[data.patientId][self.data("id")].history) {
            $(this).parent().attr("title", "<p>" + local.getObj().actions[data.patientId][self.data("id")].history[0] + "</p><p>Click again to edit/cancel</p>").tooltip('fixTitle').tooltip('hide');
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

  createIndividualActionPlanPanel: function(pathwayStage) {
    return base.createPanel($('#individual-action-plan-panel'), {
      "pathwayStage": pathwayStage || "default",
      "noHeader": true
    });
  },

  wireUpIndividualActionPlanPanel: function(pathwayId, pathwayStage, standard, patientId) {
    individualTab = $('#tab-plan-individual');

    $('#advice-list').on('click', '.cr-styled input[type=checkbox]', function() {
      var ACTIONID = $(this).closest('tr').data('id');
      actions.editAction(data.patientId, ACTIONID, null, this.checked);

      if (this.checked) {
        actions.recordEvent(pathwayId, data.patientId, "Item completed");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            base.wireUpTooltips();
            parent.find('button').on('click', function() {
              ACTIONID = $(this).closest('tr').data('id');
              actions.editAction(data.patientId, ACTIONID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              template.updateIndividualSapRows();
            });
          });
        }, 1000);
      }

      template.updateIndividualSapRows();
    });

    $('#personalPlanIndividual').on('click', 'input[type=checkbox]', function() {
      var PLANID = $(this).closest('tr').data("id");
      actions.editPlan(PLANID, null, this.checked);

      if (this.checked) {
        $(this).parent().parent().parent().addClass('success');
        actions.recordEvent(pathwayId, data.patientId, "Personal plan item");
        var self = this;
        $(self).parent().attr("title", "").attr("data-original-title", "").tooltip('fixTitle').tooltip('hide');
        setTimeout(function(e) {
          $(self).parent().fadeOut(300, function() {
            var parent = $(this).parent();
            $(this).replaceWith(base.createPanel($('#checkbox-template'), {
              "done": true
            }));
            base.wireUpTooltips();
            parent.find('button').on('click', function() {
              PLANID = $(this).closest('tr').data('id');
              actions.editPlan(data.patientId, PLANID, null, false);
              $(this).replaceWith(base.createPanel($('#checkbox-template'), {
                "done": false
              }));
              template.updateIndividualSapRows();
            });
          });
        }, 1000);
      }
    }).on('click', '.btn-undo', function(e) {
      var PLANID = $(this).closest('tr').data('id');
      actions.editPlan(PLANID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      template.updateIndividualSapRows();
      e.stopPropagation();
    });

    individualTab.on('click', '.edit-plan', function() {
      var PLANID = $(this).closest('tr').data("id");

      $('#editActionPlanItem').val($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#editPlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.displayPersonalisedIndividualActionPlan(data.patientId, $('#personalPlanIndividual'));
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

      $('#individual-delete-item').html($($(this).closest('tr').children('td')[0]).find('span').text());

      $('#deletePlan').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        template.displayPersonalisedIndividualActionPlan(data.patientId, $('#personalPlanIndividual'));
      }).off('click', '.delete-plan').on('click', '.delete-plan', function() {
        actions.deletePlan(PLANID);

        $('#deletePlan').modal('hide');
      }).modal();
    }).on('click', '.add-plan', function() {
      actions.recordPlan(data.patientId, $(this).parent().parent().find('textarea').val(), pathwayId);

      template.displayPersonalisedIndividualActionPlan(data.patientId, $('#personalPlanIndividual'));
    }).on('change', '.btn-toggle input[type=checkbox]', function() {
      template.updateIndividualSapRows();
    }).on('click', '.btn-undo', function(e) {
      var ACTIONID = $(this).closest('tr').data('id');
      actions.editAction(data.patientId, ACTIONID, null, false);
      $(this).replaceWith(base.createPanel($('#checkbox-template'), {
        "done": false
      }));
      template.updateIndividualSapRows();
    }).on('click', '.btn-yes,.btn-no', function(e) {
      var checkbox = $(this).find("input[type=checkbox]");
      var other = $(this).parent().find($(this).hasClass("btn-yes") ? ".btn-no" : ".btn-yes");
      var ACTIONID = $(this).closest('tr').data('id');
      if ($(this).hasClass("active") && other.hasClass("inactive") && !$(this).closest('tr').hasClass('success')) {
        //unselecting
        if (checkbox.val() === "no") {
          template.launchPatientActionModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), actions.getReason(data.patientId, ACTIONID), true, function() {
            actions.editAction(data.patientId, ACTIONID, false, null, actions.reason);
            template.updateIndividualSapRows();
            base.wireUpTooltips();
          }, null, function() {
            actions.ignoreAction(data.patientId, ACTIONID);
            other.removeClass("inactive");
            checkbox.removeAttr("checked");
            checkbox.parent().removeClass("active");
            template.updateIndividualSapRows();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          actions.ignoreAction(data.patientId, ACTIONID);
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
          template.launchPatientActionModal(data.selected, checkbox.closest('tr').children().first().children().first().text(), actions.getReason(data.patientId, ACTIONID), false, function() {
            actions.editAction(data.patientId, ACTIONID, false, null, actions.reason);
            $(self).removeClass("inactive");

            checkbox.attr("checked", "checked");
            checkbox.parent().addClass("active");
            //unselect other
            other.removeClass("active").addClass("inactive");
            other.find("input[type=checkbox]").prop("checked", false);
            template.updateIndividualSapRows();
            base.wireUpTooltips();
          });
          e.stopPropagation();
          e.preventDefault();
        } else {
          actions.editAction(data.patientId, ACTIONID, true);
          $(this).removeClass("inactive");

          //unselect other
          other.removeClass("active").addClass("inactive");
          other.find("input[type=checkbox]").prop("checked", false);
        }
      }
    }).on('keyup', 'input[type=text]', function(e) {
      if (e.which === 13) {
        individualTab.find('.add-plan').click();
      }
    });

    template.populateIndividualSuggestedActions(patientId, pathwayId, pathwayStage, standard);
  },

  wireUpStandardDropDown: function(pathwayId, pathwayStage, standard, callback) {
    var breaches = data.options.filter(function(val) {
      return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage && val.standard === standard;
    });

    if (breaches.length > 0) $('select').val(breaches[0].value);

    $('select').select2({
      templateResult: template.formatStandard,
      minimumResultsForSearch: Infinity
    });
    $('span.select2-selection__rendered').attr("title", "");
    $('select').on('change', function() {
      var localData = $(this).find(':selected').data();
      callback(localData.pathwayId, localData.pathwayStage, localData.standard, data.patientId);
    }).on("select2:open", function(e) {
      base.wireUpTooltips();
    });
  },

  suggestionList: function(ids) {
    return ids.map(function(val) {
      return {
        "id": val.id || val,
        "text": actions.text[val.id || val].text,
        "subsection": val.subsection
      };
    });
  },

  mergeIndividualStuff: function(suggestions, patientId) {
    var localActions = actions.listActions();
    if (!localActions[patientId]) return suggestions;

    for (var i = 0; i < suggestions.length; i++) {
      if (localActions[patientId][suggestions[i].id]) {
        if (localActions[patientId][suggestions[i].id].agree) {
          suggestions[i].agree = true;
        } else if (localActions[patientId][suggestions[i].id].agree === false) {
          suggestions[i].disagree = true;
        }
        if (localActions[patientId][suggestions[i].id].done) suggestions[i].done = localActions[patientId][suggestions[i].id].done;
      }
    }
    return suggestions;
  },

  populateIndividualSuggestedActions: function(patientId, pathwayId, pathwayStage, standard) {
    var localData = {
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    };
    var breaches = data.patients[patientId].breach ? data.patients[patientId].breach.filter(function(v) {
      return v.pathwayId === pathwayId && v.pathwayStage === pathwayStage && v.standard === standard;
    }) : [];

    var fn = function(val) {
      return {
        "id": val,
        "subsection": subsection
      };
    };

    if (breaches.length === 0) {
      localData.noSuggestions = true;
    } else {
      var suggestions = [],
        subsection = "";
      for (var i = 0; i < breaches.length; i++) {
        subsection = breaches[i].subsection;
        suggestions = suggestions.concat(data[pathwayId][pathwayStage].bdown[subsection].suggestions ?
          data[pathwayId][pathwayStage].bdown[subsection].suggestions.map(fn) : []);
      }

      localData.suggestions = template.sortSuggestions(template.mergeIndividualStuff(template.suggestionList(suggestions), patientId));
      localData.section = {
        "name": data[pathwayId][pathwayStage].bdown[subsection].name,
        "agree": actions.getPatientAgree(pathwayId, pathwayStage, patientId, "section") === true,
        "disagree": actions.getPatientAgree(pathwayId, pathwayStage, patientId, "section") === false,
      };
      localData.category = {
        "name": data.patients[patientId].category,
        "agree": actions.getPatientAgree(pathwayId, pathwayStage, patientId, "category") === true,
        "disagree": actions.getPatientAgree(pathwayId, pathwayStage, patientId, "category") === false,
      };
    }

    $('#advice-placeholder').hide();
    $('#advice').show();

    base.createPanelShow(individualPanel, $('#advice-list'), localData, {
      "chk": $('#checkbox-template').html()
    });

    //Wire up any clipboard stuff in the suggestions
    $('#advice-list').find('span:contains("[COPY")').each(function() {
      var html = $(this).html();
      $(this).html(html.replace(/\[COPY:([^\]]*)\]/g, '$1 <button type="button" data-clipboard-text="$1" data-content="Copied" data-toggle="tooltip" data-placement="top" title="Copy $1 to clipboard." class="btn btn-xs btn-default btn-copy"><span class="fa fa-clipboard"></span></button>'));
    });

    $('#advice-list').find('span:contains("[INFO")').each(function() {
      var html = $(this).html();
      var subsection = $(this).data().subsection;
      var desc = data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
          return val.name === subsection;
        }).length > 0 ?
        data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].desc : subsection;
      var tooltip = subsection ? "This action is suggested because PINGR classified this patient as:'" + desc + "'" : '';
      var newHtml = ' <i class="fa fa-info-circle fa-lg info-button clickable" data-toggle="tooltip" data-placement="right" title="' + tooltip + '"></i>';
      $(this).html(html.replace(/\[INFO\]/g, newHtml));
    });

    $('#advice-list').find('span:contains("[MED-SUGGESTION")').each(function() {
      var html = $(this).html();
      var suggestion = Math.random() < 0.33 ? "Increase Ramipril to 10mg per day" : (Math.random() < 0.5 ? "Consider adding an ACE inhibior" : "Consider adding a thiazide-like diuretic");
      $(this).html(html.replace(/\[MED\-SUGGESTION\]/g, suggestion));
    });


    base.setupClipboard($('.btn-copy'), true);

    template.displayPersonalisedIndividualActionPlan(patientId, $('#personalPlanIndividual'));
  },

  displayPersonalisedTeamActionPlan: function(parentElem) {
    var plans = template.sortSuggestions(template.addDisagreePersonalTeam(actions.listPlans("team", data.pathwayId)));

    base.createPanelShow(actionPlanList, parentElem, {
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }, {
      "action-plan": $('#action-plan').html(),
      "action-plan-item": $('#action-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });

    template.updateTeamSapRows();
  },

  displayPersonalisedIndividualActionPlan: function(id, parentElem) {
    var plans = template.sortSuggestions(template.addDisagreePersonalTeam(actions.listPlans(id)));

    base.createPanelShow(actionPlanList, parentElem, {
      "hasSuggestions": plans && plans.length > 0,
      "suggestions": plans
    }, {
      "action-plan": $('#action-plan').html(),
      "action-plan-item": $('#action-plan-item').html(),
      "chk": $('#checkbox-template').html()
    });

    template.updateIndividualSapRows();
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

  addDisagreePersonalTeam: function(plans) {
    for (var i = 0; i < plans.length; i++) {
      if (plans[i].agree) {
        plans[i].disagree = false;
      } else if (plans[i].agree === false) {
        plans[i].disagree = true;
      }
    }
    return plans;
  },

  addDisagree: function(suggestions, actions, id) {
    for (var i = 0; i < suggestions.length; i++) {
      if (actions[id][suggestions[i].id]) {
        if (actions[id][suggestions[i].id].agree) {
          suggestions[i].agree = true;
          suggestions[i].disagree = false;
        } else if (actions[id][suggestions[i].id].agree === false) {
          suggestions[i].agree = false;
          suggestions[i].disagree = true;
        }
        if (actions[id][suggestions[i].id].done) suggestions[i].done = actions[id][suggestions[i].id].done;
        else suggestions[i].done = false;
      }
    }
    return suggestions;
  },

  mergeTeamStuff: function(suggestions) {
    var teamActions = actions.listActions();
    if (!teamActions.team) return suggestions;

    suggestions = template.addDisagree(suggestions, teamActions, "team");
    return suggestions;
  },

  sortSuggestions: function(suggestions) {
    suggestions.sort(function(a, b) {
      if (a.agree && !a.done) {
        if (b.agree && !b.done) return 0;
        return -1;
      } else if (!a.agree && !a.disagree) {
        if (!b.agree && !b.disagree) return 0;
        if (b.agree && !b.done) return 1;
        return -1;
      } else if (a.agree && a.done) {
        if (b.agree && b.done) return 0;
        if (b.disagree) return -1;
        return 1;
      } else {
        if (b.disagree) return 0;
        return 1;
      }
    });

    return suggestions;
  },

  launchTeamModal: function(label, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var reasons = [{
      "reason": "We've already done this",
      "value": "done"
    }, {
      "reason": "It wouldn't work",
      "value": "nowork"
    }, {
      "reason": "Other",
      "value": "else"
    }];
    if (reason && reason.reason) {
      for (var i = 0; i < reasons.length; i++) {
        if (reasons[i].reason === reason.reason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    template.launchModal({
      "header": "Disagree with a suggested action",
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Enter free-text here...",
      "reasons": reasons
    }, label, value, reason ? reason.reasonText : null, callbackOnSave, callbackOnCancel, callbackOnUndo);
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
    template.launchModal({
      "header": header,
      "item": value,
      "placeholder": "Provide more information here...",
      "reasons": reasons
    }, label, value);
  },

  launchPatientActionModal: function(label, value, reason, isUndo, callbackOnSave, callbackOnCancel, callbackOnUndo) {
    var reasons = [{
      "reason": "Already done this",
      "value": "done"
    }, {
      "reason": "Wouldn't work",
      "value": "nowork"
    }, {
      "reason": "Something else",
      "value": "else"
    }];
    if (reason && reason.reason) {
      for (var i = 0; i < reasons.length; i++) {
        if (reasons[i].reason === reason.reason) {
          reasons[i].checked = true;
          break;
        }
      }
    }
    template.launchModal({
      "header": "Disagree with a suggested action",
      "isUndo": isUndo,
      "item": value,
      "placeholder": "Provide more information here...",
      "reasons": reasons
    }, label, value, reason ? reason.reasonText : null, callbackOnSave, callbackOnCancel, callbackOnUndo);
  },

  loadContent: function(hash, isPoppingState) {
    base.hideTooltips();

    var i, pathwayId, pathwayStage;
    if (!isPoppingState) {
      window.location.hash = hash;
    }

    if (hash === '') {
      base.clearBox();
      template.showPage('login');
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

        if (pathwayStage && template.page !== 'main-dashboard') {
          $('.page').hide();
          $('#main-dashboard').show();

          template.showSidePanel();
          template.showOverviewPanels();
          template.showHeaderBarItems();
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
        template.showPage('help-page');

        template.showSidePanel();
        template.showHeaderBarItems();
        template.showNavigation(data.diseases, -1, $('#help-page'));
        template.clearNavigation();
      } else if (urlBits[0] === "#patients") {

        var patientId = urlBits[1];
        pathwayId = urlBits[2];

        template.showAllPatientView(patientId, true);

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
        template.showPage('welcome');

        template.showSidePanel();
        template.showHeaderBarItems();
        template.showNavigation(data.diseases, -1, $('#welcome'));

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

  shouldWeFade: function(oldHash, newHash) {
    oldHash = oldHash.split('/');
    newHash = newHash.split('/');

    if (oldHash[0] === newHash[0] && oldHash[1] === newHash[1] && oldHash[2] === newHash[2] && oldHash[0] && newHash[0]) return false;
    return true;
  },

  showIndividualPatientPanel: function(pathwayId, pathwayStage, standard, patientId) {
    var stan = data[pathwayId][pathwayStage].standards[standard] ? data[pathwayId][pathwayStage].standards[standard].tab.title : "UNSPECIFIED";

    data.options.sort(function(a, b) {
      a = data.getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = data.getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if (a === b) return 0;
      if (a === "not") return 1;
      if (b === "not") return -1;
      if (a === "ok") return 1;
      if (b === "ok") return -1;
      alert("!!!!!!!");
    });

    var panel = base.createPanel($('#patient-panel'), {
      "options": data.options,
      "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
      "standard": stan,
      "pathwayStage": pathwayStage,
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    }, {
      "option": $('#patient-panel-drop-down-options').html()
    });

    if (standard === null) {
      //Must be a patient from the *** OK group
      standard = data.options.filter(function(val) {
        return val.pathwayId === pathwayId && val.pathwayStage === pathwayStage;
      })[0].standard;
    }

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = template.createIndividualActionPlanPanel(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = qualityStandard.create(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = template.createTrendPanel(pathwayId, pathwayStage, standard, patientId);
    var medPanel = template.createMedicationPanel(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = template.createOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
    var medCodeWrapperPanel = base.createPanel($('#other-codes-and-meds-wrapper-panel'));
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medCodeWrapperPanel);
    $('#temp-hidden #medCodeWrapperPanel').append(medPanel).append(codesPanel);

    if (farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(500, function() {
        $(this).html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        template.wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
        qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
        template.wireUpStandardDropDown(pathwayId, pathwayStage, standard, template.showIndividualPatientPanel);
        template.wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
        template.wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
        template.wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
        chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        $(this).fadeIn(500, function() {});
      });
    } else {
      farRightPanel.html($('#temp-hidden').html());
      $('#temp-hidden').html("");
      template.wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
      qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
      template.wireUpStandardDropDown(pathwayId, pathwayStage, standard, template.showIndividualPatientPanel);
      template.wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
      template.wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
      template.wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
      chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
      farRightPanel.fadeIn(500, function() {});
    }
  },

  //Show patient view from the all patient screen
  showIndividualPatientView: function(pathwayId, pathwayStage, standard, patientId) {
    data.patientId = patientId;

    data.options.sort(function(a, b) {
      a = data.getPatientStatus(patientId, a.pathwayId, a.pathwayStage, a.standard);
      b = data.getPatientStatus(patientId, b.pathwayId, b.pathwayStage, b.standard);

      if (a === b) return 0;
      if (a === "not") return 1;
      if (b === "not") return -1;
      if (a === "ok") return 1;
      if (b === "ok") return -1;
      alert("!!!!!!!");
    });

    if (pathwayId === null) {
      //Show patient but don't select
      var p = base.createPanel($('#patient-panel'), {
        "options": data.options,
        "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
        "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
        "patientId": patientId
      }, {
        "option": $('#patient-panel-drop-down-options').html()
      });
      farRightPanel.html(p).show();
      farRightPanel.removeClass('standard-missed-page').removeClass('standard-achieved-page').removeClass('standard-not-relevant-page');

      $('select').select2({
        templateResult: template.formatStandard,
        minimumResultsForSearch: Infinity,
        placeholder: "Please select an improvement opportunity area..."
      });
      $('span.select2-selection__rendered').attr("title", "");
      $('select').on('change', function() {
        var localData = $(this).find(':selected').data();
        template.showIndividualPatientView(localData.pathwayId, localData.pathwayStage, localData.standard, data.patientId);
      }).on("select2:open", function(e) {
        base.wireUpTooltips();
      });
      return;
    }

    var panel = base.createPanel($('#patient-panel'), {
      "options": data.options,
      "numberOfStandardsMissed": data.numberOfStandardsMissed(patientId),
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "pathwayStage": pathwayStage,
      "nhsNumber": data.patLookup ? data.patLookup[patientId] : patientId,
      "patientId": patientId
    }, {
      "option": $('#patient-panel-drop-down-options').html()
    });

    farRightPanel.html("");
    $('#temp-hidden').html(panel);

    var actionPlan = template.createIndividualActionPlanPanel(pathwayStage);
    $('#temp-hidden #patient-panel-right').html(actionPlan);

    var qualPanel = qualityStandard.create(pathwayId, pathwayStage, standard, patientId);
    var trendPanel = template.createTrendPanel(pathwayId, pathwayStage, standard, patientId);
    var medPanel = template.createMedicationPanel(pathwayId, pathwayStage, standard, patientId);
    var codesPanel = template.createOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
    var medCodeWrapperPanel = base.createPanel($('#other-codes-and-meds-wrapper-panel'));
    $('#temp-hidden #patient-panel-top').html(qualPanel);
    $('#temp-hidden #patient-panel-left').html("").append(trendPanel).append(medCodeWrapperPanel);
    $('#temp-hidden #medCodeWrapperPanel').append(medPanel).append(codesPanel);

    if (farRightPanel.is(':visible')) {
      farRightPanel.fadeOut(100, function() {
        $(this).html($('#temp-hidden').html());
        $('#temp-hidden').html("");
        template.wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
        qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
        template.wireUpStandardDropDown(pathwayId, pathwayStage, standard, template.showIndividualPatientView);
        template.wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
        template.wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
        template.wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
        chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
        $(this).fadeIn(100, function() {});
      });
    } else {
      farRightPanel.html($('#temp-hidden').html());
      $('#temp-hidden').html("");
      template.wireUpIndividualActionPlanPanel(pathwayId, pathwayStage, standard, patientId);
      qualityStandard.wireUp(pathwayId, pathwayStage, standard, patientId);
      template.wireUpStandardDropDown(pathwayId, pathwayStage, standard, template.showIndividualPatientView);
      template.wireUpTrendPanel(pathwayId, pathwayStage, standard, patientId);
      template.wireUpMedicationPanel(pathwayId, pathwayStage, standard, patientId);
      template.wireUpOtherCodesPanel(pathwayId, pathwayStage, standard, patientId);
      chart.drawTrendChart(patientId, pathwayId, pathwayStage, standard);
      farRightPanel.fadeIn(100, function() {});
    }
  },

  showAllPatientView: function(patientId, reload) {
    $('#mainTitle').hide();
    template.updateTitle("List of all patients at your practice");

    if (!patientId) data.pathwayId = "";
    if (!patientId || reload) {

      template.showMainView(data.diseases.length);

      template.switchTo110Layout();
      template.hideAllPanels();

      template.showAllPatientPanel(farLeftPanel);
      template.populateAllPatientPanel();
    }

    if (patientId) {
      template.showIndividualPatientView(null, null, null, patientId);
    } else {
      var tempMust = $('#patient-panel-placeholder').html();
      farRightPanel.html(Mustache.render(tempMust)).show();
    }
  },

  wireUpTrendPanel: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#trend-agree-disagree'), $('#trend-panel'), pathwayId, pathwayStage, standard, patientId, "trend", "trend data");

    $('#trend-panel').on('click', '.table-chart-toggle', function() {
      if ($(this).text() === "Table") {
        $(this).text("Chart");
        $('#chart-demo-trend').hide();
        $('#table-demo-trend').show();

        var c = $('#table-demo-trend .tableScroll').getNiceScroll();
        if (c && c.length > 0) {
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
  },

  createTrendPanel: function(pathwayId, pathwayStage, standard, patientId) {
    var agree = actions.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "trend");
    return base.createPanel(valueTrendPanel, {
      "pathway": lookup.monitored[pathwayId],
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "pathwayStage": pathwayStage
    });
  },

  wireUpMedicationPanel: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#medication-agree-disagree'), $('#medication-panel'), pathwayId, pathwayStage, standard, patientId, "medication", "medication data");
  },

  wireUpOtherCodesPanel: function(pathwayId, pathwayStage, standard, patientId) {
    confirm.wireUp($('#other-codes-agree-disagree'), $('#other-codes-panel'), pathwayId, pathwayStage, standard, patientId, "codes", "other codes");
  },

  createMedicationPanel: function(pathwayId, pathwayStage, standard, patientId) {
    var medications = data.patients[patientId].medications || [];
    var agree = actions.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "medication");
    return base.createPanel(medicationPanel, {
      "areMedications": medications.length > 0,
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "pathway": data.pathwayNames[pathwayId],
      "medications": medications,
      "pathwayStage": pathwayStage
    }, {
      "medicationRow": $('#medication-row').html()
    });
  },

  createOtherCodesPanel: function(pathwayId, pathwayStage, standard, patientId) {
    var codes = (data.patients[patientId].codes || []).map(function(val) {
      val.description = data.codes[val.code];
      return val;
    });
    var agree = actions.getPatientAgreeObject(pathwayId, pathwayStage, standard, patientId, "codes");
    return base.createPanel($('#other-codes-panel'), {
      "areCodes": codes.length > 0,
      "agree": agree && agree.agree,
      "disagree": agree && agree.agree === false,
      "pathway": data.pathwayNames[pathwayId],
      "standard": data[pathwayId][pathwayStage].standards[standard].tab.title,
      "codes": codes,
      "pathwayStage": pathwayStage
    }, {
      "codeRow": $('#other-codes-row').html()
    });
  },

  formatStandard: function(standard) {
    if (!standard.id) {
      return standard.text;
    }
    var localData = $(standard.element).data();
    // Not relevant
    var standardHtml = '';
    //if diagnosis opportunity then not relevant for other stages
    //if no mention anywhere then not relevant for that disease
    switch (data.getPatientStatus(data.patientId, localData.pathwayId, localData.pathwayStage, localData.standard)) {
      case "ok":
        standardHtml = '<span class="standard-achieved" data-toggle="tooltip" data-placement="left" title="' + data[localData.pathwayId][localData.pathwayStage].standards[localData.standard]["dropdown-tooltip"] + ' - QUALITY INDICATOR ACHIEVED">' + standard.text + ' <i class="fa fa-smile-o" style="color:green"></i></span>';
        break;
      case "missed":
        standardHtml = '<span class="standard-missed" data-toggle="tooltip" data-placement="left" title="' + data[localData.pathwayId][localData.pathwayStage].standards[localData.standard]["dropdown-tooltip"] + ' - IMPROVEMENT OPPORTUNITY EXISTS FOR THIS PATIENT">' + standard.text + ' <i class="fa fa-flag" style="color:red"></i></span>';
        break;
      case "not":
        standardHtml = '<span class="standard-not-relevant" data-toggle="tooltip" data-placement="left" title="' + data[localData.pathwayId][localData.pathwayStage].standards[localData.standard]["dropdown-tooltip"] + ' - STANDARD NOT RELEVANT TO THIS PATIENT">' + standard.text + ' <i class="fa fa-meh-o" style="color:gray"></i></span>';
        break;
    }
    var $standard = $(standardHtml);
    return $standard;
  },

  populateAllPatientPanel: function() {
    var patients = data.getAllPatients();

    var localData = {
      "patients": patients,
      "n": patients.length,
      "header-items": [{
        "title": "NHS no.",
        "isUnSortable": true
      }, {
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isUnSortable": true,
        "tooltip": "Total number of improvement opportunities available across all conditions"
      }]
    };

    localData.patients.sort(function(a, b) {
      if (a.items[0] === b.items[0]) {
        return 0;
      }
      var A = Number(a.items[0]);
      var B = Number(b.items[0]);
      if (isNaN(A) || isNaN(B)) {
        A = a.items[0];
        B = b.items[0];
      }
      if (A > B) {
        return -1;
      } else if (A < B) {
        return 1;
      }
    });

    base.createPanelShow(patientList, patientsPanel, localData, {
      "header-item": $("#patient-list-header-item").html(),
      "item": $('#patient-list-item').html()
    });

    $('#patients-placeholder').hide();

    base.setupClipboard($('.btn-copy'), true);

    base.wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if (c && c.length > 0) {
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });
    }
  }




};

module.exports = template;
