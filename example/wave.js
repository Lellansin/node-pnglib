'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(200, 150);

for (let i = 0, num = 200 / 10; i <= num; i += .01) {

  let x = i * 10;
  // Math.sin(i) range [-1, 1] ====> 0 <= y <= 50
  let y = Math.sin(i) * 25 + 25;

  // use a color triad of Microsofts million dollar color
  png.setPixel(x, (y), '#FF00FF');
  png.setPixel(x, (y + 10), 'rgb(255,0,0)');
  // [red, green, blue, alpha] = [100, 200, 100, 100]
  png.setPixel(x, (y + 20), [100, 200, 100, 100])
}

fs.writeFileSync(path.resolve(__dirname, './wave.png'), png.getBuffer());
