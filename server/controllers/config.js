const Config = require('../models/config');

const c = {

  get(key, done) {
    Config.findOne({ key }, (err, value) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding config key: ${key}`));
      }
      if (!value) {
        console.log('Error finding config value');
        return done(null, false);
      }
      return done(null, value);
    });
  },

  set(key, value, done) {
    c.get(key, (err, cfg) => {
      if (err) return done(err);
      let cfgToSave = {};
      if (cfg) {
        cfgToSave = cfg;
        cfgToSave.value = value;
      } else {
        cfgToSave = new Config({ key, value });
      }
      return cfgToSave.save((saveErr) => {
        if (saveErr) {
          return done(saveErr);
        }
        return done(null);
      });
    });
  },

};

module.exports = c;
