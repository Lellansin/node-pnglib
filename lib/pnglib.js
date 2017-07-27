'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _buf = require('./buf');

var _buf2 = _interopRequireDefault(_buf);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _color2 = require('./color');

var _color = _interopRequireWildcard(_color2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function PNGlib(w, h, d, bg) {
    _classCallCheck(this, PNGlib);

    this.width = w;
    this.height = h;
    this.depth = d || 8;
    this.bgColor = bg;

    // pixel data and row filter identifier size
    this.pix_size = this.height * (this.width + 1);

    // deflate header, pix_size, block headers, adler32 checksum
    this.data_size = 2 + this.pix_size + 5 * ((0xfffe + this.pix_size) / 0xffff | 0) + 4;

    // offsets and sizes of Png chunks
    this.ihdr_offs = 0; // IHDR offset and size
    this.ihdr_size = 4 + 4 + 13 + 4;
    this.plte_offs = this.ihdr_offs + this.ihdr_size; // PLTE offset and size
    this.plte_size = 4 + 4 + 3 * this.depth + 4;
    this.trns_offs = this.plte_offs + this.plte_size; // tRNS offset and size
    this.trns_size = 4 + 4 + this.depth + 4;
    this.idat_offs = this.trns_offs + this.trns_size; // IDAT offset and size
    this.idat_size = 4 + 4 + this.data_size + 4;
    this.iend_offs = this.idat_offs + this.idat_size; // IEND offset and size
    this.iend_size = 4 + 4 + 4;
    this.buffer_size = this.iend_offs + this.iend_size; // total PNG size

    this.raw = _buf2.default.alloc(_buf2.default.PNG_HEAD.length + this.buffer_size);
    this.buffer = _buf2.default.view(this.raw, _buf2.default.PNG_HEAD.length, this.buffer_size);
    this.palette = new Map();
    this.pindex = 0;

    // initialize non-zero elements
    _utils2.default.write4(this.buffer, this.ihdr_offs, this.ihdr_size - 12);
    _utils2.default.writeb(this.buffer, this.ihdr_offs + 4, _buf2.default.PNG_IHDR);
    _utils2.default.write4(this.buffer, this.ihdr_offs + 4 * 2, this.width);
    _utils2.default.write4(this.buffer, this.ihdr_offs + 4 * 3, this.height);
    _utils2.default.writeb(this.buffer, this.ihdr_offs + 4 * 4, _buf2.default.CODE_X08X03);

    _utils2.default.write4(this.buffer, this.plte_offs, this.plte_size - 12);
    _utils2.default.writeb(this.buffer, this.plte_offs + 4, _buf2.default.PNG_PLTE);

    _utils2.default.write4(this.buffer, this.trns_offs, this.trns_size - 12);
    _utils2.default.writeb(this.buffer, this.trns_offs + 4, _buf2.default.PNG_tRNS);

    _utils2.default.write4(this.buffer, this.idat_offs, this.idat_size - 12);
    _utils2.default.writeb(this.buffer, this.idat_offs + 4, _buf2.default.PNG_IDAT);

    _utils2.default.write4(this.buffer, this.iend_offs, this.iend_size - 12);
    _utils2.default.writeb(this.buffer, this.iend_offs + 4, _buf2.default.PNG_IEND);

    // initialize png file header
    _utils2.default.writeb(this.raw, 0, _buf2.default.PNG_HEAD);

    // initialize deflate header
    _utils2.default.write2(this.buffer, this.idat_offs + 8, _buf2.default.PNG_DEFLATE_HEADER);

    // initialize deflate block headers
    for (var i = 0; (i << 16) - 1 < this.pix_size; ++i) {
      var size = void 0,
          bits = void 0;
      if (i + 0xffff < this.pix_size) {
        size = 0xffff;
        bits = _buf2.default.CODE_NUL;
      } else {
        size = this.pix_size - (i << 16) - i;
        bits = _buf2.default.CODE_SOH;
      }
      var offs = this.idat_offs + 8 + 2 + (i << 16) + (i << 2);
      offs = _utils2.default.writeb(this.buffer, offs, bits);
      offs = _utils2.default.write2lsb(this.buffer, offs, size);
      _utils2.default.write2lsb(this.buffer, offs, ~size);
    }

    if (this.bgColor) this.setBgColor(this.bgColor);else this.setBgColor([0, 0, 0, 0]);
  }

  // compute the index into a png for a given pixel


  _createClass(PNGlib, [{
    key: 'index',
    value: function index(x, y) {
      var i = y * (this.width + 1) + x + 1;
      var offset = this.idat_offs + 8 + 2 + 5;
      return offset * (i / 0xffff | 0 + 1) + i;
    }

    // convert a color and build up the palette

  }, {
    key: 'color',
    value: function color(args) {
      var rgba = _color.getRGBA(args);
      if (!this.palette.has(rgba)) {
        return _color.addColor(this, rgba);
      }
      return this.palette.get(rgba);
    }
  }, {
    key: 'setBgColor',
    value: function setBgColor(args) {
      var rgba = _color.getRGBA(args);
      return _color.setBgColor(this, rgba);
    }
  }, {
    key: 'setPixel',
    value: function setPixel(x, y, rgba) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
      this.buffer[this.index(x | 0, y | 0)] = this.color(rgba);
    }

    // output a PNG string, Base64 encoded

  }, {
    key: 'getBase64',
    value: function getBase64() {
      return this.deflate().toString('base64');
    }

    // output a PNG buffer

  }, {
    key: 'getBuffer',
    value: function getBuffer() {
      return this.deflate();
    }

    // get PNG buffer

  }, {
    key: 'deflate',
    value: function deflate() {
      // compute adler32 of output pixels + row filter bytes
      var BASE = 65521; /* largest prime smaller than 65536 */
      var NMAX = 5552; /* NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1 */

      var s1 = 1;
      var s2 = 0;
      var n = NMAX;

      var index = this.index(-1, 0);
      var count = this.height * (this.width + 1);
      for (var i = 0; i < count; ++i) {
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
      var offset = this.idat_offs + this.idat_size - 8;
      _utils2.default.write4(this.buffer, offset, s2 << 16 | s1);

      // compute crc32 of the PNG chunks
      _utils2.default.crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
      _utils2.default.crc32(this.buffer, this.plte_offs, this.plte_size);
      _utils2.default.crc32(this.buffer, this.trns_offs, this.trns_size);
      _utils2.default.crc32(this.buffer, this.idat_offs, this.idat_size);
      _utils2.default.crc32(this.buffer, this.iend_offs, this.iend_size);

      if (Buffer.isBuffer(this.raw)) return this.raw;else return new Buffer(this.raw);
    }
  }]);

  return PNGlib;
}();