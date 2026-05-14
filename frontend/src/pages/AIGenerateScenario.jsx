import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AIGenerateScenario({ addToast }) {
  const [form, setForm] = useState({
    industry: 'Construction',
    hazardType: 'Fall Hazard',
    difficulty: 'beginner',
    durationMinutes: 15,
    learningObjectives: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const objectives = form.learningObjectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const r = await aiAPI.generateScenario({
        industry: form.industry,
        hazardType: form.hazardType,
        difficulty: form.difficulty,
        durationMinutes: Number(form.durationMinutes) || 15,
        learningObjectives: objectives,
      });
      setResult(r.data);
      addToast?.('Scenario generated', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Request failed';
      setError(msg);
      addToast?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          <span style={{ fontSize: '28px' }}>{'🎯'}</span>
          AI Scenario Generator
        </h1>
        <p>Generate a structured VR training scenario from a few inputs.</p>
      </div>

      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-field">
              <label>Industry</label>
              <select value={form.industry} onChange={set('industry')}>
                {['Construction', 'Manufacturing', 'Healthcare', 'Oil & Gas', 'Mining', 'Office', 'Transportation'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Hazard Type</label>
              <select value={form.hazardType} onChange={set('hazardType')}>
                {['Fall Hazard', 'Chemical Hazard', 'Electrical Hazard', 'Fire Hazard', 'Biological Hazard', 'Mechanical Hazard'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Difficulty</label>
              <select value={form.difficulty} onChange={set('difficulty')}>
                {['beginner', 'intermediate', 'advanced'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Duration (min)</label>
              <input type="number" value={form.durationMinutes} onChange={set('durationMinutes')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Learning Objectives (one per line)</label>
              <textarea rows={4} value={form.learningObjectives} onChange={set('learningObjectives')} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating…' : 'Generate Scenario'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="ai-generate-section" style={{ marginTop: 16 }}>
          <h3>Generated Scenario</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#0f172a08', padding: 12, borderRadius: 8 }}>
            {typeof (result.scenario || result.result) === 'string'
              ? (result.scenario || result.result)
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
