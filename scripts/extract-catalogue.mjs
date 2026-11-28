// Usage: node scripts/extract-catalogue.mjs <prototype.html>
// Regenerates src/data/*.json from the prototype. Output is deterministic.
import fs from 'node:fs';
import path from 'node:path';
import { parsePrototype, buildCatalogue, sha256 } from './lib/prototype-parser.mjs';

const src = process.argv[2] ?? 'reference/roadmap-galaxy.prototype.html';
const html = fs.readFileSync(src, 'utf8');
const out = buildCatalogue(parsePrototype(html), sha256(fs.readFileSync(src)));
const dir = path.join('src', 'data');
fs.mkdirSync(dir, { recursive: true });
const write = (name, obj) => fs.writeFileSync(path.join(dir, name), JSON.stringify(obj, null, 2) + '\n');
write('taxonomy.json', out.taxonomy);
write('roadmaps.json', out.roadmaps);
write('hackathon-ideas.json', out.ideas);
const topics = out.roadmaps.roadmaps.reduce((n, r) => n + r.topics.length, 0);
console.log(`roadmaps=${out.roadmaps.roadmaps.length} topics=${topics} ideas=${out.ideas.ideas.length}`);
