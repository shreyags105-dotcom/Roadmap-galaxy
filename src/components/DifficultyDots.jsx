const N = { Beginner: 1, Intermediate: 2, Advanced: 3 };

export default function DifficultyDots({ level }) {
  return (
    <span className="dots" title={level} aria-label={`Difficulty: ${level}`}>
      {[1, 2, 3].map((k) => <i key={k} className={k <= N[level] ? 'on' : ''} />)}
    </span>
  );
}
