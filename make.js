const svelte = require('svelte');
const fs = require('fs');

const {js} = svelte.compile(fs.readFileSync(process.argv[2], 'utf-8'), {css: true});

console.log(js.code);
