'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

// width 100, height 40
let png = new PNGlib(100, 40);

// from (0, 20)
let lineIndex = png.index(0, 20);
for (let i = 0; i < 100; i++) {
  // draw a line to (0, 75)
  png.buffer[lineIndex + i] = png.color('blue');
}

fs.writeFileSync(path.resolve(__dirname, './line.png'), png.getBuffer());
