var base = require('../base.js'),
  layout = require('../layout.js'),
  welcome = require('../panels/welcome.js');

var ID = "ACTION_PLAN_VIEW";

var ap = {

  create: function() {

    base.selectTab("actions");

    if(layout.view !== ID) {
      //Not already in this view so we need to rejig a few things
      base.clearBox();
      layout.showPage('welcome');
      layout.showHeaderBarItems();

      $('#welcome-tabs li').removeClass('active');
      $('#outstandingTasks').closest('li').addClass('active');

      layout.view = ID;
    }

    welcome.populate();

  }

};

module.exports = ap;
