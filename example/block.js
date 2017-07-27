'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(100, 100);

for (let i = 0; i < 65; i++) {
  for (let j = 10; j < 65; j++) {
    png.setPixel(i + 10, j + 20, '#cc0044');
    png.setPixel(i + 20, j + 10, '#0044cc');
    png.setPixel(i + 30, j, '#00cc44');
  }
}

fs.writeFileSync(path.resolve(__dirname, './block.png'), png.getBuffer());
