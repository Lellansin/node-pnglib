'use strict';

var Lastest = require('node-pnglib-master');
var Newest = require('..')
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

// add tests
suite
  .add('PNGlib#Lastest', function() {
    let png = new Lastest(200, 150);

    for (let i = 0, num = 200 / 10; i <= num; i += .01) {

      let x = i * 10;
      let y = Math.sin(i) * Math.sin(i) * 50 + 50;

      // use a color triad of Microsofts million dollar color
      png.setPixel(x, (y - 10), 'green');
      png.setPixel(x, (y), '#FF00FF');
      png.setPixel(x, (y + 10), 'rgb(255,0,0)');
    }
  })
  .add('PNGlib#Newest', function() {
    let png = new Newest(200, 150);

    for (let i = 0, num = 200 / 10; i <= num; i += .01) {

      let x = i * 10;
      let y = Math.sin(i) * Math.sin(i) * 50 + 50;

      // use a color triad of Microsofts million dollar color
      png.setPixel(x, (y - 10), 'green');
      png.setPixel(x, (y), '#FF00FF');
      png.setPixel(x, (y + 10), 'rgb(255,0,0)');
    }
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': true });


