# node-pnglib

Node.js version for [PNGlib](http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/).

## Example

```javascript
http.createServer(function (req, res) {
  if(req.url == '/favicon.ico') return res.end('');

  var p = new pnglib(80, 30, 8);
  var lineIndex = p.index(0, 15);
  for (var i = 0; i < 40; i++) {
    p.buffer[lineIndex + i] = 1;
  }
  
  p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
  p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  res.setHeader('Content-Type', 'image/png');
  res.end(p.getBuffer());
}).listen(3001);
```
Then you'll get a png with a line cross.
