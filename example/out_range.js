'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(100, 40);

for (let i = 0, num = 100 / 10; i <= num; i += .01) {

  let x = i * 10;
  // Math.sin(i) range [-1, 1] ====> 0 <= y <= 100
  let y = Math.sin(i) * 25 + 10;

  png.setPixel(x, (y - 10), 'blue');
  png.setPixel(x, (y + 20), '#f0f');
  png.setPixel(x, (y + 40), 'rgba(0,255,0)');
}

fs.writeFileSync(path.resolve(__dirname, './out_range.png'), png.getBuffer());
