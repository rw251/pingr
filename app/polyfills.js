// Number.isNaN doesn't exist in IE
Number.isNaN = Number.isNaN || function (value) {
  return value !== value; // from developer.mozilla.org
};

