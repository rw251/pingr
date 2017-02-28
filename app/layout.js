var data = require('./data');
var layout = {

  elements: {},

  //Side panel, navigation, header bar and main page
  showMainView: function() {

    $('#bottomnavbar').hide();
    layout.showHeaderBarItems();

    //Show main dashboard page
    layout.showPage('main-dashboard');
  },

  showPage: function(page) {
    if (layout.page === page) return;
    layout.page = page;
    $('.page').hide();
    $('#' + page).show();

    if (page !== 'main-dashboard') {
      ////layout.hideSidePanel();
      $('#bottomnavbar').show();
      layout.hideHeaderBarItems();
    }
  },

  showHeaderBarItems: function() {
    if (layout.elements.headerbar) return;
    layout.elements.headerbar = true;
    $('.hide-if-logged-out').show();
  },

  hideHeaderBarItems: function() {
    if (layout.elements.headerbar === false) return;
    layout.elements.headerbar = false;
    $('.hide-if-logged-out').hide();
  }

};

module.exports = layout;
