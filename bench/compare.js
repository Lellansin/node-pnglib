'use strict';

var PNGjs = require('pngjs').PNG;
var fastpng = require('fast-png');
var npnglib = require('..');
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var W = 150, H = 50;

suite
  .add('pngjs (RGBA)', function() {
    var p = new PNGjs({width: W, height: H});
    var off = (25 * W + 0) * 4;
    for (var i = 0; i < 75; i++) {
      var pos = off + i * 4;
      p.data[pos]     = 255; // R
      p.data[pos + 1] = 0;   // G
      p.data[pos + 2] = 255; // B
      p.data[pos + 3] = 255; // A
    }
    PNGjs.sync.write(p);
  })
  .add('fast-png (RGBA)', function() {
    var data = new Uint8Array(W * H * 4);
    var off = (25 * W + 0) * 4;
    for (var i = 0; i < 75; i++) {
      var pos = off + i * 4;
      data[pos]     = 255;
      data[pos + 1] = 0;
      data[pos + 2] = 255;
      data[pos + 3] = 255;
    }
    fastpng.encode({data: data, width: W, height: H});
  })
  .add('node-pnglib (indexed palette)', function() {
    var png = new npnglib(W, H);
    var lineIndex = png.index(0, 25);
    for (var i = 0; i < 75; i++) {
      png.buffer[lineIndex + i] = png.color('#F0F');
    }
    png.getBuffer();
  })
  // Include existing comparisons
  .add('pnglib (indexed palette)', function() {
    var p = new (require('pnglib'))(W, H, 8);
    var lineIndex = p.index(0, 25);
    p.color(0, 0, 0, 0);  // background
    for (var i = 0; i < 75; i++)
      p.buffer[lineIndex + i] = p.color(255, 0, 255, 255);
    p.getDump();
  })
  .add('pnglib-es6 (indexed palette)', function() {
    var image = new (require('pnglib-es6').default)(W, H, 8);
    var lineIndex = image.index(0, 25);
    for (var i = 0; i < 75; i++)
      image.buffer[lineIndex + i] = image.createColor('#FF00FF');
    image.deflate();
    new Buffer(image.buffer.buffer);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\nFastest is ' + this.filter('fastest').map('name'));
    console.log('');
    // Print relative speeds
    var fastest = this.filter('fastest');
    var fastestHZ = fastest.map('hz')[0];
    this.forEach(function(item) {
      var rel = (item.hz / fastestHZ * 100).toFixed(1);
      console.log(item.name + ': ' + rel + '% of fastest');
    });
  })
  .run({ 'async': true });
