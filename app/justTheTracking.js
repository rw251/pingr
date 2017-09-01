const events = require('./events');

const JTT = {
  init: ()=>{
    $(document).on('ready', () => {
      //Wire up global click/hover listener
      events.listen();

      // and tooltips
      $('[data-toggle="tooltip"]').tooltip();
    });
  }
};

module.exports = JTT;