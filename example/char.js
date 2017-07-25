'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(200, 200);

for (let i = 0; i < 10; ++i) {
  const font = PNGlib.font8x16;
  let ch = String(i);
  console.log(ch);
  png.drawChar(ch, 0 + 2 * i * font.w, 100, font, '#00FF00');
}

fs.writeFileSync(path.resolve(__dirname, './char.png'), png.getBuffer());
