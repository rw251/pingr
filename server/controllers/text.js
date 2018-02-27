const Text = require('../models/text');

module.exports = {

  get(done) {
    Text.find({}, (err, text) => {
      if (err) {
        console.log(err);
      }
      if (!text) {
        console.log('Error retrieving text');
        return done(null, false);
      }
      return done(null, text[0]);
    });
  },

};
