const Practice = require('../models/practice');

module.exports = {

  get(id, done) {
    Practice.findOne({ _id: id }, (err, practice) => {
      if (!practice) {
        console.log(`Practice doesnt exists with id: ${id}`);
        return done(null, false);
      }
      return done(null, practice.toObject());
    });
  },

  getMany(ids, done) {
    Practice.find({ _id: { $in: ids } }, (err, practices) => {
      if (!practices || practices.length === 0) {
        console.log(`Practice doesnt exists with ids: ${ids.join(', ')}`);
        return done(null, false);
      }
      return done(null, practices.map(v => v.toObject()));
    });
  },

  list(done) {
    Practice.find({}, null, { sort: { name: 1 } }, (err, practices) => {
      if (err) {
        return done(err);
      }
      const practiceList = practices.map(v => v.toObject());
      return done(null, practiceList);
    });
  },

};
