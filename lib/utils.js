'use strict';

const MAJOR = process.version.split('.')[0].slice(1);
let getBuf = Buffer.from;

exports.byte2 = function(w) {
  return getBuf([(w >> 8) & 255, w & 255]);
};

exports.byte4 = function(w) {
  return getBuf([(w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w & 255]);
};

exports.byte2lsb = function(w) {
  return getBuf([w & 255, (w >> 8) & 255]);
};

if (MAJOR < 5) {
  getBuf = function (arr) {
    return new Buffer(arr);
  }
}
