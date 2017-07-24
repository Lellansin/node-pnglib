'use strict';

const fs = require('fs');
const PNGlib = require('..');

let png = new PNGlib(200, 200);

for (let i = 30; i < 120; i++) {
  for (let j = 30; j < 120; j++) {
    png.setPixel(i + 20, j + 35, '#cc0044');
    png.setPixel(i + 30, j + 20, '#0044cc');
    png.setPixel(i + 40, j + 30, '#00cc44');
  }
}

fs.writeFileSync('./block.png', png.getBuffer());
