const messages = [
  'Thanks!',
  'Cheers!',
  'Nice one!',
  'Nice work!',
  'Great!',
  'Top work!',
  'Excellent!',
  'Fantastic!',
  'Super!',
];

const randomMessage = () =>
  messages[Math.floor(Math.random() * messages.length)];

module.exports = {
  showSaved() {
    $('#saved-message h1').text(`Saved! ${randomMessage()}`);
    $('#saved-message')
      .hide()
      .toggleClass('in')
      .fadeIn(300);
    window.setTimeout(() => {
      $('#saved-message').fadeOut(300, () => {
        $('#saved-message').toggleClass('in');
      });
    }, 2000);
  },
};
