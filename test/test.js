'use strict';

const PNGlib = require('..');
const should = require('should');

describe('PNGlib', () => {
  describe('#setPixel', () => {
    it('should create a red 1 pix PNG', () => {
      let png = new PNGlib(1, 1);
      png.buffer[png.index(0, 0)] = png.color(255, 0, 0, 255);
      should.equal(png.getBase64(),
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGFBMVEUAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAXHRiAAAACHRSTlMA/wAAAAAAACXRGJEAAAANSURBVHjaAQIA/f8AAQADAAL2gI4NAAAAAElFTkSuQmCC');
    });
  });
});
