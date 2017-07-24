const fs = require('fs');
const PNGlib = require('..');

var png = new PNGlib(110, 100, 256); // construcor takes height, weight and color-depth

for (var i = 0; i < 50; i++) {
  for (var j = 0; j < 50; j++) {
    png.setPixel(i + 20, j + 35, '#cc0044');
    png.setPixel(i + 30, j + 20, '#0044cc');
    png.setPixel(i + 40, j + 30, '#00cc44');
  }
}

fs.writeFileSync('./block.png', png.getBuffer())
