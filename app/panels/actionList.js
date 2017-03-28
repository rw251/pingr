var data = require('../data.js'),
  base = require('../base.js'),
  jsPDF = require('jspdf'),
  jspdfAutoTable = require('jspdf-autotable');

var actionObject = {};
var al = {

  create: function() {
    return require("templates/action-list-wrapper")();
  },

  show: function(panel, isAppend) {
    var html = al.create();

    if (isAppend) panel.append(html);
    else {
      panel.html(html);
    }
    al.wireup();
  },

  wireup: function() {
    $('#downloadActionPlan').on('click', function() {

      var columns = ["Team action or patient id", "Created by", "Agreed by", "Action"];
      var rows = actionArray.map(function(v) {
        return [
          v.patientId ? v.patientId : "Team action",
          v.userDefined ? v.who : "PINGR",
          v.who,
          v.actionText
        ];
      });

      // Only pt supported (not mm or in)
      var doc = new jsPDF('l', 'pt');
      doc.autoTable(columns, rows, {
        styles: {
          overflow: "linebreak",
          columWidth: "wrap"
        }
      });
      doc.save('action-plan.pdf');

    });
    al.load(function() {
      al.process(al.populate);
    });
  },

  load: function(done) {
    data.getAllAgreedWithActions(function(err, actions) {
      actionObject = actions;

      if (done && typeof done === "function") {
        return done();
      }
    });
  },

  process: function(done) {
    actionArray = [];

    if (actionObject.patient && !data.patLookup) {
      //pat lookup not loaded so let's wait
      setTimeout(function() {
        al.process(done);
      }, 1000);
      return;
    }
    if (actionObject.patient) {
      Object.keys(actionObject.patient).forEach(function(v) {
        actionObject.patient[v].actions.forEach(function(vv) {
          var actionItem = { patientId: data.patLookup[v], actionText: vv.actionText, supportingText: vv.supportingText };
          if (vv.history && vv.history.length > 0) {
            var who = vv.history[0].who;
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
        actionObject.patient[v].userDefinedActions.forEach(function(vv) {
          var actionItem = { patientId: data.patLookup[v], actionText: vv.actionText, userDefined: true };
          if (vv.history && vv.history.length > 0) {
            var who = vv.history[0].who;
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
      });
    }
    if (actionObject.team) {
      if (actionObject.team.actions) {
        actionObject.team.actions.forEach(function(v) {
          var actionItem = v;
          if (v.history && v.history.length > 0) {
            var who = v.history[0].who;
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
      }
      if (actionObject.team.userDefinedActions) {
        actionObject.team.userDefinedActions.forEach(function(v) {
          var actionItem = v;
          if (v.history && v.history.length > 0) {
            var who = v.history[0].who;
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
      }
    }
    if (done && typeof done === "function") {
      return done();
    }
  },

  populate: function() {
    var tmpl = require("templates/action-list");
    var dataObject = { "actions": actionArray };
    if (actionArray.length === 0) dataObject.noSuggestions = true;
    var $scrollTable = $('table#suggested-actions-table');

      $scrollTable.html(tmpl(dataObject));
      $scrollTable.floatThead({
        scrollContainer: function($scrollTable){
          return $scrollTable.closest('.wrapper');
        }
      });
      $('.ps-child').perfectScrollbar();

    //base.updateFixedHeightElements([{ selector: '#suggested-actions-table-wrapper', padding: 250, minHeight: 300 }]);
  }

};

module.exports = al;
