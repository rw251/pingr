module.exports = (function init(sr) {
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  const debounce = function debounce(func, threshold, execAsap) {
    let timeout;

    return function debounced(...args) {
      const obj = this;

      function delayed() {
        if (!execAsap) { func.apply(obj, args); }
        timeout = null;
      }

      if (timeout) { clearTimeout(timeout); } else if (execAsap) { func.apply(obj, args); }

      timeout = setTimeout(delayed, threshold || 250);
    };
  };
  // smartresize
  $.fn[sr] = function sResize(fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
}('smartresize'));
