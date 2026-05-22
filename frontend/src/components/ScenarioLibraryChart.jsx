import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ScenarioLibraryChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/custom-views/scenario-library-chart')
      .then(r => setData(r.data))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <div data-testid="lib-chart-error" style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div data-testid="lib-chart-loading">Loading chart...</div>;

  const max = Math.max(...data.categories.map(c => c.count));
  const w = 540, h = 240, padL = 90, padR = 20, padT = 20, padB = 30;
  const barH = (h - padT - padB) / data.categories.length - 6;

  return (
    <div data-testid="scenario-library-chart" style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginBottom: 12, color: '#0f172a' }}>{data.title}</h3>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Total scenarios: <strong>{data.total}</strong></p>
      <svg width={w} height={h} role="img" aria-label="Scenario library bar chart">
        {data.categories.map((c, i) => {
          const y = padT + i * (barH + 6);
          const bw = ((w - padL - padR) * c.count) / max;
          return (
            <g key={c.label}>
              <text x={padL - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize="12" fill="#334155">{c.label}</text>
              <rect x={padL} y={y} width={bw} height={barH} fill={c.color} rx="4" />
              <text x={padL + bw + 6} y={y + barH / 2 + 4} fontSize="12" fill="#0f172a" fontWeight="600">{c.count}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
