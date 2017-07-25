'use strict';

var MAJOR = process.version.split('.')[0].slice(1);
var utils = exports;

// Create crc32 lookup table
var CRC_TABLE = function () {
  var _crc32 = new Array();
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) {
      if (c & 1) {
        c = -306674912 ^ c >> 1 & 0x7fffffff;
      } else {
        c = c >> 1 & 0x7fffffff;
      }
    }
    _crc32[i] = c;
  }
  return _crc32;
}();

utils.write2 = function (buf, offs, w) {
  buf[offs++] = w >> 8 & 255;
  buf[offs++] = w & 255;
  return offs;
};

utils.write4 = function (buf, offs, w) {
  buf[offs++] = w >> 24 & 255;
  buf[offs++] = w >> 16 & 255;
  buf[offs++] = w >> 8 & 255;
  buf[offs++] = w & 255;
  return offs;
};

utils.write2lsb = function (buf, offs, w) {
  buf[offs++] = w & 255;
  buf[offs++] = w >> 8 & 255;
  return offs;
};

utils.writeb = function (buf, offs, bytes) {
  for (var i = 0, len = bytes.length; i < len; i++) {
    buf[offs++] = bytes[i];
  }
  return offs;
};

utils.crc32 = function crc32(buf, offs, size) {
  var crc = -1,
      over = size - 4;
  for (var i = 4; i < over; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[offs + i]) & 0xff] ^ crc >>> 8;
  }
  utils.write4(buf, offs + over, crc ^ -1);
};

var getBuf = function getBuf(dat) {
  if (MAJOR < 6) {
    return new Buffer(dat, 'ascii');
  }
  return Buffer.from(dat, 'ascii');
};
