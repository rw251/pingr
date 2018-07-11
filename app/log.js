const notify = require('./notify');
const data = require('./data');
const lookup = require('./lookup');
const uuidv4 = require('uuid/v4');

let eventFailCount = 0;
let pageId = '';

const log = {
  reason: {},

  navigatePage(toUrl, dataProp) {
    pageId = uuidv4();
    log.event('navigate', toUrl, dataProp);
  },

  navigateTab(toUrl, dataProp) {
    log.event('navigate-tab', toUrl, dataProp);
  },

  event(type, url, dataProp, xpath) {
    const dataToSend = { event: { type, url, pageId, data: dataProp } };
    if (xpath && xpath.length > 0) dataToSend.event.xpath = xpath;
    if (lookup.tests && Object.keys(lookup.tests).length > 0) dataToSend.event.tests = lookup.tests;
    $.ajax({
      type: 'POST',
      url: '/api/event',
      data: JSON.stringify(dataToSend),
      success() {
        eventFailCount = 0;
      },
      error() {
        eventFailCount += 1;
        if (eventFailCount > 5) {
          // We've had too many errors from the back end - could be the server
          // is down, or has restarted and the session has ended. Either way
          // a page refresh might help
          window.location.reload();
        }
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  excludePatient(practiceId, patientId, indicatorId, reason, freetext) {
    const obj = {
      practiceId,
      patientId,
      indicatorId,
      reason,
      freetext,
      who: lookup.userName,
      when: Date.now(),
    };
    if (!data.excludedPatients[patientId]) {
      data.excludedPatients[patientId] = [obj];
    } else {
      data.excludedPatients[patientId].push(obj);
    }
    if (!data.excludedPatientsByIndicator[indicatorId]) {
      data.excludedPatientsByIndicator[indicatorId] = [patientId];
    } else {
      data.excludedPatientsByIndicator[indicatorId].push(patientId);
    }

    $.ajax({
      type: 'POST',
      url: `/api/exclude/patient/${patientId}/for/indicator/${indicatorId}/practice/${practiceId}`,
      data: JSON.stringify({ reason, freetext }),
      success() {},
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  includePatient(practiceId, patientId, indicatorId) {
    if (data.excludedPatients[patientId]) {
      data.excludedPatients[patientId] = data.excludedPatients[
        patientId
      ].filter(v => v.indicatorId !== indicatorId);
    }
    if (data.excludedPatientsByIndicator[indicatorId]) {
      data.excludedPatientsByIndicator[
        indicatorId
      ] = data.excludedPatientsByIndicator[indicatorId].filter(v => v !== patientId);
    }
    $.ajax({
      type: 'POST',
      url: `/api/include/patient/${patientId}/for/indicator/${indicatorId}/practice/${practiceId}`,
      success() {},
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  // rwhere
  recordIndividualPlan(text, practiceId, patientId, indicatorList, done) {
    $.ajax({
      type: 'POST',
      url: `/api/action/addIndividual/${practiceId}/${patientId}`,
      data: JSON.stringify({ actionText: text, indicatorList, pageId }),
      success(action) {
        notify.showSaved();
        data.addOrUpdatePatientAction(patientId, action);
        return done(null, action);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  // rwhere
  deleteUserDefinedPatientAction(patientId, actionTextId, done) {
    $.ajax({
      type: 'DELETE',
      url: `/api/action/userdefinedpatient/${patientId}/${actionTextId}`,
      success(d) {
        notify.showSaved();
        if (!done) return data.removePatientAction(patientId, actionTextId);
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  // rwhere
  updateIndividualAction(practiceId, patientId, updatedAction, done) {
    $.ajax({
      type: 'POST',
      url: `/api/action/update/individual/${practiceId}/${patientId}`,
      data: JSON.stringify({ action: updatedAction, pageId }),
      success(action) {
        notify.showSaved();
        if (action.agree === true) {
          if (!done) return data.addOrUpdatePatientAction(patientId, action);
        } else if (action.agree === false) {
          if (!done) return data.addOrUpdatePatientAction(patientId, action);
        } else if (!done) {
          return data.removePatientAction(patientId, action.actionTextId);
        }
        return done(null, action);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  updateTeamAction(practiceId, indicatorId, dataProp, done) {
    $.ajax({
      type: 'POST',
      url: `/api/action/update/team/${practiceId}/${indicatorId}`,
      data: JSON.stringify({ action: dataProp, pageId }),
      success(d) {
        if (!done) return notify.showSaved();
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  updateUserDefinedPatientAction(patientId, actionTextId, dataProp, done) {
    $.ajax({
      type: 'POST',
      url: `/api/action/update/userdefinedpatient/${patientId}/${actionTextId}`,
      data: JSON.stringify({ action: dataProp }),
      success(d) {
        if (!done) return notify.showSaved();
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  deleteUserDefinedTeamAction(actionTextId, done) {
    $.ajax({
      type: 'DELETE',
      url: `/api/action/userdefinedteam/${actionTextId}`,
      success(d) {
        if (!done) return notify.showSaved();
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  updateUserDefinedTeamAction(actionTextId, dataProp, done) {
    $.ajax({
      type: 'POST',
      url: `/api/action/update/userdefinedteam/${actionTextId}`,
      data: JSON.stringify({ action: dataProp }),
      success(d) {
        if (!done) return notify.showSaved();
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  recordTeamPlan(practiceId, text, indicatorId, done) {
    const url = `/api/action/addTeam/${practiceId}/${indicatorId || ''}`;
    $.ajax({
      type: 'POST',
      url,
      data: JSON.stringify({ actionText: text, pageId }),
      success(d) {
        notify.showSaved();
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },
};

module.exports = log;
