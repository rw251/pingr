const data = require('../data.js');
const chart = require('../chart.js');

const bd = {
  wireUp() {},

  show(
    panel,
    isAppend,
    pathwayId,
    pathwayStage,
    standard,
    selectSeriesFn
  ) {
    const indicators = data.getIndicatorDataSync(
      null,
      [pathwayId, pathwayStage, standard].join('.')
    );

    const dataObj = indicators.opportunities.map(opp => [
      opp.name,
      opp.description,
      Math.max(opp.patients.length, opp.patientCount ? opp.patientCount : 0),
    ]);

    const elem = $("<div id='breakdown-chart' class='chart-width-fix'></div>");

    if (isAppend) panel.append(elem);
    else panel.html(elem);

    chart.drawAnalytics('breakdown-chart', dataObj, selectSeriesFn);

    bd.wireUp();
  },
};

module.exports = bd;
