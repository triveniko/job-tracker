import { STATUSES } from '../constants';

export default function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div className="stats">
      <div className="stat"><strong>{stats.total}</strong><span>Total</span></div>
      {STATUSES.map((s) => (
        <div className="stat" key={s}>
          <strong>{stats.counts[s] ?? 0}</strong>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}