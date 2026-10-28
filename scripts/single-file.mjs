import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const notices = [];
await mkdir(resolve(root, 'dist/licenses'), { recursive:true });
for (const name of await readdir(resolve(root, 'licenses'))) {
  await copyFile(resolve(root, 'licenses', name), resolve(root, 'dist/licenses', name));
  notices.push(`${name}\n${await readFile(resolve(root, 'licenses', name), 'utf8')}`);
}
html = html.replace('</head>', () => `<!--\nBUNDLED ASSET AND DEPENDENCY NOTICES\n${notices.join('\n\n').replace(/-->/g, '-- >')}\n-->\n</head>`);
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
for (const [tag, src] of scripts) {
  const js = await readFile(resolve(root, 'dist', src.replace(/^\.\//, '')), 'utf8');
  html = html.replace(tag, () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
}
for (const [tag, href] of styles) {
  const css = await readFile(resolve(root, 'dist', href.replace(/^\.\//, '')), 'utf8');
  html = html.replace(tag, () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
await mkdir(resolve(root, 'release'), { recursive: true });
await writeFile(resolve(root, 'release/Study-Atlas.html'), html);
console.log(`Single-file preview built (${Math.round(Buffer.byteLength(html) / 1024)} KB).`);
