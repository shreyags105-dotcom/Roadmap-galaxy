import { Link } from 'react-router-dom';
import DifficultyDots from './DifficultyDots.jsx';

export default function RoadmapCard({ roadmap: r }) {
  return (
    <div className="glass">
      <h3 className="m-0 text-lg"><Link to={`/roadmaps/${r.roadmapId}`}>{r.title}</Link></h3>
      <div className="muted text-sm">{r.category}</div>
      <div className="my-2 flex flex-wrap items-center gap-2">
        <DifficultyDots level={r.difficulty} /><span className="muted text-sm">{r.difficulty}</span>
        <span className="tag">{r.estimatedDuration}</span>
        <span className="tag"><span className="font-mono">{r.topics.length}</span> topics</span>
      </div>
      <p className="muted m-0 text-sm">{r.description}</p>
    </div>
  );
}
