import { useState, useEffect } from 'react';
import {
  sceneCompilerAPI,
  safetyTrainingAPI,
  vrEnvironmentAPI,
} from '../services/api';

export default function SceneCompiler({ addToast }) {
  const [sourceType, setSourceType] = useState('safety-training');
  const [scenarios, setScenarios] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [target, setTarget] = useState('aframe');
  const [scenes, setScenes] = useState([]);
  const [activeScene, setActiveScene] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    safetyTrainingAPI.getAll().then(r => setScenarios(r.data || [])).catch(() => {});
    vrEnvironmentAPI.getAll().then(r => setEnvironments(r.data || [])).catch(() => {});
    sceneCompilerAPI.list().then(r => setScenes(r.data || [])).catch(() => {});
  }, []);

  const sourceOptions = sourceType === 'safety-training' ? scenarios : environments;

  const compile = async () => {
    if (!sourceId) {
      addToast('Please pick a source scenario', 'error');
      return;
    }
    setLoading(true);
    try {
      const r = await sceneCompilerAPI.compile({ sourceType, sourceId, target });
      setActiveScene(r.data);
      const list = await sceneCompilerAPI.list();
      setScenes(list.data || []);
      addToast('Scene compiled', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Compile failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = (scene) => {
    const text = typeof scene.sceneJson === 'string' ? scene.sceneJson : JSON.stringify(scene.sceneJson || scene, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scene.id || 'scene'}-${scene.target || target}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete compiled scene?')) return;
    try {
      await sceneCompilerAPI.delete(id);
      setScenes(prev => prev.filter(s => s.id !== id));
      if (activeScene?.id === id) setActiveScene(null);
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          <span style={{ fontSize: '28px' }}>{'\uD83C\uDFAE'}</span>
          Scenario-to-Scene Compiler
        </h1>
      </div>

      <div className="ai-generate-section">
        <h3>Compile a VR scene</h3>
        <p style={{ color: '#64748b', marginBottom: 12, fontSize: 13 }}>
          Generates an A-Frame, Three.js or Unity-import scene description: hazards,
          props, NPC roles, trigger volumes and branching dialogue. Ships as a downloadable
          JSON package per scenario.
        </p>
        <div className="ai-form">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Source Type</label>
            <select value={sourceType} onChange={e => { setSourceType(e.target.value); setSourceId(''); }}>
              <option value="safety-training">Safety Training Scenario</option>
              <option value="vr-environment">VR Environment Template</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Source Item</label>
            <select value={sourceId} onChange={e => setSourceId(e.target.value)}>
              <option value="">Select…</option>
              {sourceOptions.map(o => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Target Engine</label>
            <select value={target} onChange={e => setTarget(e.target.value)}>
              <option value="aframe">A-Frame (HTML)</option>
              <option value="three">Three.js</option>
              <option value="unity">Unity (JSON import)</option>
            </select>
          </div>
        </div>
        <button className="btn btn-ai btn-lg" onClick={compile} disabled={loading}>
          {loading ? 'Compiling…' : 'Compile Scene'}
        </button>
      </div>

      {activeScene && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="ai-icon">{'\uD83C\uDF00'}</div>
              <h4>Compiled Scene</h4>
            </div>
            <button className="btn btn-secondary" onClick={() => downloadJson(activeScene)}>
              Download JSON
            </button>
          </div>
          <ScenePreview scene={activeScene} />
        </div>
      )}

      <div className="ai-output" style={{ marginTop: 24 }}>
        <div className="ai-header">
          <div className="ai-icon">{'\uD83D\uDCC2'}</div>
          <h4>Compiled Scenes Library ({scenes.length})</h4>
        </div>
        {scenes.length === 0 ? (
          <p style={{ color: '#64748b' }}>No compiled scenes yet.</p>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Source</th>
                  <th>Target</th>
                  <th>Created</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenes.map(s => (
                  <tr key={s.id}>
                    <td>{s.title || s.sourceTitle || '-'}</td>
                    <td>{s.sourceType}</td>
                    <td>{s.target}</td>
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setActiveScene(s)}>View</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => downloadJson(s)}>Download</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(s.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenePreview({ scene }) {
  const data = scene.sceneJson || scene;
  return (
    <div>
      {data.hazards && (
        <Section title="Hazards" items={data.hazards} render={h => `${h.type || h.name} @ ${JSON.stringify(h.position || {})}`} />
      )}
      {data.props && (
        <Section title="Props" items={data.props} render={p => `${p.name} (${p.model || 'primitive'})`} />
      )}
      {data.npcs && (
        <Section title="NPCs" items={data.npcs} render={n => `${n.role}${n.name ? ` — ${n.name}` : ''}`} />
      )}
      {data.triggers && (
        <Section title="Trigger Volumes" items={data.triggers} render={t => `${t.name} → ${t.action}`} />
      )}
      {data.dialogue && (
        <Section title="Branching Dialogue" items={Array.isArray(data.dialogue) ? data.dialogue : []} render={d => `${d.speaker}: ${d.line}`} />
      )}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Raw scene JSON</summary>
        <pre style={{ fontSize: 12, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 8, overflowX: 'auto', marginTop: 8 }}>
{JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Section({ title, items, render }) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <h5 style={{ fontWeight: 600, marginBottom: 8 }}>{title}</h5>
      <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
        {items.map((it, i) => <li key={i}>{render(it)}</li>)}
      </ul>
    </div>
  );
}
