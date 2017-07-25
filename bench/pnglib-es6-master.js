'use strict';

const fs = require('fs');
const PNGImage = require('pnglib-es6').default;

module.exports = () => {
  const image = new PNGImage(150, 50, 8);

  var lineIndex = image.index(0, 25);
  for (let i = 0; i < 75; i++)
    image.buffer[lineIndex + i]= image.createColor('#FF00FF'); // Second color: paint (red, green, blue, alpha)

  // image.deflate();
  // Buffer.from(image.buffer.buffer);
};
