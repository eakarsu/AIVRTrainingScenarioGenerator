import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AIPerformancePrediction({ addToast }) {
  const [form, setForm] = useState({
    learnerName: '',
    role: '',
    targetCertification: '',
    hoursPerWeek: 5,
    scoreHistory: '85\n78\n82\n88\n91',
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
      const scores = form.scoreHistory
        .split(/[\n,]/)
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((n) => !Number.isNaN(n));
      if (scores.length === 0) {
        setError('Please enter at least one score in the history.');
        setLoading(false);
        return;
      }
      const r = await aiAPI.performancePrediction({
        learnerProfile: { name: form.learnerName, role: form.role },
        scoreHistory: scores,
        targetCertification: form.targetCertification,
        hoursAvailablePerWeek: parseInt(form.hoursPerWeek, 10) || 5,
      });
      setResult(r.data);
      addToast?.('Performance prediction generated', 'success');
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 503
        ? 'AI service unavailable (OPENROUTER_API_KEY not configured)'
        : (err.response?.data?.error || err.message || 'Request failed');
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
          <span style={{ fontSize: '28px' }}>{'📈'}</span>
          AI Performance Prediction
        </h1>
        <p>Predict assessment trajectory and certification readiness from a learner's score history.</p>
      </div>

      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-field">
              <label>Learner Name</label>
              <input value={form.learnerName} onChange={set('learnerName')} />
            </div>
            <div className="form-field">
              <label>Role</label>
              <input value={form.role} onChange={set('role')} placeholder="e.g. Field technician" />
            </div>
            <div className="form-field">
              <label>Target Certification</label>
              <input value={form.targetCertification} onChange={set('targetCertification')} />
            </div>
            <div className="form-field">
              <label>Hours per Week Available</label>
              <input type="number" min="1" max="40" value={form.hoursPerWeek} onChange={set('hoursPerWeek')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Score History (one per line, recent first)</label>
              <textarea rows={5} value={form.scoreHistory} onChange={set('scoreHistory')} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Predicting…' : 'Predict Performance'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="ai-generate-section" style={{ marginTop: 16 }}>
          <h3>Prediction</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#0f172a08', padding: 12, borderRadius: 8 }}>
            {JSON.stringify(result.result || result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
