const fs = require('fs');
const PNGlib = require('..');

let png = new PNGlib(150, 50);

let lineIndex = png.index(0, 25);
for (let i = 0; i < 75; i++) {
  png.buffer[lineIndex + i] = png.color('blue'); // paint (red, green, blue, alpha)
}

fs.writeFileSync('line.png', png.getBuffer())
