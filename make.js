#!/user/bin/env nodejs
'use strict';

const fs = require('fs');
const svelte = require('svelte/compiler');

let components = ['ChangePassword', 'Login', 'Recover'];

try {
  fs.mkdirSync('lib');
} catch (e) {}
try {
  fs.mkdirSync('lib/Components');
} catch (e) {}

// Compile Svelte component.
for (let name of components) {
  const srcFilename = 'src/Components/' + name + '.html';
  const dstFilename = 'lib/Components/' + name + '.js';
  let code = fs.readFileSync(srcFilename, 'utf8');
  let map;

  const { js } = svelte.compile(code, {
    format: 'esm',
    filename: srcFilename,
    name,
    css: false,
  });
  ({ code, map } = js);
  if (map) {
    code += '\n//# sourceMappingURL=' + name + '.js.map';
  }

  fs.writeFileSync(dstFilename, code);
  if (map) {
    fs.writeFileSync(dstFilename + '.map', JSON.stringify(map));
  }
}
