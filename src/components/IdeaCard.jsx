import { Link } from 'react-router-dom';
import DifficultyDots from './DifficultyDots.jsx';

export default function IdeaCard({ idea: x }) {
  return (
    <div className="glass">
      <h3 className="m-0 text-lg"><Link to={`/hackathon-ideas/${x.ideaId}`}>{x.title}</Link></h3>
      <div className="muted text-sm">{x.category}</div>
      <div className="my-2 flex flex-wrap items-center gap-2">
        <DifficultyDots level={x.difficulty} /><span className="muted text-sm">{x.difficulty}</span>
        <span className="tag">team {x.teamSize}</span>
        <span className="tag">{x.isHardware ? 'hardware + software' : 'software'}</span>
        {x.isAI && <span className="tag">AI</span>}
      </div>
      <p className="muted m-0 text-sm">{x.problem}</p>
    </div>
  );
}
