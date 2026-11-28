import roadmapsJson from '../data/roadmaps.json';
import ideasJson from '../data/hackathon-ideas.json';
import taxonomy from '../data/taxonomy.json';

export const roadmaps = roadmapsJson.roadmaps;
export const ideas = ideasJson.ideas;
export { taxonomy };

export const roadmapById = new Map(roadmaps.map((r) => [r.roadmapId, r]));
export const ideaById = new Map(ideas.map((i) => [i.ideaId, i]));
export const topicById = new Map(roadmaps.flatMap((r) => r.topics.map((t) => [t.topicId, { ...t, roadmapId: r.roadmapId }])));
export const topicCount = topicById.size;
