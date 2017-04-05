var base = require('../base.js'),
  data = require('../data.js');

var qs = {

  create: function(patientId, pathwayId, pathwayStage, standard){
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
      if(v.indicatorId) {
        v.indicatorDescription = data.text.pathways[v.indicatorId.split(".")[0]][v.indicatorId.split(".")[1]].standards[v.indicatorId.split(".")[2]].description;
      }
      return v;
    }).sort(function(a,b){
      if(a.targetMet === b.targetMet) return 0;
      else if(a.targetMet) return 1;
      return -1;
    });

    var processStandards = patientData.standards.filter(function(v){
      return v.type==="process";
    });

    var outcomeStandards = patientData.standards.filter(function(v){
      return v.type==="outcome";
    });
    //
    var html = tmpl({
      noStandards : patientData.standards.length===0,
      processStandards: processStandards,
      outcomeStandards: outcomeStandards,
      indicatorId: pathwayId && pathwayStage && standard ? [pathwayId, pathwayStage, standard].join(".") : null,
      patientId: patientId
    });

    return html;
  },

  show: function(panel, isAppend, patientId, pathwayId, pathwayStage, standard) {

    var html = qs.create(patientId, pathwayId, pathwayStage, standard);

    if (isAppend) panel.append(html);
    //*b* maintain state
    else {
      base.savePanelState();
      panel.html(html);
    }

    panel.off('click','.reason-link').on('click','.reason-link',function(e){
      var action = $(this).html();
      panel.find('.qs-show-more-row').hide();
      panel.find('.reason-link').html('Show more <i class="fa fa-caret-down"></i>');
      if(action.indexOf('Show more')>-1){
        panel.find('.qs-show-more-row[data-id="' + $(this).data('id') + '"]').show("fast");
        $(this).html('Show less <i class="fa fa-caret-up"></i>');
      }

      e.preventDefault();
    });
  },

  update: function(patientId, pathwayId, pathwayStage, standard) {
    var html = qs.create(patientId, pathwayId, pathwayStage, standard);

    $('#qs').replaceWith(html);
  }
};

module.exports = qs;
