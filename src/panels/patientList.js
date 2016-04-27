var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js');

var ID = "PATIENT_LIST";

var pl = {

  wireUp: function(onPatientSelected) {
    patientsPanel = $('#patients');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pl.populate(pl.state[0], pl.state[1], pl.state[2], pl.state[3], $(this).index(), sortAsc);
    }).on('click', 'tbody tr', function(e) { //Select individual patient when row clicked#
      var callback = onPatientSelected.bind(this);
      var patientId = $(this).find('td button').attr('data-patient-id');
      callback(patientId);
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });
  },

  selectSubsection: function(section) {
    pl.populate(pl.state[0], pl.state[1], pl.state[2], section, pl.state[4], pl.state[5]);
  },

  populate: function(pathwayId, pathwayStage, standard, subsection, sortField, sortAsc) {
    pl.state = [pathwayId, pathwayStage, standard, subsection, sortField, sortAsc];
    patientsPanel = $('#patients');
    //Remove scroll if exists
    patientsPanel.find('div.table-scroll').getNiceScroll().remove();

    var i, k, prop, header, pList = [];

    data.getIndicatorData([pathwayId, pathwayStage, standard].join("."), function(indicators) {

      if (pathwayId && pathwayStage && standard && subsection) {
        pList = indicators.opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].patients;
        header = indicators.opportunities.filter(function(val) {
          return val.name === subsection;
        })[0].description;
      } else if (pathwayId && pathwayStage && standard) {
        pList = indicators.opportunities.reduce(function(a, b) {
          return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
        });
        header = data[pathwayId][pathwayStage].standards[standard].tableTitle;
      }

      pList = data.removeDuplicates(pList);
      var patients = pList.map(function(patientId) {
        var ret = indicators.patients[patientId];
        ret.nhsNumber = data.patLookup ? data.patLookup[patientId] : patientId;
        ret.patientId = patientId;
        ret.items = []; //The fields in the patient list table
        if (ret[data[pathwayId][pathwayStage].standards[standard].valueId]) {
          if (data[pathwayId][pathwayStage].standards[standard].dateORvalue === "date") {
            ret.items.push(ret[data[pathwayId][pathwayStage].standards[standard].valueId].date);
          } else {
            ret.items.push(ret[data[pathwayId][pathwayStage].standards[standard].valueId].value);
          }
        } else {
          ret.items.push("?");
        }
        ret.items.push(ret.opportunities.map(function(v){return '<span style="width:13px;height:13px;float:left;background-color:' + Highcharts.getOptions().colors[v] + '"></span>';}).join(""));
        ret.items.push(data.numberOfStandardsMissed(patientId));
        return ret;
      });

      var localData = {
        "patients": patients,
        "n": patients.length,
        "header": header,
        "header-items": [{
          "title": "NHS no.",
          "isSorted": false,
          "direction": "sort-asc",
          "tooltip": "NHS number of each patient"
        }]
      };

      //middle column is either value or date
      if (data[pathwayId][pathwayStage].standards[standard].dateORvalue) {
        localData["header-items"].push({
          "title": data[pathwayId][pathwayStage].standards[standard].valueName,
          "tooltip": data[pathwayId][pathwayStage].standards[standard].dateORvalue === "date" ? "Last date " + data[pathwayId][pathwayStage].standards[standard].value + " was measured" : "Last " + data[pathwayId][pathwayStage].standards[standard].value + " reading",
          "isSorted": false,
          "direction": "sort-asc"
        });
      } else {
        if (pathwayStage === lookup.categories.monitoring.name) {
          localData["header-items"].push({
            "title": "Last BP Date",
            "isSorted": false,
            "direction": "sort-asc",
            "tooltip": "Last date BP was measured"
          });
        } else {
          localData["header-items"].push({
            "title": "Last SBP",
            "tooltip": "Last systolic BP reading",
            "isSorted": false,
            "direction": "sort-asc"
          });
        }
      }

      //add qual standard column
      localData["header-items"].push({
        "title": "Categories",
        "titleHTML": 'tba',
        "isUnSortable": true,
        "tooltip": "Categories from above chart"
      });
      //add qual standard column
      localData["header-items"].push({
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isSorted": true,
        "direction": "sort-desc",
        "tooltip": "Total number of improvement opportunities available across all conditions"
      });

      if (sortField === undefined) sortField = 2;
      if (sortField !== undefined) {
        localData.patients.sort(function(a, b) {
          if (sortField === 0) { //NHS number
            if (a.nhsNumber === b.nhsNumber) {
              return 0;
            }

            if (a.nhsNumber > b.nhsNumber) {
              return sortAsc ? 1 : -1;
            } else if (a.nhsNumber < b.nhsNumber) {
              return sortAsc ? -1 : 1;
            }
          } else {
            if (a.items[sortField - 1] === b.items[sortField - 1]) {
              return 0;
            }

            if (a.items[sortField - 1] == "?") return 1;
            if (b.items[sortField - 1] == "?") return -1;

            var A = Number(a.items[sortField - 1]);
            var B = Number(b.items[sortField - 1]);
            if (isNaN(A) || isNaN(B)) {
              A = a.items[sortField - 1];
              B = b.items[sortField - 1];
            }
            if (A > B) {
              return sortAsc ? 1 : -1;
            } else if (A < B) {
              return sortAsc ? -1 : 1;
            }
          }
        });

        for (i = 0; i < localData["header-items"].length; i++) {
          if (i === sortField) {
            localData["header-items"][i].direction = sortAsc ? "sort-asc" : "sort-desc";
            localData["header-items"][i].isAsc = sortAsc;
            localData["header-items"][i].isSorted = true;
          } else {
            localData["header-items"][i].isSorted = false;
          }
        }
      }

      base.createPanelShow(patientList, patientsPanel, localData, {
        "header-item": $("#patient-list-header-item").html(),
        "item": $('#patient-list-item').html()
      });

      $('#patients-placeholder').hide();

      base.setupClipboard($('.btn-copy'), true);

      base.wireUpTooltips();

      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });

    });

  },

  show: function(panel, isAppend, pathwayId, pathwayStage, standard, loadContentFn) {

    var tempMust = $('#patients-panel-yes').html();

    if(isAppend) panel.append(Mustache.render(tempMust));
    else panel.html(Mustache.render(tempMust));

    pl.wireUp(function(patientId) {
      history.pushState(null, null, '#patient/' + [patientId, pathwayId, pathwayStage, standard].join("/"));
      loadContentFn('#patient/' + [patientId, pathwayId, pathwayStage, standard].join("/"));
    });
    pl.populate(pathwayId, pathwayStage, standard, null);
  }

};

module.exports = pl;
