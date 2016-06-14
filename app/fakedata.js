var getDates = function(n) {
  var arr = [];

  var today = new Date();
  var freqInterval = Math.random() < 0.33 ? 50 : (Math.random() < 0.5 ? 100 : 200);

  for (var i = 0; i < n; i++) {
    today.setDate(today.getDate() - ((Math.random() * freqInterval) + freqInterval / 2));
    arr.unshift(today.toISOString().substr(0, 10));
  }

  arr.unshift("x");

  return arr;
};

var getValues = function(name, n, low, high, isDecimal) {
  var arr = [name];

  var start = Math.random() * (high - low) + low;
  if (!isDecimal) start = Math.floor(start);
  else start = Math.round(start * 100) / 100;
  for (var i = 0; i < n; i++) {
    start += (Math.random() - 0.5) * (high - low) / 10;
    start = Math.max(low, Math.min(start, high));
    if (!isDecimal) start = Math.floor(start);
    else start = Math.round(start * 100) / 100;
    arr.push(start);
  }

  return arr;
};

//0 occasionally 1-9
var getChadValues = function(n) {
  var arr = ["Chad2Vasc"];

  var start = Math.random() < 0.2 ? 0 : 1 + Math.floor(Math.random() * 8);
  for (var i = 0; i < n; i++) {
    start += Math.floor(Math.random() * 1.25);
    start = Math.max(1, Math.min(9, start));
    arr.push(start);
  }
  return arr;
};

module.exports = {

  generatePatientData: function() {
    var r = Math.random();
    $.getJSON("data.json?v=" + r, function(file) {
      var i = 0;
      for (var id in file.patients) {
        //get 6 dates
        var dateArray = getDates(6);

        if (!file.patients[id].acr) {
          file.patients[id].acr = [dateArray, getValues("ACR", 4, 0, 70)];
        }

        if (file.patients[id].sbp && file.patients[id].dbp) {
          for (i = 1; i < file.patients[id].sbp[0].length; i++) {
            if (file.patients[id].dbp[1][i] >= file.patients[id].sbp[1][i] - 5) {
              console.log("X", "ID:", id, "DBP:", file.patients[id].dbp[1][i], "SBP:", file.patients[id].sbp[1][i] - 5);
              file.patients[id].dbp[1][i] -= 5;
              file.patients[id].sbp[1][i] += 5;
            }

            if (file.patients[id].dbp[1][i] < 20 || file.patients[id].sbp[1][i] < 60) {
              console.log("Y", "ID:", id, "DBP:", file.patients[id].dbp[1][i], "SBP:", file.patients[id].sbp[1][i] - 5);
            }

          }
        }

        /*if(!file.patients[id].sbp) {
            file.patients[id].sbp = [dateArray,getValues("SBP", 6, 100,180)];
          }

          if(!file.patients[id].dbp) {
            file.patients[id].dbp = [dateArray,getValues("DBP", 6, 50,120)];
          }
*/
        if (file.patients[id].egfr) {
          for (i = 1; i < file.patients[id].egfr[0].length; i++) {
            file.patients[id].egfr[1][i] = Math.max(5, file.patients[id].egfr[1][i]);
          }
        }
        if (file.patients[id].asthma) {
          file.patients[id].asthma = [dateArray, getValues("PEFR", 6, 200, 800)];
        }
        /*
                  if(!file.patients[id].CHA2DS2Vasc) {
                    file.patients[id].CHA2DS2Vasc = [dateArray, getChadValues(6)];
                  }

                  if(file.patients[id].pulse.length===2 && file.patients[id].pulse[0].length==7) {
                    file.patients[id].pulse = [dateArray,getValues("PULSE", 6, 45,150)];
                  }

                  if(file.patients[id].INR.length===2 && file.patients[id].INR[0].length==7) {
                    file.patients[id].INR = [dateArray,getValues("INR", 6, 1,4, true)];
                  }*/
      }

      console.log(JSON.stringify(file.patients));
    });
  },

  generateTrendData: function(labels, endDate, endValues, minValue, maxValue, changeProbs, favourUpProbs, days) {
    var rtn = [["x", endDate.toISOString().substr(0, 10)]],
      i, j;
    for (i = 0; i < labels.length; i++) {
      rtn.push([labels[i], endValues[i]]);
    }
    for (i = 0; i < days; i++) {
      endDate.setDate(endDate.getDate() - 1);
      rtn[0].push(endDate.toISOString().substr(0, 10));
      for (j = 0; j < labels.length; j++) {
        if (Math.random() < changeProbs[j]) {
          if (Math.random() < favourUpProbs[j]) {
            endValues[j] = Math.min(maxValue, endValues[j] + 1);
          } else {
            endValues[j] = Math.max(minValue, endValues[j] - 1);
          }
        }
        rtn[j + 1].push(endValues[j]);
      }
    }
    return rtn;
  }
};
