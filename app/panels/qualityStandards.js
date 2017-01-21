var base = require('../base.js'),
  data = require('../data.js');

var qs = {

  show: function(panel, isAppend, patientId, pathwayId, pathwayStage, standard) {

    var patientData = data.getPatientData(patientId);

    var tmpl = require("templates/quality-standard");
    //RW TEMP fix
    patientData.standards = patientData.standards.map(function(v){
      if(!v.indicatorId) {
        var iid;
        Object.keys(data.text.pathways).forEach(function(vv){
          Object.keys(data.text.pathways[vv]).forEach(function(vvv){
              Object.keys(data.text.pathways[vv][vvv].standards).forEach(function(vvvv){
                if(data.text.pathways[vv][vvv].standards[vvvv].tabText===v.display) {
                  iid=[vv,vvv,vvvv].join(".");
                  return;
                }
              });
          });
        });
        if(iid) v.indicatorId = iid;
      }
      return v;
    });
    //
    var html = tmpl({
      "standards": patientData.standards,
      indicatorId: pathwayId && pathwayStage && standard ? [pathwayId, pathwayStage, standard].join(".") : null,
      patientId: patientId
    });

    if (isAppend) panel.append(html);
    //*b* maintain state
    else {
      base.savePanelState();
      panel.html(html);
    }
  }
};

module.exports = qs;
