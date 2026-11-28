// Reads the catalogue block out of the prototype HTML by executing ONLY that block in an
// isolated VM context (no DOM, no network). The prototype file is never modified.
import vm from 'node:vm';
import crypto from 'node:crypto';

const START = '// ---------- Static catalogue';
const END = '// ---------- State';

export const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

export function parsePrototype(html) {
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a < 0 || b < 0 || b < a) throw new Error('Catalogue markers not found in prototype HTML');
  const code = `${html.slice(a, b)};({CATS,R,INTERESTS,BRANCHES,I})`;
  // Round-trip through JSON so the result has no VM-realm objects.
  return JSON.parse(JSON.stringify(vm.runInNewContext(code, {}, { timeout: 2000 })));
}

// Prototype array layouts (documented here so the mapping is auditable):
// roadmap: [id,title,category,difficulty,duration,description,prereqs,topics,skills,project,interests]
// idea:    [id,title,category,difficulty,team,days,ai,hw,problem,why,solution,mvp,advanced,stack,
//           requiredRoadmaps,differentiator,challenges,datasetsNote,demo,interests]
export function buildCatalogue(parsed, sourceSha256) {
  const roadmaps = parsed.R.map((r) => ({
    roadmapId: r[0],
    title: r[1],
    category: r[2],
    difficulty: r[3],
    estimatedDuration: r[4],
    description: r[5],
    prerequisites: r[6],
    skillsGained: r[8],
    projectSuggestion: r[9],
    careerInterests: r[10],
    topics: r[7].map((title, i) => ({
      topicId: `${r[0]}-${i + 1}`,
      order: i + 1,
      title,
      level: r[3], // PENDING: derived from roadmap difficulty (prototype has no per-topic level)
      weight: 1, // PENDING: prototype has no topic weightage; equal weights until decided
      prerequisites: [], // PENDING: prototype has no topic-level prerequisites
    })),
  }));
  const ideas = parsed.I.map((x) => ({
    ideaId: x[0],
    title: x[1],
    category: x[2],
    difficulty: x[3],
    teamSize: x[4],
    prototypeDuration: x[5],
    isAI: !!x[6],
    isHardware: !!x[7],
    problem: x[8],
    whyItMatters: x[9],
    solution: x[10],
    mvpScope: x[11],
    advancedFeatures: x[12],
    suggestedStack: x[13],
    requiredRoadmaps: x[14],
    differentiator: x[15],
    challenges: x[16],
    datasetsNote: x[17],
    demoSuggestion: x[18],
    interests: x[19],
  }));
  const pending = {
    topicWeight: 'PENDING_DECISION: every topic weight is 1 (equal weighting) until real weightage is decided.',
    topicLevel: 'PENDING_DECISION: topic level is copied from roadmap difficulty.',
    topicPrerequisites: 'PENDING_DECISION: no topic-level prerequisites exist in the prototype; arrays are empty.',
  };
  const meta = { schemaVersion: 1, source: 'reference/roadmap-galaxy.prototype.html', sourceSha256 };
  return {
    taxonomy: { meta, categories: parsed.CATS, interests: parsed.INTERESTS, branches: parsed.BRANCHES, levels: ['Beginner', 'Intermediate', 'Advanced'] },
    roadmaps: { meta: { ...meta, pending }, roadmaps },
    ideas: { meta, ideas },
  };
}
