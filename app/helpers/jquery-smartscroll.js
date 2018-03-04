module.exports = (function init(ss) {
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
  // smartscroll
  $.fn[ss] = function sScroll(fn) { return fn ? this.bind('scroll', debounce(fn)) : this.trigger(ss); };
}('smartscroll'));
