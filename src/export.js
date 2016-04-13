var log = require('./log.js');

var doc, margin = 20,
  verticalOffset = margin;

var addHeading = function(text, size) {
  if (verticalOffset > 270) {
    doc.addPage();
    verticalOffset = margin;
  }
  doc.setFontSize(size).text(margin, verticalOffset + 10, text);
  verticalOffset += 15;
};

var addLine = function(text) {
  var lines = doc.setFontSize(11).splitTextToSize(text, 170);
  if (verticalOffset + lines.length * 10 > 280) {
    doc.addPage();
    verticalOffset = margin;
  }
  doc.text(margin, verticalOffset + 5, lines);
  verticalOffset += lines.length * 7;
};

module.exports = {
  exportPlan: function(what) {
    doc = new jsPDF();

    //create doctype
    var data = log.getObj(),
      i, j, mainId, suggs;


    addHeading("Action Plan", 24);
    //Measured
    addHeading("Monitoring", 20);

    addLine(what);
    addLine(what);
    addLine(what);

    /*	var internalFunc = function(el) {
      var k;
      if(data.plans.individual[el] || data.actions[el]) {
        addLine("Patient "+ el +":");
        if(data.plans.individual[el]) {
          for(k =0; k < data.plans.individual[el].length; k++){
            if(!data.plans.individual[el][k].done){
              addLine(data.plans.individual[el][k].text);
            }
          }
        }
        if(data.actions[el]) {
          var pathSec = local.data[local.pathwayId].patients[el].pathwayStage;
          var pathSub = local.data[local.pathwayId].patients[el].subsection;
          for(k =0; k < Math.max(data.actions[el].agree.length, data.actions[el].done.length); k++){
            if(data.actions[el].done.length>k && data.actions[el].done[k] ){
              //Completed so ignore
            } else if(data.actions[el].agree.length>k && data.actions[el].agree[k] ){
              addLine(log.plan[pathSec].individual[pathSub][k].text);
            }
          }   //
        }
      }
    };

    addHeading("Team plan",14);
    suggs = local.data[local.pathwayId].monitoring.suggestions;
    for(i=0; i<suggs.length; i++){
      if(data.log.monitoring && data.log.monitoring.done && data.log.monitoring.done.length>i && data.log.monitoring.done[i] ){
        //Completed so ignore
      } else if(data.log.monitoring && data.log.monitoring.agree && data.log.monitoring.agree.length>i && data.log.monitoring.agree[i] ){
        addLine(suggs[i].text);
      }
    }

    if(data.plans.team.monitoring && data.plans.team.monitoring.filter(function(i,v){if(!v.done) return true; else return false;}).length>0){
      addHeading("Custom team plan",14);
      for(i=0; i < data.plans.team.monitoring.length; i++){
          if(!data.plans.team.monitoring[i].done){
            addLine(data.plans.team.monitoring[i].text);
          }
      }
    }

    addHeading("Custom individual plans",14);
    for(i=0; i< local.data[local.pathwayId].monitoring.breakdown.length; i++){
      mainId = local.data[local.pathwayId].monitoring.breakdown[i][0];
      local.data[local.pathwayId].monitoring.bdown[mainId].patients.forEach(internalFunc);
    }

    addHeading("Treatment",20);

    addHeading("Team plan",14);
    suggs = local.data[local.pathwayId].treatment.suggestions;
    for(i=0; i<suggs.length; i++){
      if(data.log.treatment && data.log.treatment.done && data.log.treatment.done.length>i && data.log.treatment.done[i] ){
        //Completed so ignore
      } else if(data.log.treatment && data.log.treatment.agree && data.log.treatment.agree.length>i && data.log.treatment.agree[i] ){
        addLine(suggs[i].text);
      }
    }

    if(data.plans.team.treatment && data.plans.team.treatment.filter(function(i,v){if(!v.done) return true; else return false;}).length>0){
      addHeading("Custom team plan",14);
      for(i=0; i < data.plans.team.treatment.length; i++){
          if(!data.plans.team.treatment[i].done){
            addLine(data.plans.team.treatment[i].text);
          }
      }
    }

    addHeading("Custom individual plans",14);
    for(i=0; i< local.data[local.pathwayId].monitoring.breakdown.length; i++){
      mainId = local.data[local.pathwayId].monitoring.breakdown[i][0];
      local.data[local.pathwayId].monitoring.bdown[mainId].patients.forEach(internalFunc);
    }*/

    //trigger download
    doc.save();
  }
};
