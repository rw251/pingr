const notify = require('./notify');
const data = require('./data');
const lookup = require('./lookup');

const log = {
  reason: {},

  navigate(toUrl, dataProp) {
    log.event('navigate', toUrl, dataProp);
  },

  event(type, url, dataProp) {
    const dataToSend = { event: { type, url, dataProp } };
    $.ajax({
      type: 'POST',
      url: '/api/event',
      data: JSON.stringify(dataToSend),
      success() {
        // console.log(d);
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
      data: JSON.stringify({ actionText: text, indicatorList }),
      success(action) {
        notify.showSaved();
        data.addOrUpdatePatientAction(patientId, action, () => done(null, action));
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  // rwhere
  deleteUserDefinedPatientAction(patientId, actionTextId, callback) {
    $.ajax({
      type: 'DELETE',
      url: `/api/action/userdefinedpatient/${patientId}/${actionTextId}`,
      success(d) {
        notify.showSaved();
        return data.removePatientAction(patientId, actionTextId, () => callback(null, d));
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  // rwhere
  updateIndividualAction(practiceId, patientId, updatedAction, callback) {
    $.ajax({
      type: 'POST',
      url: `/api/action/update/individual/${practiceId}/${patientId}`,
      data: JSON.stringify({ action: updatedAction, url: window.location.href }),
      success(action) {
        notify.showSaved();
        if (action.agree === true) {
          return data.addOrUpdatePatientAction(patientId, action, () => callback(null, action));
        } else if (action.agree === false) {
          return data.addOrUpdatePatientAction(patientId, action, () => callback(null, action));
        }
        return data.removePatientAction(patientId, action.actionTextId, () => callback(null, action));
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  updateTeamAction(practiceId, indicatorId, dataProp, done) {
    $.ajax({
      type: 'POST',
      url: `/api/action/update/team/${practiceId}/${indicatorId}`,
      data: JSON.stringify({ action: dataProp, url: window.location.href }),
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
      data: JSON.stringify({ actionText: text }),
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
