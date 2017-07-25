'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

// width 150, height 50
let png = new PNGlib(150, 50);

// from (0, 25)
let lineIndex = png.index(0, 25);
for (let i = 0; i < 75; i++) {
  // draw a line to (0, 75)
  png.buffer[lineIndex + i] = png.color('blue'); // paint (red, green, blue, alpha)
}

fs.writeFileSync(path.resolve(__dirname, './line.png'), png.getBuffer());
