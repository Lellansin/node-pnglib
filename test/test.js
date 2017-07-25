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
  })

  describe('.setPixel', () => {
    it('should create a red 1 pix PNG.', () => {
      let png = new PNGlib(1, 1);
      png.buffer[png.index(0, 0)] = png.color(255, 0, 0, 255);
      should.equal(png.getBase64(),
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGFBMVEUAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAXHRiAAAACHRSTlMA/wAAAAAAACXRGJEAAAANSURBVHjaAQIA/f8AAQADAAL2gI4NAAAAAElFTkSuQmCC');
    });
  });

  describe('#draw.', () => {
    it('should draw a line', () => {
      let png = new PNGlib(150, 50);
      let lineIndex = png.index(0, 25);
      for (let i = 0; i < 75; i++) {
        png.buffer[lineIndex + i] = png.color('blue');
      }
      should.deepEqual(png.getBuffer(), PNG.LINE);
    });

    it('should draw a block.', () => {
      let png = new PNGlib(200, 200);
      for (let i = 30; i < 120; i++) {
        for (let j = 30; j < 120; j++) {
          png.setPixel(i + 20, j + 35, '#cc0044');
          png.setPixel(i + 30, j + 20, '#0044cc');
          png.setPixel(i + 40, j + 30, '#00cc44');
        }
      }
      should.deepEqual(png.getBuffer(), PNG.BLOCK);
    });

    it('should draw waves.', () => {
      let png = new PNGlib(200, 150);
      for (let i = 0, num = 200 / 10; i <= num; i += .01) {

        let x = i * 10;
        let y = Math.sin(i) * Math.sin(i) * 50 + 50;

        // use a color triad of Microsofts million dollar color
        png.setPixel(x, (y - 10), 'green');
        png.setPixel(x, (y), '#FF00FF');
        png.setPixel(x, (y + 10), 'rgb(255,0,0)');
      }
      should.deepEqual(png.getBuffer(), PNG.WAVE);
    });

    it('should draw waves which out of range.', () => {
      let png = new PNGlib(200, 150);
      for (let i = 0, num = 200 / 10; i <= num; i += .01) {

        let x = i * 10;

        let y = Math.sin(i) * 50 + 50;

        png.setPixel(x, (y - 20), 'blue');
        png.setPixel(x, (y + 30), '#f0f');
        png.setPixel(x, (y + 80), 'rgba(0,255,0)');
      }
      should.deepEqual(png.getBuffer(), PNG.OUT_RANGE);
    });
  });
});
