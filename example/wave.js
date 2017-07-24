const fs = require('fs');
const PNGlib = require('..');

var p = new PNGlib(200, 150, 8); // construcor takes height, weight and color-depth

for (var i = 0, num = 200 / 10; i <= num; i += .01) {

  var x = i * 10;
  var y = Math.sin(i) * Math.sin(i) * 50 + 50;

  // use a color triad of Microsofts million dollar color
  p.setPixel(x, (y - 10), 'green');
  p.setPixel(x, (y), '#FF00FF');
  p.setPixel(x, (y + 10), 'rgb(255,0,0)');
}

fs.writeFileSync('./wave.png', p.getBuffer())
