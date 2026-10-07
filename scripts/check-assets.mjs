import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/build');
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const files = new Set();
function collect(key) {
    const entry = manifest[key];
    if (!entry) throw new Error('Missing asset manifest entry: ' + key);
    files.add(entry.file);
    for (const file of entry.css ?? []) files.add(file);
    for (const file of entry.assets ?? []) files.add(file);
    for (const dependency of entry.imports ?? []) collect(dependency);
}
for (const key of ['resources/css/app.css', 'resources/js/app.ts']) collect(key);
let bytes = 0;
for (const file of files) {
    const location = path.resolve(root, file);
    if (!location.startsWith(root + path.sep)) throw new Error('Unsafe asset path');
    bytes += (await stat(location)).size;
}
if (bytes > 300 * 1024) throw new Error('Initial scaffold assets exceed 300 KiB');
console.log(`Initial UI assets: ${bytes} bytes, below 300 KiB. Full evidence bank and device readiness remain separate checks.`);
