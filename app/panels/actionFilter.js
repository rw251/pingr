const actionFilterTmpl = require('../templates/action-filter.jade');

const af = {
  create() {
    return actionFilterTmpl();
  },

  show(panel, isAppend) {
    const html = af.create();

    if (isAppend) panel.append(html);
    else {
      panel.html(html);
    }
  },
};

module.exports = af;
