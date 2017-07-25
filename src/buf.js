'use strict';

const ENCODING = 'ascii';
const MAJOR = process.version.split('.')[0].slice(1);

if (MAJOR > 5) {
  exports.CODE_NUL = Buffer.from('\x00', ENCODING);
  exports.CODE_SOH = Buffer.from('\x01', ENCODING);
  exports.CODE_X08X03 = Buffer.from('\x08\x03', ENCODING);
  exports.PNG_IHDR = Buffer.from('IHDR', ENCODING);
  exports.PNG_PLTE = Buffer.from('PLTE', ENCODING);
  exports.PNG_tRNS = Buffer.from('tRNS', ENCODING);
  exports.PNG_IDAT = Buffer.from('IDAT', ENCODING);
  exports.PNG_IEND = Buffer.from('IEND', ENCODING);
  exports.PNG_HEAD = Buffer.from('\x89PNG\r\n\x1a\n', ENCODING);
  exports.alloc = (size) => Buffer.alloc(size);
  exports.view = function (raw, len, size) {
    return Buffer.from(raw.buffer, len, size);
  };
} else {
  let rawBuffer;
  exports.CODE_NUL = new Buffer('\x00', ENCODING);
  exports.CODE_SOH = new Buffer('\x01', ENCODING);
  exports.CODE_X08X03 = new Buffer('\x08\x03', ENCODING);
  exports.PNG_IHDR = new Buffer('IHDR', ENCODING);
  exports.PNG_PLTE = new Buffer('PLTE', ENCODING);
  exports.PNG_tRNS = new Buffer('tRNS', ENCODING);
  exports.PNG_IDAT = new Buffer('IDAT', ENCODING);
  exports.PNG_IEND = new Buffer('IEND', ENCODING);
  exports.PNG_HEAD = new Buffer('\x89PNG\r\n\x1a\n', ENCODING);
  exports.alloc = function (size) {
    rawBuffer = new ArrayBuffer(size);
    return new Uint8Array(rawBuffer).fill(0);
  };
  exports.view = function (raw, len, size) {
    return new Uint8Array(rawBuffer, len, size);
  };
}

// deflate header
exports.PNG_DEFLATE_HEADER = function() {
  let header = ((8 + (7 << 4)) << 8) | (3 << 6);
  header += 31 - (header % 31);
  return header;
}();


