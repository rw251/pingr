const base = require('../base.js');
const data = require('../data.js');
const indicatorHeadlineTemplate = require('../templates/indicator-headline.jade');

const hl = {
  wireUp() {},

  show(panel, isAppend, pathwayId, pathwayStage, standard) {
    const indicators = data.getIndicatorDataSync(
      null,
      [pathwayId, pathwayStage, standard].join('.')
    );

    const tmpl = indicatorHeadlineTemplate;
    const html = tmpl(indicators);

    if (isAppend) panel.append(html);
    else {
      //* b* maintain state
      base.savePanelState();
      panel.html(html);
    }
  },
};

module.exports = hl;
