'use strict';

const fs = require('fs');
const pnglib = require('pnglib');

module.exports = () => {
  var p = new pnglib(150, 50, 8);
  var lineIndex = p.index(0, 25);
  p.color(0, 0, 0, 0);  // background
  for (let i = 0; i < 75; i++)
    p.buffer[lineIndex + i]= p.color(255, 0, 255, 255); // Second color: paint (red, green, blue, alpha)

  // p.getBuffer();
  // p.getDump();
};
