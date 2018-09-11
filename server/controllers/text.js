const Text = require('../models/text');

module.exports = {

  get(user, done) {
    Text.findOne({}, (err, text) => {
      if (err) {
        console.log(err);
      }
      if (!text) {
        console.log('Error retrieving text');
        return done(null, false);
      }
      // we only want to return text about indicators the user wants to see
      if (user.viewAllIndicators === false) {
        if (user.indicatorIdsToInclude.length > 0) {
          Object.keys(text.pathways).forEach((pathway) => {
            Object.keys(text.pathways[pathway]).forEach((stage) => {
              Object.keys(text.pathways[pathway][stage].standards).forEach((standard) => {
                if (user.indicatorIdsToInclude.indexOf(`${pathway}.${stage}.${standard}`) < 0) {
                  delete text.pathways[pathway][stage].standards[standard];
                  if (Object.keys(text.pathways[pathway][stage].standards).length === 0) {
                    delete text.pathways[pathway][stage];
                    if (Object.keys(text.pathways[pathway]).length === 0) {
                      delete text.pathways[pathway];
                    }
                  }
                }
              });
            });
          });
        } else if (user.indicatorIdsToExclude.length > 0) {
          Object.keys(text.pathways).forEach((pathway) => {
            Object.keys(text.pathways[pathway]).forEach((stage) => {
              Object.keys(text.pathways[pathway][stage].standards).forEach((standard) => {
                if (user.indicatorIdsToExclude.indexOf(`${pathway}.${stage}.${standard}`) > -1) {
                  delete text.pathways[pathway][stage].standards[standard];
                  if (Object.keys(text.pathways[pathway][stage].standards).length === 0) {
                    delete text.pathways[pathway][stage];
                    if (Object.keys(text.pathways[pathway]).length === 0) {
                      delete text.pathways[pathway];
                    }
                  }
                }
              });
            });
          });
        }
      }
      return done(null, text);
    });
  },

};
