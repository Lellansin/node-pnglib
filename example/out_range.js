'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(200, 150);

for (let i = 0, num = 200 / 10; i <= num; i += .01) {

  let x = i * 10;
  // Math.sin(i) range [-1, 1] ====> 0 <= y <= 100
  let y = Math.sin(i) * 50 + 50;

  png.setPixel(x, (y - 20), 'blue');
  png.setPixel(x, (y + 30), '#f0f');
  png.setPixel(x, (y + 80), 'rgba(0,255,0)');
}

fs.writeFileSync(path.resolve(__dirname, './out_range.png'), png.getBuffer());
