var tabs = {};

module.exports = {

  /**
   * Adds a listener to update the saved tab on change
   */
  rememberTabs: function (identifier) {
    $('a[data-toggle="tab"]').off('shown.bs.tab').on('shown.bs.tab', function (e) {
      tabs[identifier] = e.target.hash; //e.target new tab
    });
  },

  /**
   * Gets the current tab hash
   */
  getTab: function (identifier) {
    return tabs[identifier];
  },

};