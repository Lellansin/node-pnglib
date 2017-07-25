'use strict';

var current = require('..');

module.exports = () => {
  let png = new current(150, 50);
  let lineIndex = png.index(0, 25);
  for (let i = 0; i < 75; i++) {
    png.buffer[lineIndex + i] = png.color('#F0F');
  }

  png.getBuffer();
};
