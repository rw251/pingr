var Practice = require('../models/practice');

module.exports = {

  get: function(id, done) {
    Practice.findOne({
      '_id': id
    }, function(err, practice) {
      if (!practice) {
        console.log('Practice doesnt exists with id: ' + id);
        return done(null, false);
      } else {
        done(null, practice.toObject());
      }
    });
  },
  
  getMany: function(ids, done) {
    Practice.find({
      '_id': {
        $in: ids,
      },
    }, function(err, practices) {
      if (!practices || practices.length === 0) {
        console.log('Practice doesnt exists with ids: ' + ids.join(", "));
        return done(null, false);
      } else {
        done(null, practices.map(v=>v.toObject()));
      }
    });
  },

  list: function(done) {
    Practice.find({}, null, {sort: {name: 1}}, function(err, practices) {
      if (err) {
        return done(err);
      }
      practices = practices.map(function(v) {
        return v.toObject();
      });
      return done(null, practices);
    });
  }

};
