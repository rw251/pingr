var Config = require('../models/config')

var c = {

  get: function (key, done) {
    Config.findOne({ key: key }, function (err, value) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding config key: " + key));
      }
      if (!value) {
        console.log('Error finding config value');
        return done(null, false);
      } else {
        done(null, value);
      }
    });
  },

  set: function (key, value, done) {
    c.get(key, function (err, cfg) {
      if (err) return done(err);
      if (cfg) {
        cfg.value = value;
      } else {
        cfg = new Config({ key, value });
      }
      cfg.save(function (err, cfg) {
        if (err) {
          return done(err);
        } else {
          return done(null);
        }
      });
    });
  },

};

module.exports = c;
