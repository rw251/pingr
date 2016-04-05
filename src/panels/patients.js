var base = require('../base.js'),
  data = require('../data.js'),
  lookup = require('../lookup.js'),
  chart = require('../chart.js');

var pt = {

  create: function(pathwayId, pathwayStage, standard) {
    var tabData = [];
    for (var key in data[pathwayId][pathwayStage].standards) {
      tabData.push({
        "header": data[pathwayId][pathwayStage].standards[key].tab,
        "active": key === standard,
        "url": window.location.hash.replace(/\/no.*/g, '\/no/' + key)
      });
    }
    return base.createPanel(patientsPanelTemplate, {
      "pathwayStage": pathwayStage,
      "header": data[pathwayId][pathwayStage].standards[standard].chartTitle,
      "tooltip": data[pathwayId][pathwayStage].standards[standard].tooltip,
      "url": window.location.hash.replace(/\/yes.*/g, '').replace(/\/no.*/g, ''),
      "tabs": tabData,
      "text": data[pathwayId][pathwayStage].text
    }, {
      "content": $('#patients-panel-no').html(),
      "tab-header": $('#patients-panel-no-tabs').html(),
      "tab-content": $('#patients-panel-no-page').html()
    });
  },

  createOk: function(pathwayId, pathwayStage) {
    return base.createPanel(patientsPanelTemplate, {
      "ok": true,
      "pathwayStage": pathwayStage,
      "url": window.location.hash.replace(/\/yes/g, '').replace(/\/no/g, ''),
      "text": data[pathwayId][pathwayStage].text
    }, {
      "content": $('#patients-panel-yes').html()
    });
  },

  wireUpPatientPanel: function(pathwayId, pathwayStage, location, standard) {
    patientsPanel = $('#patients');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pt.populatePatientPanel(pathwayId, data.selected, standard, data.subselected, $(this).index(), sortAsc);
    }).on('click', 'tbody tr', function(e) { //Select individual patient when row clicked
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr("title");

      var patientId = $(this).find('td button').attr('data-patient-id');

      //template.showPathwayStagePatientView(patientId, pathwayId, data.selected, standard);//TODO

      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });

    data.selected = pathwayStage;
    data.subselected = null;

    location.off('click', '#breakdown-chart');
    location.on('click', '#breakdown-chart', function() {
      if (!lookup.chartClicked) {
        /*jshint unused: true*/
        $('path.c3-bar').attr('class', function(index, classNames) {
          return classNames.replace(/_unselected_/g, '');
        });
        /*jshint unused: false*/

        if (lookup.charts['breakdown-chart']) lookup.charts['breakdown-chart'].unselect();

        pt.populatePatientPanel(pathwayId, pathwayStage, standard, null);
        data.subselected = null;

        farRightPanel.fadeOut(200);
      }
      lookup.chartClicked = false;
    });

    chart.destroyCharts(['breakdown-chart']);
    setTimeout(function() {
      lookup.charts['breakdown-chart'] = c3.generate({
        bindto: '#breakdown-chart',
        tooltip: {
          format: {
            name: function(name, a, b) {
              var text = data[pathwayId][pathwayStage].standards[standard].opportunities[lookup.index].desc;
              var html = "";
              while (text.length > 40) {
                if (text.indexOf(' ', 40) < 0) break;
                html += text.substr(0, text.indexOf(' ', 40)) + '<br>';
                text = text.substr(text.indexOf(' ', 40) + 1);
              }
              html += text;
              return html;
            },
            value: function(value, ratio, id, index) {
              lookup.index = index;
              return value;
            }
          }
        },
        data: {
          columns: [
            ["Patients"].concat(data[pathwayId][pathwayStage].standards[standard].opportunities.map(function(val) {
              return val.patients.length;
            }))
          ],
          type: 'bar',
          labels: true,
          color: function(color, d) {
            return lookup.colors[d.index];
          },
          selection: {
            enabled: true
          },
          onclick: function(d) {
            chart.selectPieSlice('breakdown-chart', d);
            pt.populatePatientPanel(pathwayId, pathwayStage, standard, data[pathwayId][pathwayStage].standards[standard].opportunities[d.index].name);
            data.subselected = data[pathwayId][pathwayStage].standards[standard].opportunities[d.index].name;

            //colour table appropriately - need to add opacity
            var sliceColourHex = lookup.colors[d.index];
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            sliceColourHex = sliceColourHex.replace(shorthandRegex, function(m, r, g, b) {
              return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sliceColourHex);
            var opacity = 0.2;
            var sliceColour = 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ',' + opacity + ')';

            $('.table.patient-list.table-head-hidden').css({
              "backgroundColor": sliceColour
            });
          }
        },
        bar: {
          width: {
            ratio: 0.5
          }
        },
        legend: {
          show: false
        },
        grid: {
          focus: {
            show: false
          }
        },
        axis: {
          x: {
            type: 'category',
            categories: data[pathwayId][pathwayStage].standards[standard].opportunities.map(function(val) {
              return val.name;
            }),
            label: false
          },
          y: {
            label: {
              text: 'Patient count (n)',
              position: 'outer-middle'
            }
          }
        }
      });
    }, 1);
  },

  wireUpPatientPanelOk: function(pathwayId, pathwayStage, location) {
    patientsPanel = $('#patients');

    patientsPanel.on('click', 'thead tr th.sortable', function() { //Sort columns when column header clicked
      var sortAsc = !$(this).hasClass('sort-asc');
      if (sortAsc) {
        $(this).removeClass('sort-desc').addClass('sort-asc');
      } else {
        $(this).removeClass('sort-asc').addClass('sort-desc');
      }
      pt.populatePatientPanelOk(pathwayId, data.selected, data.subselected, $(this).index(), sortAsc);
    }).on('click', 'tbody tr', function(e) { //Select individual patient when row clicked
      $('[data-toggle="tooltip"]').tooltip('hide');
      $(this).tooltip('destroy');
      base.clearBox();
      $('.list-item').removeClass('highlighted');
      $(this).addClass('highlighted').removeAttr('title');

      var patientId = $(this).find('td button').attr('data-patient-id');

      //template.showPathwayStagePatientView(patientId, pathwayId, data.selected, null);//TODO
      e.preventDefault();
      e.stopPropagation();
    }).on('click', 'tbody tr button', function(e) {
      //don't want row selected if just button pressed?
      e.preventDefault();
      e.stopPropagation();
    });

    data.selected = pathwayStage;
    data.subselected = null;
  },
  populatePatientPanel: function(pathwayId, pathwayStage, standard, subsection, sortField, sortAsc) {
    //Remove scroll if exists
    patientsPanel.find('div.table-scroll').getNiceScroll().remove();

    var pList = [],
      i, k, prop, header;
    patientsPanel.fadeOut(200, function() {
      $(this).fadeIn(200);
    });
    if (pathwayId && pathwayStage && standard && subsection) {
      pList = data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
        return val.name === subsection;
      })[0].patients;
      header = data[pathwayId][pathwayStage].standards[standard].opportunities.filter(function(val) {
        return val.name === subsection;
      })[0].desc;
    } else if (pathwayId && pathwayStage && standard) {
      pList = data[pathwayId][pathwayStage].standards[standard].opportunities.reduce(function(a, b) {
        return a.patients ? a.patients.concat(b.patients) : a.concat(b.patients);
      });
      header = data[pathwayId][pathwayStage].standards[standard].tableTitle;
    } else if (pathwayId && pathwayStage && subsection) {
      pList = data[pathwayId][pathwayStage].bdown[subsection].patients;
      header = data[pathwayId][pathwayStage].bdown[subsection].name;
    } else if (pathwayId && pathwayStage) {
      for (prop in data[pathwayId][pathwayStage].bdown) {
        if (data[pathwayId][pathwayStage].bdown.hasOwnProperty(prop)) {
          pList = pList.concat(data[pathwayId][pathwayStage].bdown[prop].patients);
        }
      }
      header = data[pathwayId][pathwayStage].patientListHeader;
    } else if (pathwayId) {
      for (i in lookup.categories) {
        for (prop in data[pathwayId][i].bdown) {
          if (data[pathwayId][i].bdown.hasOwnProperty(prop)) {
            pList = pList.concat(data[pathwayId][i].bdown[prop].patients);
          }
        }
      }
    } else {
      for (k = 0; k < data.diseases.length; k++) {
        for (i in lookup.categories) {
          for (prop in data[data.diseases[k].id][i].bdown) {
            if (data[data.diseases[k].id][i].bdown.hasOwnProperty(prop)) {
              pList = pList.concat(data[data.diseases[k].id][i].bdown[prop].patients);
            }
          }
        }
      }
    }
    pList = data.removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
      var ret = data.patients[patientId];
      ret.nhsNumber = data.patLookup ? data.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      if (ret[data[pathwayId][pathwayStage].standards[standard].valueId]) {
        if (data[pathwayId][pathwayStage].standards[standard].dateORvalue === "date") {
          ret.items.push(ret[data[pathwayId][pathwayStage].standards[standard].valueId][0][ret[data[pathwayId][pathwayStage].standards[standard].valueId][0].length - 1]);
        } else {
          ret.items.push(ret[data[pathwayId][pathwayStage].standards[standard].valueId][1][ret[data[pathwayId][pathwayStage].standards[standard].valueId][1].length - 1]);
        }
      } else {
        ret.items.push("?");
      }
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
  },

  populatePatientPanelOk: function(pathwayId, pathwayStage, subsection, sortField, sortAsc) {
    var pList = [],
      i, k, prop, header, tooltip;
    patientsPanel.fadeOut(200, function() {
      $(this).fadeIn(200);
    });

    pList = data[pathwayId][pathwayStage].patientsOk;
    header = data[pathwayId][pathwayStage].text.panelOkHeader.text;
    tooltip = data[pathwayId][pathwayStage].text.panelOkHeader.tooltip;

    pList = data.removeDuplicates(pList);
    var patients = pList.map(function(patientId) {
      var ret = data.patients[patientId];
      ret.nhsNumber = data.patLookup ? data.patLookup[patientId] : patientId;
      ret.patientId = patientId;
      ret.items = []; //The fields in the patient list table
      ret.items.push(data.patients[patientId].breach ? data.numberOfStandardsMissed(patientId) : 0);
      return ret;
    });
    var localData = {
      "patients": patients,
      "n": patients.length,
      "header": header,
      "tooltip": tooltip,
      "header-items": [{
        "title": "NHS no.",
        "isSorted": false,
        "direction": "sort-asc"
      }, {
        "title": "All Opportunities",
        "titleHTML": '# of <i class="fa fa-flag" style="color:red"></i>',
        "isSorted": true,
        "direction": "sort-desc",
        "tooltip": "Total number of improvement opportunities available across all conditions"
      }]
    };

    if (sortField === undefined) sortField = 1;

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


    base.createPanelShow(patientList, patientsPanel, localData, {
      "header-item": $("#patient-list-header-item").html(),
      "item": $('#patient-list-item').html()
    });

    $('#patients-placeholder').hide();

    base.setupClipboard($('.btn-copy'), true);

    base.wireUpTooltips();

    var c = patientsPanel.find('div.table-scroll').getNiceScroll();
    if (c && c.length > 0) {
      c.resize();
    } else {
      patientsPanel.find('div.table-scroll').niceScroll({
        cursoropacitymin: 0.3,
        cursorwidth: "7px",
        horizrailenabled: false
      });
    }
  }

};

module.exports = pt;
