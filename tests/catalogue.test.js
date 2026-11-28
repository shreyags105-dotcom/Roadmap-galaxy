import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parsePrototype, buildCatalogue, sha256 } from '../scripts/lib/prototype-parser.mjs';
import { roadmaps, ideas, roadmapById, topicById } from '../src/lib/catalogue.js';
import roadmapsJson from '../src/data/roadmaps.json';
import taxonomy from '../src/data/taxonomy.json';
import golden from './fixtures/prototype-golden.json';

// SHA-256 of the ORIGINAL roadmap-galaxy.html recorded before migration started.
const ORIGINAL_SHA256 = 'a6f4e437dac24f537a006ec2887cf84869131a4cca543f69012f5273af2eacf9';
const html = fs.readFileSync(new URL('../reference/roadmap-galaxy.prototype.html', import.meta.url));

describe('catalogue matches the prototype', () => {
  it('reference copy is byte-identical to the original prototype', () => {
    expect(sha256(html)).toBe(ORIGINAL_SHA256);
    expect(roadmapsJson.meta.sourceSha256).toBe(ORIGINAL_SHA256);
  });

  it('has exactly 13 roadmaps, 132 topics and 8 ideas', () => {
    expect(roadmaps).toHaveLength(13);
    expect(roadmaps.reduce((n, r) => n + r.topics.length, 0)).toBe(132);
    expect(topicById.size).toBe(132);
    expect(ideas).toHaveLength(8);
  });

  it('IDs and order equal what the LIVE prototype produced in a browser', () => {
    expect(roadmaps.map((r) => r.roadmapId)).toEqual(golden.catalogue.roadmapIds);
    expect(roadmaps.flatMap((r) => r.topics.map((t) => t.topicId))).toEqual(golden.catalogue.topicIds);
    expect(ideas.map((i) => i.ideaId)).toEqual(golden.catalogue.ideaIds);
  });

  it('JSON equals a fresh extraction from the prototype source (every field)', () => {
    const fresh = buildCatalogue(parsePrototype(html.toString('utf8')), sha256(html));
    expect(roadmapsJson).toEqual(fresh.roadmaps);
    expect(ideas).toEqual(fresh.ideas.ideas);
    expect(taxonomy).toEqual(fresh.taxonomy);
  });

  it('topic IDs are stable roadmapId-N, ordered 1..n, and unique', () => {
    const seen = new Set();
    for (const r of roadmaps) {
      r.topics.forEach((t, i) => {
        expect(t.topicId).toBe(`${r.roadmapId}-${i + 1}`);
        expect(t.order).toBe(i + 1);
        expect(seen.has(t.topicId)).toBe(false);
        seen.add(t.topicId);
      });
    }
  });

  it('all cross-references resolve (prerequisites, required roadmaps, categories, levels)', () => {
    for (const r of roadmaps) {
      expect(taxonomy.categories).toContain(r.category);
      expect(taxonomy.levels).toContain(r.difficulty);
      r.prerequisites.forEach((p) => expect(roadmapById.has(p)).toBe(true));
      r.careerInterests.forEach((k) => expect(Object.keys(taxonomy.interests)).toContain(k));
      r.topics.forEach((t) => t.prerequisites.forEach((p) => expect(topicById.has(p)).toBe(true)));
    }
    for (const i of ideas) i.requiredRoadmaps.forEach((id) => expect(roadmapById.has(id)).toBe(true));
  });

  it('pending placeholders are explicit in the data', () => {
    expect(roadmapsJson.meta.pending.topicWeight).toMatch(/PENDING_DECISION/);
    for (const r of roadmaps) for (const t of r.topics) { expect(t.weight).toBe(1); expect(t.level).toBe(r.difficulty); }
  });
});
