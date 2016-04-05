var main = {

  getObj: function(options) {
    var obj = JSON.parse(localStorage.bb);

    if(options && options.length>0){
      options.forEach(function(opt){
        if(!obj[opt.name]) {
          obj[opt.name] = opt.value;
          main.setObj(obj);
        }
      });
    }

    /*if (!obj.actions) {
      obj.actions = {};
      setObj(obj);
    }
    if (!obj.plans) {
      obj.plans = {};
      setObj(obj);
    }
    if (!obj.agrees) {
      obj.agrees = {};
      setObj(obj);
    }
    if (!obj.feedback) {
      obj.feedback = [];
      setObj(obj);
    }
    if (!obj.events) {
      obj.events = [];
      setObj(obj);
    }*/
    return obj;
  },

  setObj: function(obj) {
    localStorage.bb = JSON.stringify(obj);
  }

};

module.exports = main;
