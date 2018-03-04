const layout = {
  elements: {},

  // Side panel, navigation, header bar and main page
  showMainView() {
    $('#bottomnavbar').hide();
    layout.showHeaderBarItems();

    // Show main dashboard page
    layout.showPage('main-dashboard');
  },

  reset() {
    layout.patientId = null;
    layout.pathwayId = null;
    layout.pathwayStage = null;
    layout.standard = null;
    layout.allPatientView = null;
  },

  showPage(page) {
    if (layout.page === page) return;
    layout.page = page;
    $('.page').hide();
    $(`#${page}`).show();

    if (page !== 'main-dashboard') {
      // //layout.hideSidePanel();
      $('#bottomnavbar').show();
      layout.hideHeaderBarItems();
    }
  },

  showHeaderBarItems() {
    if (layout.elements.headerbar) return;
    layout.elements.headerbar = true;
    $('.hide-if-logged-out').show();
  },

  hideHeaderBarItems() {
    if (layout.elements.headerbar === false) return;
    layout.elements.headerbar = false;
    $('.hide-if-logged-out').hide();
  },
};

module.exports = layout;
