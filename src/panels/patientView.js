var lifeline = require('./lifeline.js'),
  data = require('../data.js');

var pv = {

  wireUp: function(){

  },

  create: function(patientId){
    data.getPatientData(patientId, function(data){
      lifeline.create('top-right-panel', data);
    });
  },

  populate: function(){

  }

};

module.exports = pv;
