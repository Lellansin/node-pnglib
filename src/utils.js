'use strict';

const utils = exports;

// Create crc32 lookup table
const CRC_TABLE = function () {
  let _crc32 = Array(256);
  for (let i = 0; i < 256; ++i) {
    let c = i;
    for (let j = 0; j < 8; ++j) {
      if (c & 1) {
        c = -306674912 ^ ((c >> 1) & 0x7fffffff);
      } else {
        c = (c >> 1) & 0x7fffffff;
      }
    }
    _crc32[i] = c;
  }
  return _crc32;
}();

utils.write2 = function (buf, offs, w) {
  buf[offs++] = (w >> 8) & 255;
  buf[offs++] = w & 255;
  return offs;
};

utils.write4 = function (buf, offs, w) {
  buf[offs++] = (w >> 24) & 255;
  buf[offs++] = (w >> 16) & 255;
  buf[offs++] = (w >> 8) & 255;
  buf[offs++] = w & 255;
  return offs;
};

utils.write2lsb = function (buf, offs, w) {
  buf[offs++] = w & 255;
  buf[offs++] = (w >> 8) & 255;
  return offs;
};

utils.writeb = function (buf, offs, bytes) {
  for (let i = 0, len = bytes.length; i < len; ++i) {
    buf[offs++] = bytes[i];
  }
  return offs;
};

utils.crc32 = function (buf, offs, size) {
  let crc = -1, over = size - 4;
  for (let i = 4; i < over; ++i) {
    crc = CRC_TABLE[(crc ^ buf[offs + i]) & 0xff] ^ (crc >>> 8);
  }
  utils.write4(buf, offs + over, crc ^ -1);
};

utils.hexToBin = function (num) {
  let str = Number(num, 16).toString(2);
  let len = str.length;
  return len < 8 ? ('0'.repeat(8 - len) + str) : str;
};
