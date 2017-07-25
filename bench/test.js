'use strict';

var pnglib = require('./pnglib-master');
var pnglibes6 = require('./pnglib-es6-master');
var npnglib = require('./node-pnglib-current');;

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

suite
  .add('pnglib', function() {
    pnglib();
  })
  .add('pnglib-es6', function() {
    pnglibes6();
  })
  .add('node-pnglib', function() {
    npnglib();
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

pnglib x 1,090 ops/sec ±2.04% (84 runs sampled)
pnglib-es6 x 3,726 ops/sec ±1.54% (84 runs sampled)
node-pnglib x 8,514 ops/sec ±1.01% (84 runs sampled)
Fastest is node-pnglib

node v4.4.0

pnglib x 1,229 ops/sec ±5.92% (69 runs sampled)
pnglib-es6 x 3,043 ops/sec ±4.31% (72 runs sampled)
node-pnglib x 5,625 ops/sec ±1.94% (81 runs sampled)
Fastest is node-pnglib
*/
