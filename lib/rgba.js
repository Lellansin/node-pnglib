/*
 * link: https://github.com/Qix-/color-string/blob/master/index.js
 * license: https://github.com/Qix-/color-string/blob/master/LICENSE
 */
'use strict';

var colorNames = require('color-name');

var ABBR = /^#([a-f0-9]{3,4})$/i;
var HEX = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
var RGBA = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
var PER = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
var KEYWORD = /(\D+)/;

module.exports = function (string) {
  if (!string) {
    return null;
  }

  var rgb = [0, 0, 0, 255];
  var match;
  var i;
  var hexAlpha;

  if (match = string.match(HEX)) {
    hexAlpha = match[2];
    match = match[1];

    for (i = 0; i < 3; i++) {
      // https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
      var i2 = i * 2;
      rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
    }

    if (hexAlpha) {
      rgb[3] = Math.round(parseInt(hexAlpha, 16) / 255 * 100) / 100;
    }
  } else if (match = string.match(ABBR)) {
    match = match[1];
    hexAlpha = match[3];

    for (i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i] + match[i], 16);
    }

    if (hexAlpha) {
      rgb[3] = Math.round(parseInt(hexAlpha + hexAlpha, 16) / 255 * 100) / 100;
    }
  } else if (match = string.match(RGBA)) {
    for (i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i + 1], 0);
    }

    if (match[4]) {
      rgb[3] = parseFloat(match[4]);
    }
  } else if (match = string.match(PER)) {
    for (i = 0; i < 3; i++) {
      rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
    }

    if (match[4]) {
      rgb[3] = parseFloat(match[4]);
    }
  } else if (match = string.match(KEYWORD)) {
    if (match[1] === 'transparent') {
      return [0, 0, 0, 0];
    }

    rgb = colorNames[match[1]];

    if (!rgb) {
      return null;
    }
    rgb[3] = parseInt(rgb[3]) || 255;
    return rgb;
  } else {
    return null;
  }

  for (i = 0; i < 3; i++) {
    rgb[i] = clamp(rgb[i], 0, 255);
  }
  rgb[3] = parseInt(rgb[3]) || 255;

  return rgb;
};

// helpers
function clamp(num, min, max) {
  return Math.min(Math.max(min, num), max);
}