'use strict';

var pnglib = require('pnglib');
var pnglibes6 = require('pnglib-es6').default;
var npnglib = require('..');

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

suite
  .add('pnglib', function() {
    var p = new pnglib(150, 50, 8);
    var lineIndex = p.index(0, 25);
    p.color(0, 0, 0, 0);  // background
    for (let i = 0; i < 75; i++)
      p.buffer[lineIndex + i]= p.color(255, 0, 255, 255); // Second color: paint (red, green, blue, alpha)

    // p.getBuffer();
    p.getDump();
  })
  .add('pnglib-es6', function() {
    const image = new pnglibes6(150, 50, 8);

    var lineIndex = image.index(0, 25);
    for (let i = 0; i < 75; i++)
      image.buffer[lineIndex + i]= image.createColor('#FF00FF'); // Second color: paint (red, green, blue, alpha)

    image.deflate();
    new Buffer(image.buffer.buffer);
  })
  .add('node-pnglib', function() {
    let png = new npnglib(150, 50);
    let lineIndex = png.index(0, 25);
    for (let i = 0; i < 75; i++) {
      png.buffer[lineIndex + i] = png.color('#F0F');
    }

    png.getBuffer();
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });

/*
node v8.1.1

pnglib x 1,021 ops/sec ±3.37% (76 runs sampled)
pnglib-es6 x 3,293 ops/sec ±4.79% (79 runs sampled)
node-pnglib x 17,027 ops/sec ±0.93% (87 runs sampled)
Fastest is node-pnglib

node v4.4.0

pnglib x 1,416 ops/sec ±5.59% (69 runs sampled)
pnglib-es6 x 3,277 ops/sec ±1.62% (84 runs sampled)
node-pnglib x 7,476 ops/sec ±2.49% (73 runs sampled)
Fastest is node-pnglib
*/
