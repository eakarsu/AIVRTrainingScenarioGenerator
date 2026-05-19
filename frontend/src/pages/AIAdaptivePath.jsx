import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AIAdaptivePath({ addToast }) {
  const [form, setForm] = useState({
    traineeName: '',
    role: '',
    currentLevel: 'beginner',
    weakAreas: '',
    strongAreas: '',
    goals: '',
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
      const split = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
      const r = await aiAPI.adaptivePath({
        traineeName: form.traineeName,
        role: form.role,
        currentLevel: form.currentLevel,
        weakAreas: split(form.weakAreas),
        strongAreas: split(form.strongAreas),
        goals: split(form.goals),
      });
      setResult(r.data);
      addToast?.('Adaptive learning path generated', 'success');
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
          <span style={{ fontSize: '28px' }}>{'🧭'}</span>
          AI Adaptive Learning Path
        </h1>
        <p>Personalised learning-path recommendation given trainee profile and weak areas.</p>
      </div>

      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-field">
              <label>Trainee Name</label>
              <input value={form.traineeName} onChange={set('traineeName')} />
            </div>
            <div className="form-field">
              <label>Role / Job Function</label>
              <input value={form.role} onChange={set('role')} placeholder="e.g. Site supervisor" />
            </div>
            <div className="form-field">
              <label>Current Level</label>
              <select value={form.currentLevel} onChange={set('currentLevel')}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Weak Areas (one per line)</label>
              <textarea rows={3} value={form.weakAreas} onChange={set('weakAreas')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Strong Areas (one per line)</label>
              <textarea rows={3} value={form.strongAreas} onChange={set('strongAreas')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Goals (one per line)</label>
              <textarea rows={3} value={form.goals} onChange={set('goals')} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating…' : 'Generate Adaptive Path'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="ai-generate-section" style={{ marginTop: 16 }}>
          <h3>Recommended Path</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#0f172a08', padding: 12, borderRadius: 8 }}>
            {typeof (result.path || result.result) === 'string'
              ? (result.path || result.result)
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
