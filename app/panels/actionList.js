var data = require('../data.js'),
  base = require('../base.js'),
  jsPDF = require('jspdf'),
  jspdfAutoTable = require('jspdf-autotable');

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

      var columns = ["Team action or patient id","Created by","Agreed by","Action"];
      //var columns = ["Subject","Created by","Agreed by","Action"];
      var rows = actionArray.map(function(v){
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
    al.loadAndPopulate();
  },

  loadAndPopulate: function() {
    data.getAllAgreedWithActions(function(err, actions) {
      actionObject = actions;
      actionArray = [];
      if (actions.patient) {
        Object.keys(actions.patient).forEach(function(v) {
          actions.patient[v].actions.forEach(function(vv) {
            var actionItem = { patientId: data.patLookup[v], actionText: vv.actionText, supportingText: vv.supportingText };
            if (vv.history && vv.history.length > 0) {
              var who = vv.history[0].split(" agreed")[0];
              actionItem.who = who;
            }
            actionArray.push(actionItem);
          });
          actions.patient[v].userDefinedActions.forEach(function(vv) {
            var actionItem = { patientId: data.patLookup[v], actionText: vv.actionText, userDefined: true };
            if (vv.history && vv.history.length > 0) {
              var who = vv.history[0].split(" added")[0];
              actionItem.who = who;
            }
            actionArray.push(actionItem);
          });
        });
      }
      if (actions.team) {
        if (actions.team.actions) {
          actions.team.actions.forEach(function(v) {
            var actionItem = v;
            if (v.history && v.history.length > 0) {
              var who = v.history[0].split(" agreed")[0];
              actionItem.who = who;
            }
            actionArray.push(actionItem);
          });
        }
        if (actions.team.userDefinedActions) {
          actions.team.userDefinedActions.forEach(function(v) {
            var actionItem = v;
            if (v.history && v.history.length > 0) {
              var who = v.history[0].split(" added")[0];
              actionItem.who = who;
            }
            actionArray.push(actionItem);
          });
        }
      }
      al.populate();
    });
  },

  populate: function() {
    var tmpl = require("templates/action-list");
    var dataObject = { "actions": actionArray };
    if (actionArray.length === 0) dataObject.noSuggestions = true;
    $('#suggested-actions-table').html(tmpl(dataObject));

    base.updateFixedHeightElements([{ selector: '#suggested-actions-table-wrapper', padding: 250 }]);
  }

};

module.exports = al;
