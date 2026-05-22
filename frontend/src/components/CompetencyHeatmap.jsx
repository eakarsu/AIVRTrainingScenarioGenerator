import { useEffect, useState } from 'react';
import api from '../services/api';

function cellColor(v) {
  // 0 (red) -> 50 (amber) -> 100 (green)
  const pct = Math.max(0, Math.min(100, v));
  const r = pct < 50 ? 239 : Math.round(239 - ((pct - 50) / 50) * 223);
  const g = pct < 50 ? Math.round(68 + (pct / 50) * 117) : Math.round(185 + ((pct - 50) / 50) * 0);
  const b = pct < 50 ? 68 : Math.round(68 + ((pct - 50) / 50) * 61);
  return `rgb(${r},${g},${b})`;
}

export default function CompetencyHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/custom-views/competency-heatmap')
      .then(r => setData(r.data))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <div data-testid="heatmap-error" style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div data-testid="heatmap-loading">Loading heatmap...</div>;

  const cellW = 70, cellH = 32, labelW = 110, headerH = 30;
  const w = labelW + cellW * data.skills.length + 10;
  const h = headerH + cellH * data.trainees.length + 10;

  return (
    <div data-testid="competency-heatmap" style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginBottom: 12, color: '#0f172a' }}>{data.title}</h3>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
        Scale: {data.scale.min}-{data.scale.max} {data.scale.unit}
      </p>
      <svg width={w} height={h} role="img" aria-label="Competency heatmap">
        {data.skills.map((s, j) => (
          <text key={s} x={labelW + j * cellW + cellW / 2} y={headerH - 8} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600">{s}</text>
        ))}
        {data.trainees.map((t, i) => (
          <g key={t}>
            <text x={labelW - 8} y={headerH + i * cellH + cellH / 2 + 4} textAnchor="end" fontSize="11" fill="#334155">{t}</text>
            {data.skills.map((_s, j) => {
              const v = data.matrix[i][j];
              return (
                <g key={j}>
                  <rect x={labelW + j * cellW} y={headerH + i * cellH} width={cellW - 2} height={cellH - 2} fill={cellColor(v)} rx="3" />
                  <text x={labelW + j * cellW + (cellW - 2) / 2} y={headerH + i * cellH + cellH / 2 + 3} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">{v}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
