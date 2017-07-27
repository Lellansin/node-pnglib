'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getRGBA = getRGBA;
exports.addColor = addColor;
exports.setBgColor = setBgColor;

var _rgba = require('./rgba');

var _rgba2 = _interopRequireDefault(_rgba);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CACHE = new Map();

function getRGBA(args) {
  if (typeof args == 'string') {
    var str = args;
    if (CACHE.get(str)) {
      return CACHE.get(str);
    }
    var rgba = (0, _rgba2.default)(str);
    if (!rgba) throw new Error('Invalid rgba color string ' + args);
    CACHE.set(str, rgba);
    return rgba;
  }

  var _args = _slicedToArray(args, 4),
      red = _args[0],
      green = _args[1],
      blue = _args[2],
      alpha = _args[3];

  var color = red + '.' + green + '.' + blue + '.' + alpha;
  if (CACHE.get(color)) {
    return CACHE.get(color);
  }
  if (red >= 0 && green >= 0 && blue >= 0) {
    var res = [red, green, blue, alpha >= 0 ? alpha : 255];
    CACHE.set(color, res);
    return res;
  }
  throw new Error('Invalid color ' + args);
}

function addColor(self, rgba) {
  if (self.pindex == self.depth) {
    console.warn('node-pnglib: depth is not enough, set up it for more');
    return 0; // TODO const
  }
  return setColor(self, rgba, self.pindex++);
}

function setBgColor(self, rgba) {
  if (self.pindex === 0) self.pindex++;
  return setColor(self, rgba, 0);
}

function setColor(self, rgba) {
  var pindex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var ndx = self.plte_offs + 8 + 3 * pindex;
  self.buffer[ndx++] = rgba[0];
  self.buffer[ndx++] = rgba[1];
  self.buffer[ndx++] = rgba[2];
  self.buffer[self.trns_offs + 8 + pindex] = rgba[3];
  self.palette.set(rgba, pindex);
  return pindex;
}