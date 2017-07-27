'use strict';

import BUF from './buf';
import utils from './utils';
import * as color from './color';

module.exports = class PNGlib {
  constructor (w, h, d, bg) {
    this.width   = w;
    this.height  = h;
    this.depth   = d || 8;
    this.bgColor = bg;

    // pixel data and row filter identifier size
    this.pix_size = this.height * (this.width + 1);

    // deflate header, pix_size, block headers, adler32 checksum
    this.data_size = 2 + this.pix_size + 5 * (((0xfffe + this.pix_size) / 0xffff) | 0) + 4;

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

    this.raw = BUF.alloc(BUF.PNG_HEAD.length + this.buffer_size);
    this.buffer = BUF.view(this.raw, BUF.PNG_HEAD.length, this.buffer_size);
    this.palette = new Map();
    this.pindex  = 0;

    // initialize non-zero elements
    utils.write4(this.buffer, this.ihdr_offs, this.ihdr_size - 12);
    utils.writeb(this.buffer, this.ihdr_offs + 4, BUF.PNG_IHDR);
    utils.write4(this.buffer, this.ihdr_offs + 4*2, this.width);
    utils.write4(this.buffer, this.ihdr_offs + 4*3, this.height);
    utils.writeb(this.buffer, this.ihdr_offs + 4*4, BUF.CODE_X08X03);

    utils.write4(this.buffer, this.plte_offs, this.plte_size - 12);
    utils.writeb(this.buffer, this.plte_offs + 4, BUF.PNG_PLTE);

    utils.write4(this.buffer, this.trns_offs, this.trns_size - 12);
    utils.writeb(this.buffer, this.trns_offs + 4, BUF.PNG_tRNS);
 
    utils.write4(this.buffer, this.idat_offs, this.idat_size - 12);
    utils.writeb(this.buffer, this.idat_offs + 4, BUF.PNG_IDAT);

    utils.write4(this.buffer, this.iend_offs, this.iend_size - 12);
    utils.writeb(this.buffer, this.iend_offs + 4, BUF.PNG_IEND);

    // initialize png file header
    utils.writeb(this.raw, 0, BUF.PNG_HEAD);

    // initialize deflate header
    utils.write2(this.buffer, this.idat_offs + 8, BUF.PNG_DEFLATE_HEADER);

    // initialize deflate block headers
    for (let i = 0; (i << 16) - 1 < this.pix_size; ++i) {
      let size, bits;
      if (i + 0xffff < this.pix_size) {
        size = 0xffff;
        bits = BUF.CODE_NUL;
      } else {
        size = this.pix_size - (i << 16) - i;
        bits = BUF.CODE_SOH;
      }
      let offs = this.idat_offs + 8 + 2 + (i << 16) + (i << 2);
      offs = utils.writeb(this.buffer, offs, bits);
      offs = utils.write2lsb(this.buffer, offs, size);
      utils.write2lsb(this.buffer, offs, ~size);
    }

    if (this.bgColor) this.setBgColor(this.bgColor);
    else this.setBgColor([0, 0, 0, 0]);
  }

  // compute the index into a png for a given pixel
  index(x, y) {
    let i = y * (this.width + 1) + x + 1;
    let offset = this.idat_offs + 8 + 2 + 5;
    return offset * ((i / 0xffff) | 0 + 1) + i;
  }

  // convert a color and build up the palette
  color(args) {
    const rgba = color.getRGBA(args);
    if (!this.palette.has(rgba)) {
      return color.addColor(this, rgba);
    }
    return this.palette.get(rgba);
  }

  setBgColor(args) {
    const rgba = color.getRGBA(args);
    return color.setBgColor(this, rgba);
  }

  setPixel(x, y, rgba) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.buffer[this.index(x | 0, y | 0)] = this.color(rgba);
  }

  // output a PNG string, Base64 encoded
  getBase64() {
    return this.deflate().toString('base64');
  }

  // output a PNG buffer
  getBuffer() {
    return this.deflate();
  }

  // get PNG buffer
  deflate() {
    // compute adler32 of output pixels + row filter bytes
    const BASE = 65521; /* largest prime smaller than 65536 */
    const NMAX = 5552;  /* NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1 */

    let s1 = 1;
    let s2 = 0;
    let n = NMAX;
    
    let index = this.index(-1, 0);
    let count = this.height * (this.width + 1);
    for (let i = 0; i < count; ++i) {
      s1 += this.buffer[index++];
      s2 += s1;
      if ((n -= 1) === 0) {
        s1 %= BASE;
        s2 %= BASE;
        n = NMAX;
      }
    }
    s1 %= BASE;
    s2 %= BASE;
    let offset = this.idat_offs + this.idat_size - 8;
    utils.write4(this.buffer, offset, (s2 << 16) | s1);

    // compute crc32 of the PNG chunks
    utils.crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
    utils.crc32(this.buffer, this.plte_offs, this.plte_size);
    utils.crc32(this.buffer, this.trns_offs, this.trns_size);
    utils.crc32(this.buffer, this.idat_offs, this.idat_size);
    utils.crc32(this.buffer, this.iend_offs, this.iend_size);

    if (Buffer.isBuffer(this.raw)) return this.raw;
    else return new Buffer(this.raw);
  }
}
