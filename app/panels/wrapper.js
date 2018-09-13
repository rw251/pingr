const log = require('../log.js');

const bd = {
  wireUp(firstTabVisibleCallback) {
    const $overviewPaneTab = $('#overviewPaneTab');
    const $mainPageTabContent = $('#mainPage-tab-content');
    const $indicatorPaneTab = $('#indicatorPaneTab');
    const $patientPaneTab = $('#patientPaneTab');
    $overviewPaneTab.on('click', (e) => {
      // only log if an actual click
      if (e.which) log.navigateTab('#indicator-patient-list');
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $overviewPaneTab
        .closest('li')
        .addClass('active');

      $mainPageTabContent.fadeOut(250, () => {
        $mainPageTabContent
          .children()
          .fadeOut(1);
        $('#overview-content').fadeIn(1, firstTabVisibleCallback);

        $mainPageTabContent.fadeIn(250, () => {
          const visibleChart = $('div[data-highcharts-chart]:visible');
          if (visibleChart.length > 0) visibleChart.highcharts().reflow();
        });
      });
    });

    $indicatorPaneTab.on('click', (e) => {
      // only log if an actual click
      if (e.which) log.navigateTab('#indicator-trend');
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $indicatorPaneTab
        .closest('li')
        .addClass('active');

      $mainPageTabContent.fadeOut(250, () => {
        $mainPageTabContent
          .children()
          .fadeOut(1);
        $('#indicator-content').fadeIn(1);

        $mainPageTabContent.fadeIn(250, () => {
          const visibleChart = $('div[data-highcharts-chart]:visible');
          if (visibleChart.length > 0) visibleChart.highcharts().reflow();
        });
      });
    });

    $patientPaneTab.on('click', (e) => {
      // only log if an actual click
      if (e.which) log.navigateTab('#indicator-benchmark');
      e.preventDefault();

      $('#mainPage-tabs li').removeClass('active');
      $patientPaneTab
        .closest('li')
        .addClass('active');

      $mainPageTabContent.fadeOut(250, () => {
        $mainPageTabContent
          .children()
          .fadeOut(1);
        $('#patient-content').fadeIn(1);

        $mainPageTabContent.fadeIn(250, () => {
          const visibleChart = $('div[data-highcharts-chart]:visible');
          if (visibleChart.length > 0) visibleChart.highcharts().reflow();
        });
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
    }PaneTab" data-toggle="tab" style="margin-top:0" href="#${
      routeSuffix.toLowerCase()
    }PaneTab">${
      name
    }</a></li>`);

    // TODO should add class="tab-pane" to the below, then
    // most of the stuff in wireuptab can be replaced with standard bootstrap tab behaviour
    // Actually none of the html code should be here - should all be in indicators.jade or
    // equivalent
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
