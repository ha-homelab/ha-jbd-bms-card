import { readFile, mkdir, copyFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const source = await readFile('ha-jbd-bms-card.js', 'utf8');
if (!source.includes(`const VERSION = "${pkg.version}"`)) throw new Error('Version mismatch');
await mkdir('dist', { recursive: true });
await copyFile('ha-jbd-bms-card.js', 'dist/ha-jbd-bms-card.js');
console.log(`Built ha-jbd-bms-card ${pkg.version} (dependency-free ES module)`);
