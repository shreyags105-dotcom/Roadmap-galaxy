import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { roadmaps, ideas, topicCount, taxonomy } from '../lib/catalogue.js';
import { useProgress } from '../lib/userProgress.js';
import { learnNext } from '../lib/learnNext.js';
import { roadmapPercent } from '../lib/progress.js';
import { recommendRoadmaps, rankIdeas, buildability } from '../lib/recommend.js';

const PREF_KEY = 'roadmap-galaxy-preferences';

function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    return {
      branch: taxonomy.branches.includes(saved.branch) ? saved.branch : 'CSE / IT',
      interest: Object.hasOwn(taxonomy.interests, saved.interest) ? saved.interest : 'ai',
    };
  } catch {
    return { branch: 'CSE / IT', interest: 'ai' };
  }
}

function SolarSystem() {
  const rings = [
    { className: 'orbit-ring orbit-one', items: roadmaps.slice(0, 4) },
    { className: 'orbit-ring orbit-two', items: roadmaps.slice(4, 9) },
    { className: 'orbit-ring orbit-three', items: roadmaps.slice(9) },
  ];
  return (
    <div className="orrery-wrap">
      <div className="orrery" aria-label="Animated solar system linking to all roadmaps">
        <Link to="/roadmaps" className="orrery-sun" aria-label="Open all roadmaps" />
        {rings.map((ring) => (
          <div className={ring.className} key={ring.className}>
            {ring.items.map((roadmap, index) => {
              const angle = (2 * Math.PI * index) / ring.items.length - Math.PI / 2;
              return (
                <Link
                  key={roadmap.roadmapId}
                  to={`/roadmaps/${roadmap.roadmapId}`}
                  className="orrery-planet"
                  style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}
                  aria-label={`Open ${roadmap.title} roadmap`}
                  title={roadmap.title}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="orrery-hint">Choose a planet to explore its roadmap</p>
    </div>
  );
}

function DashboardRoadmapCard({ roadmap, completed }) {
  const percent = roadmapPercent(roadmap, completed);
  return (
    <article className="dashboard-card">
      <div className="dashboard-card-top">
        <div>
          <h3><Link to={`/roadmaps/${roadmap.roadmapId}`}>{roadmap.title}</Link></h3>
          <p className="muted">{roadmap.category}</p>
        </div>
        <span className="dashboard-percent">{percent}%</span>
      </div>
      <div className="dashboard-tags">
        <span className="tag">{roadmap.difficulty}</span>
        <span className="tag">{roadmap.estimatedDuration}</span>
        <span className="tag">{roadmap.topics.length} topics</span>
      </div>
      <p className="dashboard-description">{roadmap.description}</p>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      <div className="dashboard-card-action">
        <Link className="btn btn-primary" to={`/roadmaps/${roadmap.roadmapId}`}>{percent ? 'Continue Learning' : 'Start Learning'}</Link>
        <span className="muted text-sm">{roadmap.topics.filter(t => completed.includes(t.topicId)).length}/{roadmap.topics.length} complete</span>
      </div>
    </article>
  );
}

function DashboardIdeaCard({ idea, fit }) {
  return (
    <article className="dashboard-card idea-dashboard-card">
      <h3><Link to={`/hackathon-ideas/${idea.ideaId}`}>{idea.title}</Link></h3>
      <p className="muted">{idea.category}</p>
      <div className="dashboard-tags">
        <span className="tag">{idea.difficulty}</span>
        <span className="tag">{idea.prototypeDuration}</span>
        <span className="tag">team {idea.teamSize}</span>
        <span className="tag">{idea.isHardware ? 'hardware + software' : 'software'}</span>
        {idea.isAI && <span className="tag">AI</span>}
      </div>
      <p className="dashboard-description">{idea.problem}</p>
      <div className="idea-fit-row"><span>Skill readiness</span><b>{fit}%</b></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${fit}%` }} /></div>
    </article>
  );
}

export default function Dashboard() {
  const { completed, learning, syncError, ready } = useProgress();
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(preferences)); } catch { /* storage may be unavailable */ }
  }, [preferences]);

  const suggestedRoadmaps = useMemo(
    () => recommendRoadmaps(roadmaps, completed, preferences.interest, 3),
    [completed, preferences.interest],
  );
  const roadmapSuggestions = suggestedRoadmaps.length
    ? suggestedRoadmaps
    : roadmaps.filter(r => r.careerInterests.includes(preferences.interest)).slice(0, 3);

  const rankedIdeas = useMemo(
    () => rankIdeas(ideas, new Map(roadmaps.map(r => [r.roadmapId, r])), completed, preferences.interest),
    [completed, preferences.interest],
  );
  const selectedIdeas = rankedIdeas.slice(0, 3);
  const next = learnNext({ roadmaps, completed, studentLevel: 'Beginner', limit: 3 });
  const overall = topicCount ? Math.round(completed.length / topicCount * 100) : 0;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-welcome">
          <span className="kicker">YOUR LEARNING UNIVERSE</span>
          <h1>Welcome back</h1>
          <p>Chart a path from your first topic to a finished project.</p>
          <Link to="/hackathon-ideas" className="btn btn-sun">Explore the Hackathon Idea Lab</Link>
        </div>
        <SolarSystem />
      </section>

      {syncError && <p role="alert" className="mb-4 rounded-lg border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{syncError}</p>}
      {!ready && <p className="muted mb-3 text-xs">Syncing your personal progress…</p>}
      <section className="dashboard-quick-stats" aria-label="Your learning progress">
        <div><span>Overall progress</span><strong>{overall}%</strong></div>
        <div><span>Topics completed</span><strong>{completed.length}/{topicCount}</strong></div>
        <div><span>Currently learning</span><strong>{learning.length}</strong></div>
      </section>

      <section className="dashboard-preferences" aria-label="Personalize suggestions">
        <label>Branch
          <select className="field" value={preferences.branch} onChange={e => setPreferences(p => ({ ...p, branch: e.target.value }))}>
            {taxonomy.branches.map(branch => <option key={branch}>{branch}</option>)}
          </select>
        </label>
        <label>Interest
          <select className="field" value={preferences.interest} onChange={e => setPreferences(p => ({ ...p, interest: e.target.value }))}>
            {Object.entries(taxonomy.interests).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
          </select>
        </label>
      </section>
      <p className="dashboard-note">Suggestions only. Every roadmap and idea stays open to everyone.</p>

      <section className="dashboard-section">
        <div className="dashboard-section-heading"><h2>Explore More Roadmaps</h2><Link to="/roadmaps">Explore all roadmaps →</Link></div>
        <div className="dashboard-card-grid">
          {roadmapSuggestions.map(roadmap => <DashboardRoadmapCard key={roadmap.roadmapId} roadmap={roadmap} completed={completed} />)}
        </div>
        <p className="dashboard-link"><Link to="/roadmaps">Explore All Roadmaps →</Link></p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading"><h2>Hackathon Ideas for You</h2><Link to="/hackathon-ideas">View all ideas →</Link></div>
        <p className="muted dashboard-subheading">A strong match, a beginner-friendly pick and a challenge.</p>
        <div className="dashboard-card-grid">
          {selectedIdeas.map(idea => {
            const readiness = buildability(idea, new Map(roadmaps.map(r => [r.roadmapId, r])), completed).percent;
            return <DashboardIdeaCard key={idea.ideaId} idea={idea} fit={readiness} />;
          })}
        </div>
        <p className="dashboard-link"><Link to="/hackathon-ideas">Explore the Hackathon Idea Lab →</Link></p>
      </section>

      <section className="dashboard-section learn-next-section">
        <div className="dashboard-section-heading"><h2>Learn Next</h2><span className="muted">Your next eligible topics</span></div>
        {next.length ? <div className="dashboard-next-list">{next.map((topic, index) => (
          <Link key={topic.topicId} to={`/roadmaps/${topic.roadmapId}?topic=${topic.topicId}`}>
            <span className="mission-number">{String(index + 1).padStart(2, '0')}</span>
            <span><b>{topic.title}</b><small>{roadmaps.find(r => r.roadmapId === topic.roadmapId)?.title} · {topic.level}</small></span>
            <span className="next-arrow">↗</span>
          </Link>
        ))}</div> : <p className="muted">No eligible topics remain at this level. Explore another roadmap.</p>}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading"><h2>Your command centre</h2><span className="muted">Tools to plan and stay consistent</span></div>
        <div className="dashboard-card-grid">
          <article className="dashboard-card"><h3><Link to="/plans">My Plans</Link></h3><p className="dashboard-description">Collect your chosen roadmaps and keep track of what you are learning.</p><Link className="btn" to="/plans">Open My Plans</Link></article>
          <article className="dashboard-card"><h3><Link to="/compass">Career Compass</Link></h3><p className="dashboard-description">Choose a target role, map its skills and identify your next learning gaps.</p><Link className="btn" to="/compass">Explore career paths</Link></article>
          <article className="dashboard-card"><h3><Link to="/focus">Focus Mode</Link></h3><p className="dashboard-description">Run a focused study session and build a record of your time.</p><Link className="btn" to="/focus">Start a focus session</Link></article>
          <article className="dashboard-card"><h3><Link to="/memory">Memory Probe</Link></h3><p className="dashboard-description">Use spaced repetition to revisit completed topics and strengthen recall.</p><Link className="btn" to="/memory">Review due topics</Link></article>
        </div>
      </section>

      <section className="how-it-works">
        <span className="kicker">YOUR FLIGHT PLAN</span>
        <h2>How it works</h2>
        <div className="how-steps">
          <article><span className="how-icon">🚀</span><small>01</small><h3>Choose your path</h3><p>Select a roadmap built for exams and placements.</p></article>
          <article><span className="how-icon">✦</span><small>02</small><h3>Learn topic by topic</h3><p>Follow a focused constellation of skills.</p></article>
          <article><span className="how-icon">☼</span><small>03</small><h3>Pass mission checks</h3><p>Prove understanding before mastering topics.</p></article>
          <article><span className="how-icon">★</span><small>04</small><h3>Earn your rank</h3><p>Build XP, streaks and command achievements.</p></article>
        </div>
      </section>
    </div>
  );
}
