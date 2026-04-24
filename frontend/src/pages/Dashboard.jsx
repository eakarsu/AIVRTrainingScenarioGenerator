import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FEATURES } from '../config/features';

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    FEATURES.forEach(async (f) => {
      try {
        const res = await f.api.getAll();
        setCounts(prev => ({ ...prev, [f.key]: res.data.length }));
      } catch {
        setCounts(prev => ({ ...prev, [f.key]: 0 }));
      }
    });
  }, []);

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
  const aiFeatures = FEATURES.filter(f => f.isAI);
  const manualFeatures = FEATURES.filter(f => !f.isAI);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>AI-Powered VR Training Scenario Generator</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            {'\uD83D\uDCE6'}
          </div>
          <div className="stat-info">
            <h3>{totalItems}</h3>
            <p>Total Records</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            {'\uD83E\uDD16'}
          </div>
          <div className="stat-info">
            <h3>{aiFeatures.length}</h3>
            <p>AI Features</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            {'\u2699\uFE0F'}
          </div>
          <div className="stat-info">
            <h3>{manualFeatures.length}</h3>
            <p>Management Features</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            {'\uD83D\uDCC8'}
          </div>
          <div className="stat-info">
            <h3>{FEATURES.length}</h3>
            <p>Total Modules</p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, color: '#7c3aed' }}>
        {'\uD83E\uDD16'} AI-Powered Features
      </h2>
      <div className="cards-grid" style={{ marginBottom: 32 }}>
        {aiFeatures.map(f => (
          <div
            key={f.key}
            className="feature-card"
            onClick={() => navigate(`/feature/${f.key}`)}
          >
            <div className="card-icon" style={{ background: f.bgColor, color: f.color }}>
              {f.icon}
            </div>
            <h3>{f.name}</h3>
            <p>{f.description}</p>
            <div className="card-footer">
              <span className="badge badge-ai">AI Powered</span>
              <span className="card-count">{counts[f.key] ?? '...'} items</span>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, color: '#059669' }}>
        {'\u2699\uFE0F'} Management Features
      </h2>
      <div className="cards-grid">
        {manualFeatures.map(f => (
          <div
            key={f.key}
            className="feature-card"
            onClick={() => navigate(`/feature/${f.key}`)}
          >
            <div className="card-icon" style={{ background: f.bgColor, color: f.color }}>
              {f.icon}
            </div>
            <h3>{f.name}</h3>
            <p>{f.description}</p>
            <div className="card-footer">
              <span className="badge badge-manual">Manual</span>
              <span className="card-count">{counts[f.key] ?? '...'} items</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
