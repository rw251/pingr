var af = {

  create: function(){
    return require("templates/action-filter")();
  },

  show: function(panel, isAppend){
    var html = af.create();

    if (isAppend) panel.append(html);
    else {
      panel.html(html);
    }
  }

};

module.exports = af;
