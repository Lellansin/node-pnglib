'use strict';

import RGBA from './rgba';

const CACHE = new Map();

export function getRGBA(args) {
  if (typeof args == 'string') {
    let str = args;
    if (CACHE.get(str)) {
      return CACHE.get(str);
    }
    let rgba = RGBA(str);
    if (!rgba) throw new Error(`Invalid rgba color string ${args}`);
    CACHE.set(str, rgba);
    return rgba;
  }
  let [red, green, blue, alpha] = args;
  let color = `${red}.${green}.${blue}.${alpha}`;
  if (CACHE.get(color)) {
    return CACHE.get(color);
  }
  if (red >= 0 && green >= 0 && blue >= 0 ) {
    let res = [red, green, blue, alpha >= 0 ? alpha : 255];
    CACHE.set(color, res);
    return res;
  }
  throw new Error(`Invalid color ${args}`);
}

export function addColor(self, rgba) {
  if (self.pindex == self.depth) {
    console.warn('node-pnglib: depth is not enough, set up it for more');
    return 0; // TODO const
  }
  return setColor(self, rgba, self.pindex++);
}

export function setBgColor(self, rgba) {
  if (self.pindex === 0) self.pindex++;
  return setColor(self, rgba, 0);
}

function setColor(self, rgba, pindex = 0) {
  let ndx = self.plte_offs + 8 + 3 * pindex;
  self.buffer[ndx++] = rgba[0];
  self.buffer[ndx++] = rgba[1];
  self.buffer[ndx++] = rgba[2];
  self.buffer[self.trns_offs + 8 + pindex] = rgba[3];
  self.palette.set(rgba, pindex);
  return pindex;
}
