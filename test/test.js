'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');
const should = require('should');

const PNG = {};

describe('PNGlib', () => {
  before(() => {
    PNG.LINE = fs.readFileSync(path.join(__dirname, '../example/line.png'));
    PNG.BLOCK = fs.readFileSync(path.join(__dirname, '../example/block.png'));
    PNG.WAVE = fs.readFileSync(path.join(__dirname, '../example/wave.png'));
    PNG.OUT_RANGE = fs.readFileSync(path.join(__dirname, '../example/out_range.png'));
    PNG.LARGE_300 = fs.readFileSync(path.join(__dirname, '../example/large_300.png'));
    PNG.LARGE_256x257 = fs.readFileSync(path.join(__dirname, '../example/large_256x257.png'));
  })

  describe('.setPixel', () => {
    it('should create a red 1 pix PNG.', () => {
      let png = new PNGlib(1, 1);
      png.buffer[png.index(0, 0)] = png.color([255, 0, 0, 255]);
      should.equal(png.getBase64(),
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGFBMVEUAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAXHRiAAAACHRSTlMA/wAAAAAAACXRGJEAAAANSURBVHjaAQIA/f8AAQADAAL2gI4NAAAAAElFTkSuQmCC');
    });
  });

  describe('#draw.', () => {
    it('should draw a line', () => {
      let png = new PNGlib(100, 40);
      let lineIndex = png.index(0, 20);
      for (let i = 0; i < 100; i++) {
        png.buffer[lineIndex + i] = png.color('blue');
      }
      should.deepEqual(png.getBuffer(), PNG.LINE);
    });

    it('should draw a block.', () => {
      let png = new PNGlib(100, 100);
      for (let i = 0; i < 65; i++) {
        for (let j = 10; j < 65; j++) {
          png.setPixel(i + 10, j + 20, '#cc0044');
          png.setPixel(i + 20, j + 10, '#0044cc');
          png.setPixel(i + 30, j, '#00cc44');
        }
      }
      should.deepEqual(png.getBuffer(), PNG.BLOCK);
    });

    it('should draw waves.', () => {
      let png = new PNGlib(100, 40);

      for (let i = 0, num = 100 / 10; i <= num; i += .01) {

        let x = i * 10;
        // Math.sin(i) range [-1, 1] ====> 0 <= y <= 50
        let y = Math.sin(i) * 10 + 20;

        // use a color triad of Microsofts million dollar color
        png.setPixel(x, (y - 10), '#0000FF');
        png.setPixel(x, (y), '#FF0000');
        png.setPixel(x, (y + 10), 'rgb(0,255,0)');
      }
      should.deepEqual(png.getBuffer(), PNG.WAVE);
    });

    it('should draw waves which out of range.', () => {
      let png = new PNGlib(100, 40);

      for (let i = 0, num = 100 / 10; i <= num; i += .01) {

        let x = i * 10;
        // Math.sin(i) range [-1, 1] ====> 0 <= y <= 100
        let y = Math.sin(i) * 25 + 10;

        png.setPixel(x, (y - 10), 'blue');
        png.setPixel(x, (y + 20), '#f0f');
        png.setPixel(x, (y + 40), 'rgba(0,255,0)');
      }

      should.deepEqual(png.getBuffer(), PNG.OUT_RANGE);
    });

    it('should generate a complete 300x300 image (multi-block regression test, issue #11).', () => {
      let png = new PNGlib(300, 300, undefined, 'red');
      for (let y = 0; y < 300; y++) {
        for (let x = 0; x < 300; x++) {
          png.setPixel(x, y, 'blue');
        }
      }
      let buf = png.getBuffer();
      should.deepEqual(buf, PNG.LARGE_300);
      // Verify PNG header dimensions
      should.equal(buf.readUInt32BE(16), 300); // width
      should.equal(buf.readUInt32BE(20), 300); // height
    });

    it('should generate a complete 256x257 image (multi-block edge case).', () => {
      let png = new PNGlib(256, 257, undefined, 'red');
      for (let y = 0; y < 257; y++) {
        for (let x = 0; x < 256; x++) {
          png.setPixel(x, y, 'blue');
        }
      }
      let buf = png.getBuffer();
      should.deepEqual(buf, PNG.LARGE_256x257);
      should.equal(buf.readUInt32BE(16), 256);
      should.equal(buf.readUInt32BE(20), 257);
    });

    describe('deflate stream integrity', () => {
      const zlib = require('zlib');

      function extractIDAT(buf) {
        let off = 8, chunks = [];
        while (off < buf.length) {
          let len = buf.readUInt32BE(off);
          if (buf.slice(off+4, off+8).toString() === 'IDAT')
            chunks.push(buf.slice(off+8, off+8+len));
          off += 12 + len;
        }
        return Buffer.concat(chunks);
      }

      function testDeflate(w, h) {
        let png = new PNGlib(w, h, undefined, 'white');
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++)
            png.setPixel(x, y, 'black');
        let idat = extractIDAT(png.getBuffer());
        return zlib.inflateSync(idat);
      }

      // Boundary: exactly 1 block
      it('should decompress 254×257 (pix_size = 65535, single block boundary).', () => {
        let out = testDeflate(254, 257);
        should.equal(out.length, 257 * (254 + 1));
      });

      // Boundary: just under 1 block
      it('should decompress 255×255 (pix_size < 65535).', () => {
        let out = testDeflate(255, 255);
        should.equal(out.length, 255 * (255 + 1));
      });

      // Boundary: exactly 1 block (different dims)
      it('should decompress 256×255 (pix_size = 65535).', () => {
        let out = testDeflate(256, 255);
        should.equal(out.length, 255 * (256 + 1));
      });

      // Boundary: 2 blocks
      it('should decompress 256×256 (pix_size = 65792, 2 blocks).', () => {
        let out = testDeflate(256, 256);
        should.equal(out.length, 256 * (256 + 1));
      });

      // Medium
      it('should decompress 300×300 (2 blocks).', () => {
        let out = testDeflate(300, 300);
        should.equal(out.length, 300 * (300 + 1));
      });

      // 3 blocks
      it('should decompress 400×400 (3 blocks).', () => {
        let out = testDeflate(400, 400);
        should.equal(out.length, 400 * (400 + 1));
      });

      // Many blocks
      it('should decompress 1000×1000 (16 blocks).', () => {
        let out = testDeflate(1000, 1000);
        should.equal(out.length, 1000 * (1000 + 1));
      });

      // Odd dimensions
      it('should decompress 333×777 (odd/prime).', () => {
        let out = testDeflate(333, 777);
        should.equal(out.length, 777 * (333 + 1));
      });
    });
  });
});
