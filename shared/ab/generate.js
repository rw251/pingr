require('dotenv').config();
// Run with:
//  node generate.js

const fs = require('fs');
const path = require('path');
const localTests = require('./tests.js');
const config = require('../../server/config.js');
const mongoose = require('mongoose');

Object.keys(localTests).forEach((key) => {
  localTests[key]['NOT IN DB'] = 'This is no longer in mongo - perhaps it could be removed.';
});

mongoose.Promise = global.Promise;
mongoose.connect(config.db.url);

const Test = require('../../server/models/ab/test');

const makeFile = () => {
  let file = 'module.exports = {';

  Object.keys(localTests).forEach((key) => {
    const name = key.indexOf(' ') > -1 ? `"${key}"` : key;
    file += `
  ${name}: {`;
    Object.keys(localTests[key]).forEach((key2) => {
      if (key2 === 'init' || key2 === 'pullDown') {
        file += `
    ${key2}: ${localTests[key][key2].toString()},`;
      } else if (localTests[key][key2] === false || localTests[key][key2]) {
        const name2 = key2.indexOf(' ') > -1 ? `"${key2}"` : key2;
        file += `
    ${name2}: '${localTests[key][key2].toString()}',`;
      }
    });
    file += `
  },`;
  });

  file += `
};
`;

  return file;
};

Test.find({}, (err, tests) => {
  if (err) {
    console.log(err);
    process.exit(-1);
  }
  tests.forEach((test) => {
    if (localTests[test.name]) {
      localTests[test.name].description = test.description;
      localTests[test.name].researchQuestion = test.researchQuestion;
      delete localTests[test.name]['NOT IN DB'];
    } else {
      localTests[test.name] = {
        description: test.description,
        researchQuestion: test.researchQuestion,
      };
      localTests[test.name].init = ($) => {
        // INSERT TEST CODE HERE
      };
      localTests[test.name].pullDown = ($) => {
        // INSERT TEST CODE HERE
      };
      localTests[test.name].readyToDeploy = false;
    }
  });
  mongoose.disconnect();
  fs.writeFileSync(path.join(__dirname, 'tests.js'), makeFile());
});

