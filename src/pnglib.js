'use strict';

import BUF from './buf';
import RGBA from './rgba';
import * from './utils';
import font from './font';

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

    this.raw = BUF.alloc(BUF.PNG_HEAD.length + this.buffer_size);
    this.buffer = BUF.view(this.raw, BUF.PNG_HEAD.length, this.buffer_size);
    this.palette = new Map();
    this.pindex  = 0;

    // initialize non-zero elements
    write4(this.buffer, this.ihdr_offs, this.ihdr_size - 12);
    writeb(this.buffer, this.ihdr_offs + 4, BUF.PNG_IHDR);
    write4(this.buffer, this.ihdr_offs + 4*2, this.width);
    write4(this.buffer, this.ihdr_offs + 4*3, this.height);
    writeb(this.buffer, this.ihdr_offs + 4*4, BUF.CODE_X08X03);

    write4(this.buffer, this.plte_offs, this.plte_size - 12);
    writeb(this.buffer, this.plte_offs + 4, BUF.PNG_PLTE);

    write4(this.buffer, this.trns_offs, this.trns_size - 12);
    writeb(this.buffer, this.trns_offs + 4, BUF.PNG_tRNS);
 
    write4(this.buffer, this.idat_offs, this.idat_size - 12);
    writeb(this.buffer, this.idat_offs + 4, BUF.PNG_IDAT);

    write4(this.buffer, this.iend_offs, this.iend_size - 12);
    writeb(this.buffer, this.iend_offs + 4, BUF.PNG_IEND);

    // initialize png file header
    writeb(this.raw, 0, BUF.PNG_HEAD);

    // initialize deflate header
    write2(this.buffer, this.idat_offs + 8, BUF.PNG_DEFLATE_HEADER);

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
      offs = writeb(this.buffer, offs, bits);
      offs = write2lsb(this.buffer, offs, size);
      write2lsb(this.buffer, offs, ~size);
    }

    if (this.bg) this.color(this.bg);
    else this.color(0, 0, 0, 0);
  }

  // compute the index into a png for a given pixel
  index(x, y) {
    let i = y * (this.width + 1) + x + 1;
    let offset = this.idat_offs + 8 + 2 + 5;
    return offset * Math.floor(i / 0xffff + 1) + i;
  }

  // convert a color and build up the palette
  color(red, green, blue, alpha) {
    if (typeof red == 'string') {
      let rgba = RGBA(red);
      if (!rgba) throw new Error(`invalid color ${rgba}`);
      [red, green, blue, alpha] = rgba;
    } else {
      alpha = alpha >= 0 ? alpha : 255;
    }

    const color = (((((alpha << 8) | red) << 8) | green) << 8) | blue;

    if (!this.palette.has(color)) {
      if (this.pindex == this.depth) {
        console.warn('node-pnglib: depth is not enough, set up it for more');
        return BUF.CODE_NUL;
      }

      let ndx = this.plte_offs + 8 + 3 * this.pindex;
      this.buffer[ndx++] = red;
      this.buffer[ndx++] = green;
      this.buffer[ndx++] = blue;
      this.buffer[this.trns_offs + 8 + this.pindex] = alpha;
      this.palette.set(color, this.pindex++);
    }
    return this.palette.get(color);
  }

  drawChar(ch, x = 0, y = 0, font = font.font8x16, color = '#ff0000') {
    let idx = font.fonts.indexOf(ch);

    if (idx >= 0) {
      let fontData = font.data[idx];
      let w = font.w;
      let y0 = y;
      let l = Math.ceil(w / 8);

      for (let i = 0, len = font.h; i < len; ++i) {
        let prevByteStr = hexToBin(fontData[l * i]);
        let nextByteStr = hexToBin(fontData[l * i + 1]);
        let line = (prevByteStr + nextByteStr).substr(0, w);

        for (let ci = 0, lineLen = line.length; ci < lineLen; ++ci) {
          if (line[ci] === '1') {
            this.setPixel(x + ci, y0, color); 
          }
        }
        ++y0;
      }
    }
  }

  setPixel(x, y, rgba) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.buffer[this.index(Math.floor(x), Math.floor(y))] = this.color(rgba);
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
    
    for (let y = 0; y < this.height; ++y) {
      for (let x = -1; x < this.width; ++x) {
        s1 += this.buffer[this.index(x, y)];
        s2 += s1;
        if ((n -= 1) === 0) {
          s1 %= BASE;
          s2 %= BASE;
          n = NMAX;
        }
      }
    }
    s1 %= BASE;
    s2 %= BASE;
    let offset = this.idat_offs + this.idat_size - 8;
    write4(this.buffer, offset, (s2 << 16) | s1);

    // compute crc32 of the PNG chunks
    crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
    crc32(this.buffer, this.plte_offs, this.plte_size);
    crc32(this.buffer, this.trns_offs, this.trns_size);
    crc32(this.buffer, this.idat_offs, this.idat_size);
    crc32(this.buffer, this.iend_offs, this.iend_size);

    if (Buffer.isBuffer(this.raw)) return this.raw;
    else return new Buffer(this.raw);
  }
}

module.exports = PNGlib;
module.exports.font8x16 = font.font8x16;
module.exports.font12x24 = font.font12x24;
module.exports.font16x32 = font.font16x32;
