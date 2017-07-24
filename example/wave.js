const fs = require('fs');
const PNGlib = require('..');

var p = new PNGlib(200, 200, 256); // construcor takes height, weight and color-depth

for (var i = 0, num = 200 / 10; i <= num; i+=.01) {

  var x = i * 10;
  var y = Math.sin(i) * Math.sin(i) * 50 + 50;

  // use a color triad of Microsofts million dollar color
  p.setPixel(x, (y - 10), [0x00, 0x44, 0xcc]);
  p.setPixel(x, (y), [0xcc, 0x00, 0x44]);
  p.setPixel(x, (y + 10), [0x00, 0xcc, 0x44]);
}

fs.writeFileSync('./wave.png', p.getBuffer())
