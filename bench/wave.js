'use strict';

var pnglib = require('pnglib');
var pnglibes6 = require('pnglib-es6').default;
var npnglib = require('..');

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

suite
  .add('pnglib-es6', function() {
    const image = new pnglibes6(200, 150, 8);
    for (let i = 0, num = 200 / 10; i <= num; i += .01) {
      let x = i * 10;
      let y = Math.sin(i) * 25 + 25;
      image.setPixel(x, y, '#FF00FF');
    }
    image.deflate();
    new Buffer(image.buffer.buffer);
  })
  .add('node-pnglib', function() {
    let png = new npnglib(200, 150);
    for (let i = 0, num = 200 / 10; i <= num; i += .01) {
      let x = i * 10;
      let y = Math.sin(i) * 25 + 25;
      png.setPixel(x, y, '#FF00FF');
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

pnglib-es6 x 483 ops/sec ±7.88% (67 runs sampled)
node-pnglib x 660 ops/sec ±1.51% (86 runs sampled)
Fastest is node-pnglib
*/
