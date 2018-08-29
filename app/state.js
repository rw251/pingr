const log = require('./log');

const tabs = {};

module.exports = {
  /**
   * Adds a listener to update the saved tab on change
   */
  rememberTabs(identifier) {
    $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
      tabs[identifier] = e.target.hash; // e.target new tab
      log.navigateTab(e.target.hash);
    });
  },

  /**
   * Gets the current tab hash
   */
  getTab(identifier) {
    return tabs[identifier];
  },
};
