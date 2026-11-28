import { Link, useParams } from 'react-router-dom';
import { ideas, ideaById, roadmapById } from '../lib/catalogue.js';
import IdeaCard from '../components/IdeaCard.jsx';

export function IdeaLab() {
  return (
    <>
      <h1>Hackathon Idea Lab</h1>
      <p className="muted">{ideas.length} curated project concepts to help you find a practical direction for your next build. These are project ideas, not live competition listings.</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((x) => <IdeaCard key={x.ideaId} idea={x} />)}
      </div>
    </>
  );
}

const SECTIONS = [
  ['Problem', 'problem'], ['Why it matters', 'whyItMatters'], ['Proposed solution', 'solution'],
  ['MVP scope (required)', 'mvpScope'], ['Advanced features (optional)', 'advancedFeatures'],
  ['Suggested stack', 'suggestedStack'], ['What makes it different', 'differentiator'],
  ['Challenges and limitations', 'challenges'], ['Datasets and APIs (verify before relying on them)', 'datasetsNote'],
  ['Demo suggestion', 'demoSuggestion'],
];

export function IdeaDetail() {
  const { ideaId } = useParams();
  const x = ideaById.get(ideaId);
  if (!x) return <div className="glass"><h2 className="mt-0">Idea not found</h2><Link to="/hackathon-ideas">Back to the Idea Lab</Link></div>;
  return (
    <>
      <Link to="/hackathon-ideas">← Idea Lab</Link>
      <h1>{x.title}</h1>
      <div className="muted">{x.category} · {x.difficulty} · team {x.teamSize} · prototype ~{x.prototypeDuration}</div>
      {SECTIONS.map(([h, k]) => <section key={k}><h2>{h}</h2><p className="max-w-[72ch]">{x[k]}</p></section>)}
      <h2>Roadmaps this project draws on</h2>
      <div className="flex flex-wrap gap-2">
        {x.requiredRoadmaps.map((id) => <Link key={id} to={`/roadmaps/${id}`} className="tag no-underline">{roadmapById.get(id).title}</Link>)}
      </div>
    </>
  );
}
