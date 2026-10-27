import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const hacs = JSON.parse(await readFile('hacs.json','utf8'));
assert.equal(hacs.filename,'ha-jbd-bms-card.js');
assert.equal(hacs.content_in_root,true);
assert.equal(await readFile(`dist/${hacs.filename}`,'utf8'),await readFile(hacs.filename,'utf8'));
console.log('HACS manifest and distributable match');
