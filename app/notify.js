var messages = ["Thanks!", "Cheers!", "Nice one!", "Nice work!", "Great!"];

var randomMessage = function () {
  return messages[Math.floor(Math.random() * messages.length)];
};

module.exports = {

  showSaved: function () {
    $("#saved-message h1").text("Saved! " + randomMessage());
    $("#saved-message").hide().toggleClass("in").fadeIn(300);
    window.setTimeout(function () {
      $("#saved-message").fadeOut(300, function () {
        $(this).toggleClass("in");
      });
    }, 2000);
  }

};
