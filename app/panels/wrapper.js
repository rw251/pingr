const log = require('../log.js');
const $ = require('jquery');

const bd = {
  wireUp(firstTabVisibleCallback) {
    const $overviewPaneTab = $('#overviewPaneTab');
    const $mainPageTabContent = $('#mainPage-tab-content');
    const $indicatorPaneTab = $('#indicatorPaneTab');
    const $patientPaneTab = $('#patientPaneTab');
    $overviewPaneTab.on('click', (e) => {
      log.navigate('#indicator-patient-list');
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $overviewPaneTab
        .closest('li')
        .addClass('active');
      // var tempMust = $('#welcome-task-list').html();
      // var rendered = Mustache.render(tempMust);
      // var tmpl = require("templates/action-plan-task-list");
      $mainPageTabContent.fadeOut(250, () => {
        $mainPageTabContent
          .children()
          .fadeOut(1);
        $('#overview-content').fadeIn(1, firstTabVisibleCallback);

        //* b* tabbed content

        // welcome.populate(true);
        $mainPageTabContent.fadeIn(250);
      });
    });

    $indicatorPaneTab.on('click', (e) => {
      log.navigate('#indicator-trend');
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $indicatorPaneTab
        .closest('li')
        .addClass('active');
      // var tempMust = $('#welcome-task-list').html();
      // var rendered = Mustache.render(tempMust);
      // var tmpl = require("templates/action-plan-task-list");
      $mainPageTabContent.fadeOut(250, () => {
        $mainPageTabContent
          .children()
          .fadeOut(1);
        $('#indicator-content').fadeIn(1);

        //* b* tabbed content

        // welcome.populate(true);
        $mainPageTabContent.fadeIn(250);
      });
    });

    $patientPaneTab.on('click', (e) => {
      log.navigate('#indicator-benchmark');
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $patientPaneTab
        .closest('li')
        .addClass('active');
      // var tempMust = $('#welcome-task-list').html();
      // var rendered = Mustache.render(tempMust);
      // var tmpl = require("templates/action-plan-task-list");
      $mainPageTabContent.fadeOut(250, () => {
        $mainPageTabContent
          .children()
          .fadeOut(1);
        $('#patient-content').fadeIn(1);

        //* b* tabbed content

        // welcome.populate(true);
        $mainPageTabContent.fadeIn(250);
      });
    });
  },

  show(panel, isAppend, subPanels) {
    // change this to add li
    const sectionElement = $('<div class="section"></div>');

    if (isAppend) panel.append(sectionElement);
    else panel.html(sectionElement);

    subPanels.forEach((v) => {
      const { args } = v.args;
      args.unshift(true);
      args.unshift(sectionElement);
      v.show.apply(null, args);
    });
  },

  showTab(
    panel,
    tabSet,
    name,
    tooltipDesc,
    routeSuffix,
    subPanels,
    isActive
  ) {
    //* b* name must be made something sensible --!!!!

    // change this to add li
    const sectionElement = panel;
    const tabSection = $(`<li id="${
      routeSuffix.toLowerCase()
    }" data-toggle="tooltip" title="${
      tooltipDesc.toLowerCase()
    }"><a id="${
      routeSuffix.toLowerCase()
    }PaneTab" data-toggle="tab" href="#${
      routeSuffix.toLowerCase()
    }PaneTab">${
      name
    }</a></li>`);

    const contentObject = $(`<div id="${routeSuffix.toLowerCase()}-content"></div>`);
    $(sectionElement).append(contentObject);

    // append to tabSet
    tabSet.append(tabSection);
    // append to panel
    // panel.append(tabSet);

    subPanels.forEach((v) => {
      const { args } = v;
      args.unshift(true);
      args.unshift(contentObject);
      v.show.apply(null, args);
    });

    if (isActive) {
      tabSection.addClass('active');
    } else {
      contentObject.fadeOut(1);
    }
  },
};

module.exports = bd;
