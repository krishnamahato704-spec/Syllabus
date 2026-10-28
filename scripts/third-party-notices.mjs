import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let lock;
try {
  lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
} catch {
  console.log('package-lock.json not found, keeping existing third-party notices.');
  process.exit(0);
}
const notices = ['Study Atlas — installed production dependency notices',
  'Includes a superset of packages used by the browser bundle. Font notices are separate files in licenses/.'];
const sourceNotices = new Set();
async function scanHeaders(dir) {
  let files; try { files = await readdir(dir, { withFileTypes:true }); } catch { return; }
  for (const f of files) {
    const file = join(dir, f.name);
    if (f.isDirectory()) await scanHeaders(file);
    else if (/\.(?:m?js|cjs)$/.test(f.name)) {
      const code = await readFile(file, 'utf8');
      for (const match of code.matchAll(/\/\*[^]*?\*\//g)) if (/@license|Copyright/.test(match[0]) && match[0].length < 20000) sourceNotices.add(match[0]);
    }
  }
}
for (const [relative, info] of Object.entries(lock.packages)) {
  if (!relative || info.dev) continue;
  const dir = join(root, relative);
  let files; try { files = await readdir(dir); } catch { continue; }
  const names = files.filter(name => /^(?:licen[cs]e|notice|copying)(?:[.-].*)?$/i.test(name));
  if (names.length) {
    notices.push(`\n\n=== ${relative} ${info.version} (${info.license || 'see notice'}) ===`);
    for (const name of names) {
      try { notices.push(`\n${name}\n${await readFile(join(dir, name), 'utf8')}`); } catch {}
    }
  }
  if (relative.startsWith('node_modules/@firebase/') || relative === 'node_modules/firebase') await scanHeaders(join(dir, 'dist'));
}
notices.push('\n\n=== Firebase source copyright and licence notices (deduplicated) ===', ...sourceNotices);
await mkdir(join(root, 'licenses'), { recursive:true });
await writeFile(join(root, 'licenses/THIRD_PARTY_NOTICES.txt'), notices.join('\n'));
console.log('Production dependency notices retained.');
