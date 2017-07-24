const fs = require('fs');
const PNGlib = require('..');

let png = new PNGlib({ width:150, height:50 });

let lineIndex = png.index(0, 25);
for (let i = 0; i < 75; i++) {
  png.buffer[lineIndex + i] = png.color(23, 180, 44, 255); // paint (red, green, blue, alpha)
}

fs.writeFileSync('line.png', png.getBuffer())
