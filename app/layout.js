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

  clearNavigation: function() {
    $("aside.left-panel nav.navigation > ul > li > ul").slideUp(300);
    $("aside.left-panel nav.navigation > ul > li").removeClass('active');
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

  showSidePanel: function() {
    if (layout.elements.navigtion) return;
    layout.elements.navigtion = true;
    $('#main').addClass('content');
    $('#topnavbar').addClass('full');
    $('#aside-toggle').show();
    $('#bottomnavbar').hide();
  },

  hideSidePanel: function() {
    if (layout.elements.navigtion === false) return;
    layout.elements.navigtion = false;
    $('#main').removeClass('content');
    $('#topnavbar').removeClass('full');
    $('#aside-toggle').hide();
    $('#bottomnavbar').show();
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
