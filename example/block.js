const fs = require('fs');
const PNGlib = require('..');

var png = new PNGlib(110, 100, 256); // construcor takes height, weight and color-depth

for (var i = 0; i < 50; i++) {
  for (var j = 0; j < 50; j++) {
    png.setPixel(i + 20, j + 35, [0xcc, 0x00, 0x44]);
    png.setPixel(i + 30, j + 20, [0x00, 0x44, 0xcc]);
    png.setPixel(i + 40, j + 30, [0x00, 0xcc, 0x44]);
  }
}

fs.writeFileSync('./block.png', png.getBuffer())
