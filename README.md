# node-pnglib [![NPM Version](https://badge.fury.io/js/node-pnglib.svg)](http://badge.fury.io/js/node-pnglib) [![Build Status](https://travis-ci.org/Lellansin/node-pnglib.png?branch=master)](https://travis-ci.org/Lellansin/node-pnglib) [![Coveralls Status](https://img.shields.io/coveralls/Lellansin/node-pnglib/master.svg)](https://coveralls.io/github/Lellansin/node-pnglib)

Pure Javascript lib for generate PNG, Node.js version for [PNGlib](http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/).

## Installation

```
npm install node-pnglib
```

## Example

**Test it with http server:**

```javascript
const http = require('http');
const PNGlib = require('node-pnglib');

http.createServer(function (req, res) {
  if(req.url == '/favicon.ico') return res.end('');

  // width 100, height 40
  let png = new PNGlib(100, 40);

  // from (0, 20)
  let lineIndex = png.index(0, 20);
  for (let i = 0; i < 100; i++) {
    // draw a line to (0, 75)
    png.buffer[lineIndex + i] = png.color('blue');
  }

  res.setHeader('Content-Type', 'image/png');
  res.end(png.getBuffer());
}).listen(3001);
```

Output:

![line](/example/line.png)

**Test with file:**

```javascript
const fs = require('fs');
const PNGlib = require('node-pnglib');

let png = new PNGlib(150, 150);
for (let i = 20; i < 100; i++) {
  for (let j = 20; j < 100; j++) {
    png.setPixel(i + 10, j + 25, '#cc0044');
    png.setPixel(i + 20, j + 10, '#0044cc');
    png.setPixel(i + 30, j, '#00cc44');
  }
}

fs.writeFileSync('./block.png', png.getBuffer());
```

Output:

![line](/example/block.png)

**Let's try to draw waves:**

```javascript
const http = require('http');
const PNGlib = require('node-pnglib');

http.createServer(function (req, res) {
  if(req.url == '/favicon.ico') return res.end('');

  let png = new PNGlib(100, 100);

  for (let i = 0; i < 65; i++) {
    for (let j = 10; j < 65; j++) {
      png.setPixel(i + 10, j + 20, '#cc0044');
      png.setPixel(i + 20, j + 10, '#0044cc');
      png.setPixel(i + 30, j, '#00cc44');
    }
  }
  res.setHeader('Content-Type', 'image/png');
  res.end(png.getBuffer());
}).listen(3001);
```

Output:

![line](/example/wave.png)

# Benchmark

```
# Simple line

pnglib x 1,021 ops/sec ±3.37% (76 runs sampled)
pnglib-es6 x 3,293 ops/sec ±4.79% (79 runs sampled)
node-pnglib x 17,027 ops/sec ±0.93% (87 runs sampled)
Fastest is node-pnglib

node v8.1.1
MacBook Pro (Retina, 13-inch, Early 2015)
2.7 GHz Intel Core i5
```

It's faster than similar libraries. you can go to [here](https://github.com/Lellansin/node-pnglib/blob/master/bench/) for more benchmark infomation.
