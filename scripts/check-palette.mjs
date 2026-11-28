// Fails if any colour outside the approved palette appears in source files or built CSS.
// Usage: npm run check:palette   (run after `npm run build` to include dist/)
import fs from 'node:fs';
import path from 'node:path';
import { palette, toRgbTriplet } from '../src/config/palette.js';

const allowedHex = new Set(Object.values(palette).map((h) => h.toUpperCase()));
const allowedRgb = new Set(Object.values(palette).map(toRgbTriplet));
const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const files = [...walk('src').filter((f) => /\.(js|jsx|css|json)$/.test(f) && !f.includes('data')), ...walk('dist/assets').filter((f) => f.endsWith('.css')), 'index.html', 'tailwind.config.js'];
const bad = [];
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const digits = m[0].length - 1;
    if (![3, 4, 6, 8].includes(digits)) continue; // not a colour (e.g. an element id)
    // 8-digit hex = colour + alpha (the minifier writes "electric at 15% opacity" this way): compare the colour part only.
    if (m[0] === '#0000' || m[0] === '#00000000') continue; // minifier's spelling of `transparent`
    const colour = digits === 8 ? m[0].slice(0, 7) : m[0];
    if (!allowedHex.has(colour.toUpperCase())) bad.push(`${f}: ${m[0]}`);
  }
  for (const m of text.matchAll(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/g)) {
    const t = `${m[1]} ${m[2]} ${m[3]}`;
    if (!allowedRgb.has(t)) bad.push(`${f}: rgb(${t})`);
  }
}
if (bad.length) { console.error('Off-palette colours found:\n' + [...new Set(bad)].join('\n')); process.exit(1); }
console.log(`Palette OK: ${files.length} files checked, only the 7 approved colours are used.`);
