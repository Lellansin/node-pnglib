'use strict';

const ENCODING = 'ascii';
const MAJOR = typeof process !== 'undefined' ? process.version.split('.')[0].slice(1) : 0;

exports.CODE_NUL = newBuf('\x00', ENCODING);
exports.CODE_SOH = newBuf('\x01', ENCODING);
exports.CODE_X08X03 = newBuf('\x08\x03', ENCODING);
exports.PNG_IHDR = newBuf('IHDR', ENCODING);
exports.PNG_PLTE = newBuf('PLTE', ENCODING);
exports.PNG_tRNS = newBuf('tRNS', ENCODING);
exports.PNG_IDAT = newBuf('IDAT', ENCODING);
exports.PNG_IEND = newBuf('IEND', ENCODING);
exports.PNG_HEAD = newBuf('\x89PNG\r\n\x1a\n', ENCODING);

// deflate header
exports.PNG_DEFLATE_HEADER = function() {
  let header = ((8 + (7 << 4)) << 8) | (3 << 6);
  header += 31 - (header % 31);
  return header;
}();

exports.alloc = (size) => {
  if (MAJOR > 5 && typeof Buffer !== 'undefined') {
    return bufAlloc(size);
  }
  return u8aAlloc(size);
};

exports.view = (raw, len, size) => {
  if (MAJOR > 5) {
    return bufView(raw, len, size);
  }
  return u8aView(len, size);
};

function newBuf(data) {
  // TODO fit for uint8arr
  if (MAJOR > 5) {
    return Buffer.from(data, ENCODING);
  }
  return new Buffer(data, ENCODING);
}

function bufAlloc(size) {
  return Buffer.alloc(size);
}

function bufView(raw, len, size) {
  return Buffer.from(raw.buffer, len, size);
}

let rawBuffer;
function u8aAlloc(size) {
  rawBuffer = new ArrayBuffer(size);
  return new Uint8Array(rawBuffer).fill(0);
}

function u8aView(len, size) {
  return new Uint8Array(rawBuffer, len, size);
}
