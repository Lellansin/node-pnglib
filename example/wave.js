'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(100, 40);

for (let i = 0, num = 100 / 10; i <= num; i += .01) {

  let x = i * 10;
  // Math.sin(i) range [-1, 1] ====> 0 <= y <= 50
  let y = Math.sin(i) * 10 + 20;

  // use a color triad of Microsofts million dollar color
  png.setPixel(x, (y - 10), '#0000FF');
  png.setPixel(x, (y), '#FF0000');
  png.setPixel(x, (y + 10), 'rgb(0,255,0)');
}

fs.writeFileSync(path.resolve(__dirname, './wave.png'), png.getBuffer());
