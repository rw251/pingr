module.exports = {

  showSaved: function() {
    $("#saved-message").hide().toggleClass("in").fadeIn(300);
    window.setTimeout(function() {
      $("#saved-message").fadeOut(300, function() {
        $(this).toggleClass("in");
      });
    }, 2000);
  }

};
