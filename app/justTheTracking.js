const events = require('./events');

const JTT = {
  init: ()=>{
    $(document).on('ready', () => {
      //Wire up global click/hover listener
      events.listen();
    });
  }
};

module.exports = JTT;