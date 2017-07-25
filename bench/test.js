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


