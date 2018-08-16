const lifeline = require('../panels/lifeline');
const data = require('../data');
const base = require('../base');
const layout = require('../layout');
const lookup = require('../lookup');
const state = require('../state');
const individualActionPlan = require('../panels/individualActionPlan');
const qualityStandards = require('../panels/qualityStandards');
const patientSearch = require('../panels/patientSearch');
const allPatientList = require('../panels/allPatientList');
const patientTitleTemplate = require('../templates/patient-title.jade');

const ID = 'PATIENT_VIEW';
/*
 * The patient page consists of the panels:
 *   Lifeline chart
 *   Individual action plan
 */

const updateTabAndTitle = (
  patientId,
  pathwayId,
  pathwayStage,
  standard,
  patientData,
  dontClearRight
) => {
  const patid = data.getNHS(state.selectedPractice._id, patientId);
  let sex = patientData.characteristics.sex.toLowerCase();
  if (sex === 'f') sex = 'female';
  if (sex === 'm') sex = 'male';
  base.updateTitle(
    patientTitleTemplate({
      patid,
      nhs: patid.toString().replace(/ /g, ''),
      age: patientData.characteristics.age,
      sex,
      selectedPractice: state.selectedPractice,
    }),
    dontClearRight
  );

  let tabUrl = patientId;
  if (pathwayId && pathwayStage && standard) { tabUrl = [patientId, pathwayId, pathwayStage, standard].join('/'); }
  base.updateTab('patient', patid, tabUrl);
};

const isNumber = n => Number.isNaN(Number(n));

const pv = {
  wireUp() {},

  create(pathId, pathwayStage, standard, patId, loadContentFn) {
    let skip = 0;
    let limit = 10;
    let pathwayId = pathId;
    let patientId = patId;

    if (pathwayId && patientId && !isNumber(pathwayId) && !isNumber(patientId)) {
      // we're actually in the all patient view so capture the skip/limit values
      skip = +patientId;
      limit = +pathwayId;
      pathwayId = null;
      patientId = null;
    }

    if (layout.view === ID && !patientId && layout.allPatientView) {
      // just changed the pagination
      if (
        layout.allPatientView.skip === skip &&
        layout.allPatientView.limit === limit
      ) { return; } // no change
      layout.allPatientView = { skip, limit };
      layout.patientId = '';
      allPatientList.populate(skip, limit);

      base.wireUpTooltips();
      base.hideLoading();
    }
    layout.allPatientView = null;


    if (layout.view === ID && patientId === layout.patientId) {
      // the view is the same just need to update the actions
      individualActionPlan.show(
        base.farLeftPanel,
        pathwayId,
        pathwayStage,
        standard,
        patientId
      );
      qualityStandards.update(patientId, pathwayId, pathwayStage, standard);

      let tabUrl = patientId;
      if (pathwayId && pathwayStage && standard) { tabUrl = [patientId, pathwayId, pathwayStage, standard].join('/'); }
      base.updateTab(
        'patient',
        data.getNHS(state.selectedPractice._id, patientId),
        tabUrl
      );
    }

    base.selectTab('patient');
    base.showLoading();

    // use a setTimeout to force the UI to change e.g. show the loading-container
    // before further execution
    setTimeout(() => {
      if (layout.view !== ID) {
        // Not already in this view so we need to rejig a few things
        base.clearBox();
        base.switchTo2Column1Narrow1Wide();
        layout.showMainView();

        base.hidePanels(base.farRightPanel);

        layout.view = ID;
      }

      base.hidePanels(base.farLeftPanel);

      if (patientId) {
        base.switchTo2Column1Narrow1Wide();
        lookup.suggestionModalText =
          `Screen: Patient\nPatient ID: ${
            patientId
          }  - NB this helps us identify the patient but is NOT their NHS number.\n===========\n`;

        data.getPatientData(patientId, (patientData) => {
          if (!data.patLookup || !data.patLookup[state.selectedPractice._id]) {
            // we're too early to get nhs number so let's repeat until it's there
            const updatePatientIds = () => {
              if (
                !data.patLookup ||
                !data.patLookup[state.selectedPractice._id]
              ) {
                setTimeout(() => {
                  updatePatientIds();
                }, 500);
              } else {
                updateTabAndTitle(
                  patientId,
                  pathwayId,
                  pathwayStage,
                  standard,
                  patientData,
                  true
                );
              }
            };

            setTimeout(() => {
              updatePatientIds();
            }, 500);
          }

          // title needs updating
          $('#mainTitle').show();

          updateTabAndTitle(
            patientId,
            pathwayId,
            pathwayStage,
            standard,
            patientData
          );

          layout.patientId = patientId;
          data.patientId = patientId;
          data.pathwayId = pathwayId;

          patientSearch.show($('#title-right'), true, true, loadContentFn);
          qualityStandards.show(
            base.farRightPanel,
            false,
            patientId,
            pathwayId,
            pathwayStage,
            standard,
            individualActionPlan.refresh
          );

          if (
            patientData.conditions.length +
              patientData.contacts.length +
              patientData.events.length +
              patientData.medications.length +
              patientData.measurements.length !==
            0
          ) {
            lifeline.show(base.farRightPanel, true, patientId, patientData);
          }
          individualActionPlan.show(
            base.farLeftPanel,
            pathwayId,
            pathwayStage,
            standard,
            patientId
          );

          patientSearch.wireUp();
          $('#patient-pane').show();

          base.wireUpTooltips();

          state.rememberTabs('individual');

          base.hideLoading();

          // add state indicator
          base.farRightPanel.attr(
            'class',
            'col-xl-8 col-lg-8 state-patient-rightPanel'
          );

          // $('#right-panel').css("overflow-y", "auto");
          // $('#right-panel').css("overflow-x", "hidden");
          base.updateFixedHeightElements([
            { selector: '#right-panel', padding: 15, minHeight: 300 },
            {
              selector: '#personalPlanIndividual',
              padding: 820,
              minHeight: 200,
            },
            { selector: '#advice-list', padding: 430, minHeight: 250 },
          ]);
        });
      } else {
        base.updateTitle('No patient currently selected');
        base.switchToSingleColumn();
        base.savePanelState();
        patientSearch.show(base.centrePanel, false, false, loadContentFn);
        allPatientList.show(base.centrePanel, true, skip, limit, loadContentFn);

        layout.allPatientView = { skip, limit };

        layout.patientId = '';

        lookup.suggestionModalText =
          'Screen: Patient\nPatient ID: None selected\n===========\n';

        base.wireUpTooltips();
        base.hideLoading();

        // add state indicator
        base.farRightPanel.attr(
          'class',
          'col-xl-8 col-lg-8 state-patient-rightPanel'
        );

        base.updateTab('patients', '', '');

        base.updateFixedHeightElements([
          { selector: '#centre-panel', padding: 15, minHeight: 300 },
          { selector: '.table-scroll', padding: 220, minHeight: 300 },
        ]);
      }
    }, 0);
  },

  populate() {},
};

module.exports = pv;
