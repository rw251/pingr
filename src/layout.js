var data = require('./data.js'),
Mustache = require('mustache');

var layout = {

  elements: {},

  //Side panel, navigation, header bar and main page
  showMainView: function() {
    //Set up navigation panel
    ////layout.showSidePanel();
    ////layout.showNavigation(data.diseases, idx, $('#main-dashboard'));

    $('#bottomnavbar').hide();
    layout.showHeaderBarItems();

    //Show main dashboard page
    layout.showPage('main-dashboard');
  },

  clearNavigation: function() {
    $("aside.left-panel nav.navigation > ul > li > ul").slideUp(300);
    $("aside.left-panel nav.navigation > ul > li").removeClass('active');
  },

  showNavigation: function(list, idx, parent) {
    if (layout.elements.navigation) {

      if (idx === -1) {
        layout.clearNavigation();
        $('aside a[href="#welcome"]:first').closest('li').addClass('active');
      } else if (idx >= list.length) {
        layout.clearNavigation();
        $('aside a[href="#patients"]').closest('li').addClass('active');
      } else if (!$('aside a[href="#' + list[idx].link + '"]:first').closest('li').hasClass('active')) {
        layout.clearNavigation();
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
      template.loadContent('#agreedactions');
    });

    layout.elements.navigation = true;
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
