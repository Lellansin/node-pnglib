# node-pnglib [![NPM Version](https://badge.fury.io/js/node-pnglib.svg)](http://badge.fury.io/js/node-pnglib) [![Build Status](https://travis-ci.org/Lellansin/node-pnglib.png?branch=master)](https://travis-ci.org/Lellansin/node-pnglib) [![Coveralls Status](https://img.shields.io/coveralls/Lellansin/node-pnglib/master.svg)](https://coveralls.io/github/Lellansin/node-pnglib)

Pure Javascript lib for generate PNG, Node.js version for [PNGlib](http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/).

## Example

**Test it with http server:**

```javascript
const http = require('http');
const PNGlib = require('node-pnglib');

http.createServer(function (req, res) {
  if(req.url == '/favicon.ico') return res.end('');

  // width 150, height 50
  let png = new PNGlib(150, 50);
  
  // from (0, 25)
  let lineIndex = png.index(0, 25);
  for (let i = 0; i < 75; i++) {
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

let png = new PNGlib(200, 200);

for (let i = 30; i < 120; i++) {
  for (let j = 30; j < 120; j++) {
    png.setPixel(i + 20, j + 35, '#cc0044');
    png.setPixel(i + 30, j + 20, '#0044cc');
    png.setPixel(i + 40, j + 30, '#00cc44');
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

  let png = new PNGlib(200, 150);
  
  for (let i = 0, num = 200 / 10; i <= num; i += .01) {
  
    let x = i * 10;
    // Math.sin(i) range [-1, 1] ====> 0 <= y <= 50
    let y = Math.sin(i) * 25 + 25;
  
    // use a color triad of Microsofts million dollar color
    png.setPixel(x, (y)     , '#FF00FF');
    png.setPixel(x, (y + 10), 'rgb(255,0,0)');
  }

  res.setHeader('Content-Type', 'image/png');
  res.end(png.getBuffer());
}).listen(3001);
```

Output:

![line](/example/wave.png)

**Let's try to draw number:**

```javascript
'use strict';

const fs = require('fs');
const path = require('path');
const PNGlib = require('..');

let png = new PNGlib(200, 200);

for (let i = 0; i < 10; ++i) {
  const font = PNGlib.font8x16;
  let ch = String(i);
  console.log(ch);
  png.drawChar(ch, 0 + 2 * i * font.w, 100, font, '#00FF00');
}

fs.writeFileSync(path.resolve(__dirname, './char.png'), png.getBuffer());
```

Output:

![line](/example/char.png)

# Benchmark

```
pnglib x 1,165 ops/sec ±2.82% (84 runs sampled)
pnglib-es6 x 3,705 ops/sec ±4.48% (75 runs sampled)
node-pnglib x 10,001 ops/sec ±1.32% (87 runs sampled)
Fastest is node-pnglib

node v8.1.1
MacBook Pro (Retina, 13-inch, Early 2015)
2.7 GHz Intel Core i5
```

It's faster than similar libraries. you can go to [here](https://github.com/Lellansin/node-pnglib/blob/master/bench/) for more benchmark infomation.
