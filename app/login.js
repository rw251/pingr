const login = {
  init: () => {
    $(document).on('ready', () => {
      //* b* using comment process to assert this
      const ie9OrLess = $('.unsuppotedIE').length < 1;
      // remove is a deliberate choice to avoid inappropriate attempts to access
      if (ie9OrLess) {
        $('#alt-suggestion').remove();
        $('#lock-hook').show();
      } else {
        $('#lock-hook').remove();
        $('#alt-suggestion').show();
      }
    });
  },
};
module.exports = login;
