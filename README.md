# node-pnglib

Node.js version for [PNGlib](http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/).

## Example

```javascript
http.createServer(function (req, res) {
  if(req.url == '/favicon.ico') return res.end('');

  // setup PNG with width 80, height 30
  var p = new pnglib(80, 30);
  var index = p.index(0, 15);
  for (var i = 0; i < 40; i++) {
    p.buffer[index + i] = p.color('blue');
  }

  res.setHeader('Content-Type', 'image/png');
  res.end(p.getBuffer());
}).listen(3001);
```
Then you'll get a png with a line cross.
