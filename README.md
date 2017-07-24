# node-pnglib

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
const PNGlib = require('..');

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
    let y = Math.sin(i) * Math.sin(i) * 50 + 50;
  
    // use a color triad of Microsofts million dollar color
    png.setPixel(x, (y - 10), 'green');
    png.setPixel(x, (y)     , '#FF00FF');
    png.setPixel(x, (y + 10), 'rgb(255,0,0)');
  }

  res.setHeader('Content-Type', 'image/png');
  res.end(png.getBuffer());
}).listen(3001);
```

Output:

![line](/example/wave.png)

