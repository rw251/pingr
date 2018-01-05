const Highcharts = require('highcharts/highstock');
const $ = require('jquery');
//  log = require('./log'),
// const lookup = require('./lookup');

let isFetchingNhsLookup = false;

const dt = {
  clinicalArea: {
    copd: 'COPD',
    htn: 'Hypertension',
    'cvd.stroke': 'Stroke',
    'cvd.af': 'Atrial Fibrillation',
    ckd: 'CKD',
    ckdAndDm: 'Diabetes',
    ckdAndProt: 'CKD',
  },

  pathwayNames: {},
  diseases: [],
  options: [],
  excludedPatients: {},
  excludedPatientsByIndicator: {},

  getNHS: (practiceId, patientId) => {
    if (
      dt.patLookup &&
      dt.patLookup[practiceId] &&
      dt.patLookup[practiceId][patientId]
    ) {
      return dt.patLookup[practiceId][patientId];
    }
    return patientId;
  },

  populateNhsLookup(practiceId, done) {
    if (isFetchingNhsLookup) return false;
    if (dt.patLookup && dt.patLookup[practiceId]) return done();
    isFetchingNhsLookup = true;
    return $.getJSON(`/api/nhs/${practiceId}`, (lookup) => {
      if (!dt.patLookup) dt.patLookup = {};
      dt.patLookup[practiceId] = lookup;
      isFetchingNhsLookup = false;
      return done();
    });
  },

  getAllAgreedWithActions(practiceId, done) {
    $.ajax({
      type: 'GET',
      url: `/api/action/all/${practiceId}`,
      success(d) {
        return done(null, d);
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  },

  get(practiceId, force, callback) {
    $.getJSON('/api/Text', (textfile) => {
      dt.text = textfile;
      dt.getAllIndicatorData(practiceId, force, () => {
        dt.getExcludedPatients(practiceId, () => {
          if (typeof callback === 'function') {
            callback();
          }
        });
      });
    }).fail(() => {
      // alert("data/text.json failed to load!! - if you've
      // changed it recently check it's valid json at jsonlint.com");
    });
  },

  processIndicatorRemoveExcludedPatients(indicator) {
    const indicatorClone = JSON.parse(JSON.stringify(indicator));
    let excludedPatients = dt.excludedPatientsByIndicator[indicatorClone.id];

    if (excludedPatients) {
      const includedPatients = {};
      indicatorClone.opportunities.forEach((opp) => {
        opp.patients.forEach((patid) => {
          includedPatients[patid] = true;
        });
      });
      excludedPatients = excludedPatients.filter(p => includedPatients[p]);
      if (excludedPatients.length > 0) {
        const numDen = indicatorClone.performance.fraction.split('/');
        indicatorClone.performance.fraction = `${numDen[0]}/${+numDen[1] -
          excludedPatients.length}`;
        indicatorClone.performance.percentage =
          Math.round((10000 * +numDen[0]) / (+numDen[1] - excludedPatients.length)) / 100;
        indicatorClone.patientsWithOpportunity -= excludedPatients.length;
      }
    }

    return indicatorClone;
  },

  processIndicatorsRemoveExcludedPatients(indicators) {
    return indicators.map(indicator =>
      dt.processIndicatorRemoveExcludedPatients(indicator));
  },

  processIndicators(indicatorList) {
    const indicators = indicatorList.map((i) => {
      const indicator = i;
      const last = indicator.values[0].length - 1;
      const pathwayId = indicator.id.split('.')[0];
      const pathwayStage = indicator.id.split('.')[1];
      const standard = indicator.id.split('.')[2];
      if (dt.clinicalArea[pathwayId]) {
        indicator.clinicalArea = dt.clinicalArea[pathwayId];
      } else if (dt.clinicalArea[`${pathwayId}.${pathwayStage}`]) {
        indicator.clinicalArea =
          dt.clinicalArea[`${pathwayId}.${pathwayStage}`];
      } else {
        indicator.clinicalArea = 'Unknown';
      }
      // if (!dt.pathwayNames[pathwayId]) dt.pathwayNames[pathwayId] = "";
      const percentage =
        Math.round((10000 * indicator.values[1][last]) / indicator.values[2][last]) / 100;
      indicator.performance = {
        fraction: `${indicator.values[1][last]}/${indicator.values[2][last]}`,
        percentage,
      };
      if (indicator.type === 'outcome') {
        indicator.performance.incidence = (percentage * 10).toFixed(1);
        indicator.performance.incidenceMultiple = (
          Math.round((10000 * indicator.values[4][last]) / indicator.values[2][last]) / 10
        ).toFixed(1);
      }
      indicator.patientsWithOpportunity =
        indicator.values[2][last] - indicator.values[1][last];
      // indicator.benchmark = "90%"; //TODO magic number
      indicator.target = `${indicator.values[3][last] * 100}%`;
      const lastPercentage =
        Math.round((10000 * indicator.values[1][last - 1]) / indicator.values[2][last - 1]) / 100;
      indicator.up = percentage > lastPercentage;
      indicator.change = 'none';
      if (percentage > lastPercentage) indicator.change = 'up';
      else if (percentage < lastPercentage) indicator.change = 'down';
      const today = new Date();
      const lastyear = today.setYear(today.getFullYear() - 1);
      const trend = indicator.values[1]
        .map((val, idx) =>
          (new Date(indicator.values[0][idx]) > lastyear
            ? Math.round((10000 * val) / indicator.values[2][idx]) / 100
            : 'old'))
        .filter(v => v !== 'old');
      // trend.reverse();
      indicator.trend = trend.join(',');
      const dates = indicator.values[0].filter(v => new Date(v) > lastyear);
      // dates.reverse();
      indicator.dates = dates;
      if (
        dt.text.pathways[pathwayId] &&
        dt.text.pathways[pathwayId][pathwayStage] &&
        dt.text.pathways[pathwayId][pathwayStage].standards[standard]
      ) {
        indicator.description =
          dt.text.pathways[pathwayId][pathwayStage].standards[
            standard
          ].description;
        indicator.name =
          dt.text.pathways[pathwayId][pathwayStage].standards[standard].name;
        indicator.tagline =
          dt.text.pathways[pathwayId][pathwayStage].standards[standard].tagline;
        indicator.positiveMessage =
          dt.text.pathways[pathwayId][pathwayStage].standards[
            standard
          ].positiveMessage;
      } else {
        indicator.description = 'No description specified';
        indicator.tagline = '';
        indicator.name = 'Unknown';
      }
      indicator.aboveTarget =
        indicator.performance.percentage > +indicator.values[3][last] * 100;

      if (!dt.patientArray) dt.patientArray = [];
      dt.patientArray = indicator.opportunities.reduce((prev, curr) => {
        const union = prev.concat(curr.patients);
        return union.filter((item, pos) => union.indexOf(item) === pos);
      }, dt.patientArray);

      indicator.opportunities = indicator.opportunities.map((v) => {
        const rtn = v;
        rtn.name =
          dt.text.pathways[pathwayId][pathwayStage].standards[
            standard
          ].opportunities[v.id].name;
        rtn.description =
          dt.text.pathways[pathwayId][pathwayStage].standards[
            standard
          ].opportunities[v.id].description;
        return rtn;
      });

      return indicator;
      //= { performance: indicator.performance, tagline: indicator.tagline,
      // positiveMessage: indicator.positiveMessage, target: indicator.target,
      // "opportunities": indicator.opportunities || [], "patients": {} };
    });

    return indicators;
  },

  // prepare an annoymised ranking demonstrating my postition in amongst other practices
  getPracticePerformanceData(
    practiceId,
    pathwayId,
    pathwayStage,
    standard,
    callback
  ) {
    // let practiceObj;

    const indicatorId = [pathwayId, pathwayStage, standard].join('.');

    $.ajax({
      url: `/api/BenchmarkDataFor/${practiceId}/${indicatorId}`,
      success(benchmarkData) {
        return callback(benchmarkData);
      },
      error() {
        // throw some ungracious issue eventually...
      },
    });
  },

  getDisplayTextFromIndicatorId(indicatorId) {
    const parts = indicatorId.split('.');
    if (
      dt.text.pathways[parts[0]] &&
      dt.text.pathways[parts[0]][parts[1]] &&
      dt.text.pathways[parts[0]][parts[1]].standards[parts[2]]
    ) {
      return dt.text.pathways[parts[0]][parts[1]].standards[parts[2]].tabText;
    }
    return '???';
  },

  getAllIndicatorData(practiceId, force, callback) {
    // var addId = '/'+practiceId;
    let routeURL;
    if (practiceId) {
      routeURL = `/api/ListOfIndicatorsForPractice/${practiceId}`;
    } else {
      routeURL = '/api/ListOfIndicatorsForPractice';
    }

    // we never want to cache this anymore.
    if (dt.indicators && !force) {
      const indicatorsToReturn = dt.processIndicatorsRemoveExcludedPatients(dt.indicators);
      return callback(indicatorsToReturn);
    }
    return $.ajax({
      url: routeURL,
      success(file) {
        // don't retain the object, refresh of object
        dt.indicators = dt.processIndicators(file);

        const indicatorsToReturn = dt.processIndicatorsRemoveExcludedPatients(dt.indicators);
        return callback(indicatorsToReturn);
      },
      error() {},
    });
  },

  // *b* practice id not used?
  getAllIndicatorDataSync() {
    if (dt.indicators) {
      return dt.indicators;
    }
    // use practiceId to populate? TODO implement?
    return null;
  },

  getIndicatorData(practiceId, indicatorId, callback) {
    if (dt.indicators && dt.indicators[indicatorId]) {
      return callback(dt.indicators[indicatorId]);
    }
    const isAsync = typeof callback === 'function';
    const ajaxParams = {
      url: `/api/PatientListForPractice/${practiceId}/Indicator/${indicatorId}`,
      async: isAsync,
      success(file) {
        if (!dt.indicators) dt.indicators = {};
        dt.indicators[indicatorId] = file;

        if (isAsync) callback(dt.indicators[indicatorId]);
      },
      error() {},
    };

    if (!isAsync) {
      $.ajax(ajaxParams);
      return dt.indicators[indicatorId];
    }
    return $.ajax(ajaxParams);
  },

  // *b* practice id not used??
  getTrendData(practiceId, pathwayId, pathwayStage, standard) {
    if (dt.indicators) {
      return dt.indicators.filter(v => v.id === [pathwayId, pathwayStage, standard].join('.'))[0];
    }
    return null;
  },

  getIndicatorDataSync(practiceId, indicatorId) {
    // practiceId not used in getAllIndicatorDataSync
    dt.getAllIndicatorDataSync(practiceId);
    const indicator = dt.indicators.filter(v => v.id === indicatorId);
    if (indicator.length > 0) {
      return dt.processIndicatorRemoveExcludedPatients(indicator[0]);
    }
    return false;
  },

  processPatientList(pathwayId, pathwayStage, standard, subsection, file) {
    let header;
    let localPatients = file.patients;

    if (subsection !== 'all') {
      const subsectionIds =
        Object.keys(dt.text.pathways[pathwayId][pathwayStage].standards[standard].opportunities)
          .filter(key =>
            dt.text.pathways[pathwayId][pathwayStage].standards[standard]
              .opportunities[key].name === subsection);
      if (subsectionIds.length > 0) {
        localPatients = localPatients.filter(v => v.opportunities.indexOf(subsectionIds[0]) > -1);
        header =
          dt.text.pathways[pathwayId][pathwayStage].standards[standard]
            .opportunities[subsectionIds[0]].description;
      }
    } else {
      header =
        dt.text.pathways[pathwayId][pathwayStage].standards[standard]
          .tableTitle;
    }

    const vId =
      dt.text.pathways[pathwayId][pathwayStage].standards[standard].valueId;
    let dOv =
      dt.text.pathways[pathwayId][pathwayStage].standards[standard].dateORvalue;

    const indicatorId = [pathwayId, pathwayStage, standard].join('.');
    const indicator = dt.indicators.filter(v => v.id === indicatorId)[0];
    const opps = indicator.opportunities.map(v => v.id);

    let numExcluded = 0;

    localPatients = localPatients.map((pt) => {
      const patient = pt;
      patient.nhsNumber = patient.nhs || patient.patientId;
      patient.items = [patient.age];
      if (patient.value) patient.items.push(patient.value);
      if (patient.date) patient.items.push(patient.date);
      if (patient.reviewDate) patient.items.push(patient.reviewDate);
      patient.items.push(patient.opportunities
        .map(v =>
          `<span style="width:13px;height:13px;float:left;background-color:${
            Highcharts.getOptions().colors[opps.indexOf(v)]
          }"></span>`)
        .join('')); // The fields in the patient list table
      patient.excluded = false;
      if (dt.isExcluded(patient.patientId, indicatorId)) {
        numExcluded += 1;
        patient.excluded = true;
        patient.items.push(`<span class="text-muted" data-container="body", data-html="true", data-toggle="tooltip", data-placement="bottom", title="${dt.getExcludedTooltip(
          patient.patientId,
          indicatorId
        )}"><i class="fa fa-fw fa-times"></i> EXCLUDED</span>`);
      } else if (patient.actionStatus) {
        const releventActions = patient.actionStatus
          .filter(v => !v.indicatorList || v.indicatorList.indexOf(indicatorId) > -1);
        if (releventActions.length > 0) {
          // This patient has had some interaction - agree / disagree / user added
          const info = {};
          let mostRecent;
          releventActions.forEach((v) => {
            const name =
              $('#user_fullname')
                .text()
                .trim() === v.history[0].who
                ? 'You have'
                : `${v.history[0].who} has`;
            if (!info[name]) info[name] = { agree: 0, added: 0 };

            if (!mostRecent) mostRecent = v.history[0].when;
            else mostRecent = Math.max(mostRecent, v.history[0].when);

            if (v.history[0].what === 'agreed with') info[name].agree += 1;
            if (v.history[0].what === 'added') info[name].added += 1;
          });
          const tooltip = Object.keys(info)
            .map(v =>
              `${v} ${
                info[v].agree > 0
                  ? ` agreed with ${info[v].agree} action${
                    info[v].agree > 1 ? 's' : ''
                  }`
                  : ''
              }${info[v].agree > 0 && info[v].added > 0 ? ' and ' : ''}${
                info[v].added > 0
                  ? ` added ${info[v].added} action${
                    info[v].added > 1 ? 's.' : '.'
                  }`
                  : '.'
              }`)
            .join('<br>');
          patient.items.push(`<i class="fa fa-fw fa-check text-success" data-container="body", data-html="true", data-toggle="tooltip", data-placement="bottom", title="${tooltip}"></i>`);
        } else {
          patient.items.push('');
        }
      } else {
        patient.items.push('');
      }
      // add a hidden column excluded / not excluded for sorting
      if (patient.excluded) {
        patient.items.push(1);
      } else {
        patient.items.push(0);
      }
      return patient;
    });

    const rtn = {
      patients: localPatients,
      numExcluded,
      type: file.type,
      n: localPatients.length,
      header,
      'header-items': [
        {
          title: 'NHS no.',
          type: 'numeric',
          orderSequence: ['asc', 'desc'],
          isSorted: false,
          direction: 'sort-asc',
          tooltip: 'NHS number of each patient',
        },
        {
          title: 'Age',
          type: 'numeric-?',
          orderSequence: ['desc', 'asc'],
          isSorted: false,
          direction: 'sort-asc',
          tooltip: 'The age of the patient',
        },
      ],
    };

    // middle column is either value or date
    if (!dOv) dOv = 'date';
    if (dOv) {
      if (dOv !== 'date') {
        rtn['header-items'].push({
          title:
            dt.text.pathways[pathwayId][pathwayStage].standards[standard]
              .valueName,
          type: 'numeric-?',
          orderSequence: ['desc', 'asc'],
          tooltip: `Last ${vId} reading`,
          isSorted: false,
          direction: 'sort-asc',
        });
      }
      if (dOv !== 'value') {
        rtn['header-items'].push({
          title: `${
            dt.text.pathways[pathwayId][pathwayStage].standards[standard]
              .valueName
          } date`,
          type: 'date-uk',
          orderSequence: ['desc', 'asc'],
          tooltip: `Last date ${vId} was measured`,
          isSorted: false,
          direction: 'sort-asc',
        });
      }
    }

    if (indicator.displayReviewDate) {
      rtn['header-items'].push({
        title: 'Next review date',
        type: 'date-uk',
        orderSequence: ['desc', 'asc'],
        tooltip: 'Next review date',
        isSorted: false,
        direction: 'sort-asc',
      });
    }

    // add qual standard column
    rtn['header-items'].push({
      title: 'Improvement opportunities',
      type: 'opps',
      orderSequence: ['desc', 'asc'],
      isSorted: true,
      tooltip: 'Improvement opportunities from the bar chart above',
    });

    // add does patient have a plan column
    rtn['header-items'].push({
      title: 'Action plan?',
      type: 'plan',
      orderSequence: ['desc', 'asc'],
      isSorted: false,
      tooltip: 'Whether this patient has had any actions added or agreed',
    });

    rtn['header-items'].push({
      title: 'Excluded',
      type: 'numeric?',
      orderSequence: ['asc'],
      isSorted: false,
      hidden: true,
    });

    return rtn;
  },

  getAllPatientList(practiceId, skip, limit, callback) {
    $.ajax({
      url: `api/WorstPatients/${practiceId}/${skip}/${limit}`,
      success(file) {
        return callback(null, file);
      },
      error(err) {
        return callback(err);
      },
    });
  },

  getPatientList(
    practiceId,
    pathwayId,
    pathwayStage,
    standard,
    subsec,
    callback
  ) {
    const indicatorId = [pathwayId, pathwayStage, standard].join('.');
    const subsection = subsec || 'all';
    if (!dt.patientList) dt.patientList = {};
    if (!dt.patientList[practiceId]) dt.patientList[practiceId] = {};
    if (!dt.patientList[practiceId][indicatorId]) {
      dt.patientList[practiceId][indicatorId] = {};
    }

    if (dt.patientList[practiceId][indicatorId].file) {
      dt.patientList[practiceId][indicatorId][
        subsection
      ] = dt.processPatientList(
        pathwayId,
        pathwayStage,
        standard,
        subsection,
        dt.patientList[practiceId][indicatorId].file
      );
      return callback(dt.patientList[practiceId][indicatorId][subsection]);
    }
    return $.ajax({
      url: `/api/PatientListForPractice/${practiceId}/Indicator/${indicatorId}`,
      success(file) {
        dt.patientList[practiceId][indicatorId].file = file;
        dt.patientList[practiceId][indicatorId][
          subsection
        ] = dt.processPatientList(
          pathwayId,
          pathwayStage,
          standard,
          subsection,
          file
        );
        callback(dt.patientList[practiceId][indicatorId][subsection]);
      },
      error() {},
    });
  },

  addOrUpdatePatientAction(patientId, action) {
    if (
      dt.patients &&
      dt.patients[patientId] &&
      dt.patients[patientId].standards
    ) {
      const actions = {}; // keep track of which indicators need their action total updating
      dt.patients[patientId].standards = dt.patients[patientId].standards.map((v) => {
        if (!actions[v.indicatorId]) {
          actions[v.indicatorId] = { before: 0, after: 0 };
        }
        if (!v.actionPlans) v.actionPlans = [];
        actions[v.indicatorId].before += v.actionPlans.length;
        actions[v.indicatorId].after += v.actionPlans.length;
        if (
          v.actionPlans.filter(vv => vv.actionTextId === action.actionTextId)
            .length === 0
        ) {
          // This is a new action
          if (
            action.indicatorList.indexOf(v.indicatorId) > -1 &&
              (action.agree || action.userDefined)
          ) {
            actions[v.indicatorId].after += 1;
            v.actionPlans.push({
              actionTextId: action.actionTextId,
              agree: action.agree,
              history: action.history,
              indicatorList: action.indicatorList,
            });
          }
        } else {
          // it's an existing action
          v.actionPlans = v.actionPlans
            .map((vv) => {
              if (vv.actionTextId === action.actionTextId) {
                vv.agree = action.agree;
                vv.history = action.history;
                vv.indicatorList = action.indicatorList;
                if (action.agree || action.userDefined) {
                  actions[v.indicatorId].after += 1;
                } else {
                  actions[v.indicatorId].after -= 1;
                }
              }
              return vv;
            })
            .filter(vv => vv.agree || vv.userDefined);
        }
        if (v.actionPlans.length > 0) v.actionPlan = true;
        else v.actionPlan = false;
        return v;
      });
      Object.keys(actions).forEach((indicatorId) => {
        const currentIndicator = dt.indicators.filter(v => v.id === indicatorId)[0];
        if (
          actions[indicatorId].after === 0 &&
          actions[indicatorId].before > 0
        ) {
          currentIndicator.reviewed -= 1;
        } else if (
          actions[indicatorId].before === 0 &&
          actions[indicatorId].after > 0
        ) {
          currentIndicator.reviewed += 1;
        }
      });
    }
    if (dt.patientList) {
      Object.keys(dt.patientList).forEach((practiceId) => {
        Object.keys(dt.patientList[practiceId]).forEach((indicatorId) => {
          Object.keys(dt.patientList[practiceId][indicatorId]).forEach((standard) => {
            dt.patientList[practiceId][indicatorId][standard].patients.forEach((patient) => {
              if (patient.patientId === +patientId) {
                if (!patient.actionStatus) patient.actionStatus = [];
                if (patient.actionStatus
                  .filter(v => v.actionTextId === action.actionTextId).length === 0) {
                  if (action.agree || action.userDefined) {
                    patient.actionStatus.push({
                      actionTextId: action.actionTextId,
                      agree: action.agree,
                      history: action.history,
                      indicatorList: action.indicatorList,
                    });
                  }
                } else {
                  patient.actionStatus = patient.actionStatus
                    .map((v) => {
                      if (v.actionTextId === action.actionTextId) {
                        v.agree = action.agree;
                        v.history = action.history;
                        v.indicatorList = action.indicatorList;
                      }
                      return v;
                    })
                    .filter(v => v.agree || v.userDefined);
                }
                const releventActions = patient.actionStatus.filter(v =>
                  !v.indicatorList ||
                      v.indicatorList.indexOf(indicatorId) > -1);
                if (releventActions.length > 0) {
                  // This patient has had some interaction - agree / disagree / user added
                  const info = {};
                  let mostRecent;
                  releventActions.forEach((v) => {
                    const name =
                        $('#user_fullname')
                          .text()
                          .trim() === v.history[0].who
                          ? 'You have'
                          : `${v.history[0].who} has`;
                    if (!info[name]) info[name] = { agree: 0, added: 0 };

                    if (!mostRecent) mostRecent = v.history[0].when;
                    else mostRecent = Math.max(mostRecent, v.history[0].when);

                    if (v.history[0].what === 'agreed with') {
                      info[name].agree += 1;
                    }
                    if (v.history[0].what === 'added') info[name].added += 1;
                  });
                  const tooltip = Object.keys(info)
                    .map(v =>
                      `${v} ${
                        info[v].agree > 0
                          ? ` agreed with ${info[v].agree} action${
                            info[v].agree > 1 ? 's' : ''
                          }`
                          : ''
                      }${
                        info[v].agree > 0 && info[v].added > 0
                          ? ' and '
                          : ''
                      }${
                        info[v].added > 0
                          ? ` added ${info[v].added} action${
                            info[v].added > 1 ? 's.' : '.'
                          }`
                          : '.'
                      }`)
                    .join('<br>');
                  patient.items[patient.items.length - 1] = `
                    <i class="fa fa-fw fa-check text-success" 
                      data-container="body" 
                      data-html="true"
                      data-toggle="tooltip"
                      data-placement="bottom"
                      title="${tooltip}"></i>`;
                } else {
                  patient.items[patient.items.length - 1] = '';
                }
              }
            });
          });
        });
      });
    }
  },

  removePatientAction(patientId, actionTextId) {
    if (
      dt.patients &&
      dt.patients[patientId] &&
      dt.patients[patientId].standards
    ) {
      const actions = {}; // keep track of which indicators need their action total updating
      dt.patients[patientId].standards = dt.patients[patientId].standards.map((v) => {
        if (!actions[v.indicatorId]) {
          actions[v.indicatorId] = { before: 0, after: 0 };
        }
        if (v.actionPlans) {
          actions[v.indicatorId].before += v.actionPlans.length;
          v.actionPlans = v.actionPlans.filter(vv => vv.actionTextId !== actionTextId);
          actions[v.indicatorId].after += v.actionPlans.length;
          if (v.actionPlans.length === 0) v.actionPlan = false;
        }
        return v;
      });
      Object.keys(actions).forEach((indicatorId) => {
        const currentIndicator = dt.indicators.filter(v => v.id === indicatorId)[0];
        if (
          actions[indicatorId].after === 0 &&
          actions[indicatorId].before > 0
        ) {
          currentIndicator.reviewed -= 1;
        } else if (
          actions[indicatorId].before === 0 &&
          actions[indicatorId].after > 0
        ) {
          currentIndicator.reviewed += 1;
        }
      });
    }
    if (dt.patientList) {
      Object.keys(dt.patientList).forEach((practiceId) => {
        Object.keys(dt.patientList[practiceId]).forEach((indicatorId) => {
          Object.keys(dt.patientList[practiceId][indicatorId]).forEach((standard) => {
            dt.patientList[practiceId][indicatorId][
              standard
            ].patients.forEach((patient) => {
              if (patient.patientId === +patientId) {
                patient.actionStatus =
                  patient.actionStatus.filter(v => v.actionTextId !== actionTextId);
                if (
                  patient.actionStatus.filter(v =>
                    v.indicatorList &&
                        v.indicatorList.indexOf(indicatorId) > -1).length === 0
                ) {
                  patient.items[patient.items.length - 1] = '';
                }
              }
            });
          });
        });
      });
    }
  },

  getPatientActionData(practiceId, patientId, callback) {
    $.ajax({
      url: `api/action/individual/${practiceId}/${patientId}`,
      success(file) {
        return callback(null, file);
      },
      error(err) {
        return callback(err);
      },
    });
  },

  getTeamActionData(practiceId, indicatorId, callback) {
    $.ajax({
      url: `api/action/team/${practiceId}/${indicatorId}`,
      success(file) {
        return callback(null, file);
      },
      error(err) {
        return callback(err);
      },
    });
  },

  getExcludedPatients(practiceId, callback) {
    $.ajax({
      url: `/api/excludedpatients/practice/${practiceId}`,
      success(file) {
        dt.excludedPatients = {};
        dt.excludedPatientsByIndicator = {};
        file.forEach((v) => {
          if (!dt.excludedPatients[v.patientId]) {
            dt.excludedPatients[v.patientId] = [v];
          } else dt.excludedPatients[v.patientId].push(v);
          if (!dt.excludedPatientsByIndicator[v.indicatorId]) {
            dt.excludedPatientsByIndicator[v.indicatorId] = [v.patientId];
          } else { dt.excludedPatientsByIndicator[v.indicatorId].push(v.patientId); }
        });
        if (callback) return callback(null, dt.excludedPatients);
        return false;
      },
      error(err) {
        if (callback) return callback(err);
        return false;
      },
    });
  },

  isExcluded(patientId, indicatorId) {
    if (
      dt.excludedPatients[patientId] &&
      dt.excludedPatients[patientId].filter(v => v.indicatorId === indicatorId)
        .length > 0
    ) {
      return true;
    }
    return false;
  },

  getExcludedTooltip(patientId, indicatorId) {
    const thing = dt.excludedPatients[patientId].filter(v => v.indicatorId === indicatorId)[0];
    return `${
      thing.who
    } excluded this patient from this indicator on ${new Date(thing.when).toDateString()}${
      thing.reason
        ? ` because: ${
          thing.reason === 'other' && thing.freetext
            ? thing.freetext
            : thing.reason
        }`
        : ''
    }`;
  },
};

const privateGetPatientData = (patient, callback) => {
  // if callback provided do async - else do sync
  const isAsync = typeof callback === 'function';

  if (dt.patients && dt.patients[patient]) {
    if (isAsync) return callback(dt.patients[patient]);
    return dt.patients[patient];
  }

  const ajaxParams = {
    url: `/api/PatientDetails/${patient}`,
    async: isAsync,
    success(file) {
      if (!dt.patients) dt.patients = {};
      dt.patients[patient] = file;

      if (isAsync) callback(dt.patients[patient]);
    },
    error() {
      if (dt.patients.patient && isAsync) {
        dt.patients[patient] = dt.patients.patient;
        return callback(dt.patients.patient);
      } else if (!dt.patients.patient) {
        return callback(null);
      }
      return false;
    },
  };

  if (!isAsync) {
    $.ajax(ajaxParams);
    return dt.patients[patient];
  }
  return $.ajax(ajaxParams);
};

dt.getPatientData = (patientId, callback) => privateGetPatientData(patientId, callback);

window.DATA = dt;
module.exports = dt;
