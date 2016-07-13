var Text = require('../models/text');

module.exports = {

  get: function(done) {
    Text.find({}, function(err, text) {
      if(err){
        console.log(err);
      }
      if (!text) {
        console.log('Error retrieving text');
        return done(null, false);
      } else {
        done(null, text[0]);
      }
    });
  }

};
