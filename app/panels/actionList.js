const data = require('../data');
const base = require('../base');
const state = require('../state');
const JSPDF = require('jspdf');
const actionListWrapperTmpl = require('../templates/action-list-wrapper.jade');
const actionListTemplate = require('../templates/action-list.jade');
// const jspdfAutoTable = require('jspdf-autotable');

let actionObject = {};
let actionArray;

const al = {
  create() {
    return actionListWrapperTmpl();
  },

  show(panel, isAppend) {
    const html = al.create();

    if (isAppend) panel.append(html);
    else {
      panel.html(html);
    }
    al.wireup();
  },

  wireup() {
    $('#downloadActionPlan').on('click', () => {
      const columns = [
        'Team action or patient id',
        'Created by',
        'Agreed by',
        'Action',
      ];
      const rows = actionArray.map(v => [
        v.patientId ? v.patientId : 'Team action',
        v.userDefined ? v.who : 'PINGR',
        v.who,
        v.actionText,
      ]);

      // Only pt supported (not mm or in)
      const doc = new JSPDF('l', 'pt');
      doc.autoTable(columns, rows, {
        styles: {
          overflow: 'linebreak',
          columWidth: 'wrap',
        },
      });
      doc.save('action-plan.pdf');
    });
    al.load(() => {
      al.process(al.populate);
    });
  },

  load(done) {
    data.getAllAgreedWithActions(state.selectedPractice._id, (err, actions) => {
      actionObject = actions;

      if (done && typeof done === 'function') {
        return done();
      }
      return false;
    });
  },

  process(done) {
    actionArray = [];

    if (actionObject.patient &&
      (!data.patLookup || !data.patLookup[state.selectedPractice._id])) {
      // pat lookup not loaded so let's wait
      return setTimeout(() => {
        al.process(done);
      }, 1000);
    }
    if (actionObject.patient) {
      Object.keys(actionObject.patient).forEach((v) => {
        actionObject.patient[v].actions.forEach((vv) => {
          const actionItem = {
            patientId: data.patLookup[state.selectedPractice._id][v],
            actionText: vv.actionText,
            supportingText: vv.supportingText,
          };
          if (vv.history && vv.history.length > 0) {
            const { who } = vv.history[0];
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
        actionObject.patient[v].userDefinedActions.forEach((vv) => {
          const actionItem = {
            patientId: data.patLookup[state.selectedPractice._id][v],
            actionText: vv.actionText,
            userDefined: true,
          };
          if (vv.history && vv.history.length > 0) {
            const { who } = vv.history[0];
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
      });
    }
    if (actionObject.team) {
      if (actionObject.team.actions) {
        actionObject.team.actions.forEach((v) => {
          const actionItem = v;
          if (v.history && v.history.length > 0) {
            const { who } = v.history[0];
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
      }
      if (actionObject.team.userDefinedActions) {
        actionObject.team.userDefinedActions.forEach((v) => {
          const actionItem = v;
          if (v.history && v.history.length > 0) {
            const { who } = v.history[0];
            actionItem.who = who;
          }
          actionArray.push(actionItem);
        });
      }
    }
    if (done && typeof done === 'function') {
      return done();
    }
    return false;
  },

  populate() {
    const tmpl = actionListTemplate;
    const dataObject = { actions: actionArray };
    if (actionArray.length === 0) dataObject.noSuggestions = true;
    $('#suggested-actions-table')
      .html(tmpl(dataObject))
      .floatThead({
        position: 'absolute',
        scrollContainer: true,
        zIndex: 50,
      });

    base.updateFixedHeightElements([
      {
        selector: '#suggested-actions-table-wrapper',
        padding: 250,
        minHeight: 300,
      },
    ]);
  },
};

module.exports = al;
