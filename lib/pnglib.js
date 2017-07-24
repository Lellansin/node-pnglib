'use strict';

const BUF = require('./buf');
const utils = require('./utils');
const RGBA = require('./rgba');

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

class PNGlib {
  constructor (w, h, d, bg) {
    this.width  = w;
    this.height = h;
    this.depth  = d || 8;
    this.bg     = bg;

    // pixel data and row filter identifier size
    this.pix_size = this.height * (this.width + 1);

    // deflate header, pix_size, block headers, adler32 checksum
    this.data_size = 2 + this.pix_size + 5 * Math.floor((0xfffe + this.pix_size) / 0xffff) + 4;

    // offsets and sizes of Png chunks
    this.ihdr_offs = 0;                               // IHDR offset and size
    this.ihdr_size = 4 + 4 + 13 + 4;
    this.plte_offs = this.ihdr_offs + this.ihdr_size; // PLTE offset and size
    this.plte_size = 4 + 4 + 3 * this.depth + 4;
    this.trns_offs = this.plte_offs + this.plte_size; // tRNS offset and size
    this.trns_size = 4 + 4 + this.depth + 4;
    this.idat_offs = this.trns_offs + this.trns_size; // IDAT offset and size
    this.idat_size = 4 + 4 + this.data_size + 4;
    this.iend_offs = this.idat_offs + this.idat_size; // IEND offset and size
    this.iend_size = 4 + 4 + 4;
    this.buffer_size  = this.iend_offs + this.iend_size;  // total PNG size

    this.buffer  = BUF.alloc(this.buffer_size);
    this.palette = new Map();
    this.pindex  = 0;

    // initialize non-zero elements
    write(this.buffer, this.ihdr_offs, utils.byte4(this.ihdr_size - 12), BUF.PNG_IHDR, utils.byte4(this.width), utils.byte4(this.height), BUF.CODE_X08X03);
    write(this.buffer, this.plte_offs, utils.byte4(this.plte_size - 12), BUF.PNG_PLTE);
    write(this.buffer, this.trns_offs, utils.byte4(this.trns_size - 12), BUF.PNG_tRNS);
    write(this.buffer, this.idat_offs, utils.byte4(this.idat_size - 12), BUF.PNG_IDAT);
    write(this.buffer, this.iend_offs, utils.byte4(this.iend_size - 12), BUF.PNG_IEND);

    // initialize deflate header
    write(this.buffer, this.idat_offs + 8, utils.byte2(BUF.PNG_DEFLATE_HEADER));

    // initialize deflate block headers
    for (let i = 0; (i << 16) - 1 < this.pix_size; i++) {
      let size, bits;
      if (i + 0xffff < this.pix_size) {
        size = 0xffff;
        bits = BUF.CODE_NUL;
      } else {
        size = this.pix_size - (i << 16) - i;
        bits = BUF.CODE_SOH;
      }
      write(this.buffer, this.idat_offs + 8 + 2 + (i << 16) + (i << 2), bits, utils.byte2lsb(size), utils.byte2lsb(~size));
    }

    if (this.bg) this.color(this.bg);
    else this.color(0, 0, 0, 0);
  }

  // compute the index into a png for a given pixel
  index(x, y) {
    let i = y * (this.width + 1) + x + 1;
    let j = this.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i;
    return j;
  }

  // convert a color and build up the palette
  color(red, green, blue, alpha) {
    if (typeof red == 'string') {
      let rgba = RGBA(red);
      if (!rgba) {
        throw new Error(`invalid color ${rgba}`);
      }
      red = rgba[0];
      green = rgba[1];
      blue = rgba[2];
      alpha = rgba[3];
    }
    else {
      alpha = alpha >= 0 ? alpha : 255;
    }

    const color = (((((alpha << 8) | red) << 8) | green) << 8) | blue;

    if (!this.palette.has(color)) {
      if (this.pindex == this.depth) {
        console.warn('node-pnglib: depth is not enough, set up it for more');
        return BUF.CODE_NUL;
      }

      let ndx = this.plte_offs + 8 + 3 * this.pindex;

      this.buffer[ndx + 0] = red;
      this.buffer[ndx + 1] = green;
      this.buffer[ndx + 2] = blue;
      this.buffer[this.trns_offs + 8 + this.pindex] = alpha;

      this.palette.set(color, this.pindex++);
    }
    return this.palette.get(color);
  }

  setPixel(x, y, rgba) {
    this.buffer[this.index(Math.floor(x), Math.floor(y))] = this.color(rgba);
  }

  // output a PNG string, Base64 encoded
  getBase64() {
    return Buffer.concat([BUF.PNG_HEAD, this.getDump()]).toString('base64');
  }

  // output a PNG buffer
  getBuffer() {
    return Buffer.concat([BUF.PNG_HEAD, this.getDump()]);
  }

  // get PNG buffer
  getDump() {
    // compute adler32 of output pixels + row filter bytes
    const BASE = 65521; /* largest prime smaller than 65536 */
    const NMAX = 5552;  /* NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1 */

    let s1 = 1;
    let s2 = 0;
    let n = NMAX;

    for (let y = 0; y < this.height; y++) {
      for (let x = -1; x < this.width; x++) {
        s1 += this.buffer[this.index(x, y)];
        s2 += s1;
        if ((n -= 1) == 0) {
          s1 %= BASE;
          s2 %= BASE;
          n = NMAX;
        }
      }
    }
    s1 %= BASE;
    s2 %= BASE;
    write(this.buffer, this.idat_offs + this.idat_size - 8, utils.byte4((s2 << 16) | s1));

    // compute crc32 of the PNG chunks
    crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
    crc32(this.buffer, this.plte_offs, this.plte_size);
    crc32(this.buffer, this.trns_offs, this.trns_size);
    crc32(this.buffer, this.idat_offs, this.idat_size);
    crc32(this.buffer, this.iend_offs, this.iend_size);

    return this.buffer;
  }
}

// helper functions for that ctx
function write(buf, offs) {
  let args = Array.prototype.slice.apply(arguments).slice(2);
  Buffer.concat(args).copy(buf, offs);
}

function crc32(buf2, offs, size) {
  let crc = -1;
  for (let i = 4; i < size - 4; i += 1) {
    crc = CRC_TABLE[(crc ^ buf2[offs+i]) & 0xff] ^ ((crc >> 8) & 0x00ffffff);
  }
  write(buf2, offs + size - 4, utils.byte4(crc ^ -1));
}

module.exports = PNGlib;
