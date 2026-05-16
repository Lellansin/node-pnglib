# node-pnglib [![NPM Version](https://badge.fury.io/js/node-pnglib.svg)](http://badge.fury.io/js/node-pnglib) [![CI](https://github.com/Lellansin/node-pnglib/actions/workflows/ci.yml/badge.svg)](https://github.com/Lellansin/node-pnglib/actions)

Pure JavaScript PNG encoder for Node.js. Port of [PNGlib](http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/).

Zero runtime dependencies. Generates indexed-color (palette) PNGs with no external tooling.

---

## Compatibility

| Platform | Node.js versions | Status |
|----------|-----------------|--------|
| **Linux** | 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24 | ✅ CI-passed |
| **macOS** | 18, 20, 22, 24 | ✅ CI-passed |

- Engine requirement: `>=4.4.0`
- No native dependencies — works on any platform Node.js runs on
- Tested across 17 Node.js major versions on Linux and 4 on macOS
- Pure JS with no external runtime deps (only `color-name` for string parsing)

---

## Installation

```sh
npm install node-pnglib
```

---

## Quick Start

**Minimal 1×1 red pixel:**

```js
const PNGlib = require('node-pnglib');
const png = new PNGlib(1, 1);
png.buffer[png.index(0, 0)] = png.color('red');
require('fs').writeFileSync('out.png', png.getBuffer());
```

**300×300 blue square (multi-block stress test):**

```js
const PNGlib = require('node-pnglib');
const png = new PNGlib(300, 300, undefined, 'white');
for (let y = 0; y < 300; y++)
  for (let x = 0; x < 300; x++)
    png.setPixel(x, y, 'blue');
require('fs').writeFileSync('blue.png', png.getBuffer());
```

---

## API Reference

### `new PNGlib(width, height, depth?, backgroundColor?)`

Creates a new PNG canvas.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `width` | `number` | — | Width in pixels (must be ≥ 1) |
| `height` | `number` | — | Height in pixels (must be ≥ 1) |
| `depth` | `number` | `8` | Color palette depth (max colors = 2^depth) |
| `backgroundColor` | `ColorArg` | `[0, 0, 0, 0]` | Transparent black by default |

**Throws** if `width < 1` or `height < 1` or types are not numbers.

### `png.index(x, y) → number`

Returns the buffer index for a pixel position.

- `x`: column (-1 = filter byte for the row)
- `y`: row
- Internal use typically; exposed for direct buffer manipulation.

### `png.color(colorArg) → number`

Resolves a color to a palette index. Adds the color to the palette if unseen.

| Input format | Examples |
|-------------|----------|
| `[R, G, B, A]` | `[255, 0, 0, 255]` (values ≥ 0, clamped to 255) |
| Named color | `'red'`, `'blue'`, `'transparent'` |
| Hex | `'#ff0000'`, `'#f00'`, `'#ff000080'` |
| rgb/rgba | `'rgb(255,0,0)'`, `'rgba(255,0,0,0.5)'` |
| hsl/hsla percentages | `'hsl(0,100%,50%)'` |

**Throws** if the color string is invalid or if R/G/B is negative.

### `png.setPixel(x, y, colorArg)`

Sets a pixel. Silently ignores out-of-bounds coordinates.

### `png.setBgColor(colorArg) → number`

Sets the background color (palette index 0). Overrides the default transparent black.

### `png.getBuffer() → Buffer`

Returns the complete PNG as a `Buffer` (ready to write to disk or send over HTTP).

### `png.getBase64() → string`

Returns the PNG as a Base64-encoded string.

### `png.deflate() → Buffer`

Same as `getBuffer()` — computes CRC32 and adler32 checksums, finalizes the PNG.

---

## Color Formats

All color inputs support these formats — strings are cached internally:

```js
png.color([255, 0, 0, 255]);         // Array RGBA (clamped to [0, 255])
png.color('red');                     // Named color
png.color('#ff0000');                  // Hex 6-digit
png.color('#f00');                     // Hex 3-digit
png.color('#ff000080');               // Hex 8-digit (with alpha)
png.color('rgb(255, 0, 0)');          // rgb()
png.color('rgba(255, 0, 0, 0.5)');    // rgba()
png.color('hsl(0, 100%, 50%)');       // hsl()
png.color('hsla(0, 100%, 50%, 0.5)');// hsla()
png.color('transparent');             // [0, 0, 0, 0]
```

---

## Internal Architecture

node-pnglib constructs the PNG binary manually:

1. **Header**: PNG signature + IHDR chunk
2. **Palette**: PLTE chunk + tRNS transparency chunk
3. **Pixel data**: IDAT chunk containing raw DEFLATE stored blocks (no compression level)
4. **Footer**: IEND chunk

The image data uses **row filter byte 0** (None) for every row. When the pixel data exceeds 65,535 bytes, it's split across multiple DEFLATE stored blocks with automatic adler32 and CRC32 checksums.

---

## Benchmark

```
# Simple line (100×40)

pnglib       x   1,021 ops/sec ±3.37%
pnglib-es6   x   3,293 ops/sec ±4.79%
node-pnglib  x  17,027 ops/sec ±0.93%   ← fastest

node v8.1.1 · MacBook Pro (Retina, 13-inch, Early 2015) · 2.7 GHz Intel Core i5
```

Full benchmarks at [bench/](https://github.com/Lellansin/node-pnglib/blob/master/bench/).

---

## License

BSD-2-Clause
