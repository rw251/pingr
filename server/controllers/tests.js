const Test = require('../models/test');

module.exports = {

  get(id) {
    return Test.findOne({ _id: id }).lean().exec();
  },

  list() {
    return Test.find({}).lean().exec();
  },

  add(test) {
    const testToAdd = new Test(test);
    return testToAdd.save().exec();
  },

  async start(id) {
    const test = await Test.findOne({ _id: id }).lean().exec();
    if (test && !test.isRunning) {
      test.isRunning = true;
      await test.save().exec();
    }
    return true;
  },

  async stop(id) {
    const test = await Test.findOne({ _id: id }).lean().exec();
    if (test && test.isRunning) {
      test.isRunning = false;
      await test.save().exec();
    }
    return true;
  },

};
