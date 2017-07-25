'use strict';

const MAJOR = process.version.split('.')[0].slice(1);
const utils = exports;

// Create crc32 lookup table
const CRC_TABLE = function () {
  let _crc32 = new Array();
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
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

utils.byte2 = function(w) {
  return [(w >> 8) & 255, w & 255];
};

utils.byte4 = function(w) {
  return [(w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w & 255];
};

utils.byte2lsb = function(w) {
  return [w & 255, (w >> 8) & 255];
};

// helper functions for that ctx
utils.write = function write(buf, offs) {
  let args = Array.prototype.slice.apply(arguments).slice(2);
  Buffer.concat(args.map(getBuf)).copy(buf, offs);
}

utils.crc32 = function crc32(buf, offs, size) {
  let crc = -1, over = size - 4;
  for (let i = 4; i < over; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[offs + i]) & 0xff] ^ (crc >>> 8);
  }
  utils.write(buf, offs + over, utils.byte4(crc ^ -1));
};

const getBuf = function(dat) {
  if (MAJOR < 6) {
    return new Buffer(dat, 'ascii');
  }
  return Buffer.from(dat, 'ascii');
};
