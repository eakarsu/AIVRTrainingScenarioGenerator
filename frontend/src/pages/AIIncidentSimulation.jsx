import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AIIncidentSimulation({ addToast }) {
  const [form, setForm] = useState({
    domain: 'industrial safety',
    severity: 'moderate',
    seedIncident: '',
    hazards: 'electrical, working-at-height',
    learnerRole: 'frontline operator',
    durationMinutes: 25,
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
      const r = await aiAPI.incidentSimulation({
        domain: form.domain,
        severity: form.severity,
        seed_incident: form.seedIncident || undefined,
        hazards: form.hazards.split(',').map(s => s.trim()).filter(Boolean),
        learnerRole: form.learnerRole,
        durationMinutes: parseInt(form.durationMinutes, 10) || 25,
      });
      setResult(r.data);
      addToast?.('Incident simulation generated', 'success');
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 503
        ? `AI service unavailable (missing: ${err.response?.data?.missing || 'OPENROUTER_API_KEY'})`
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
        <h1><span style={{ fontSize: '28px' }}>🚨</span> Incident Simulation</h1>
        <p>Generate a real-world-style incident scenario with decision points and debrief questions.</p>
      </div>
      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-field">
              <label>Domain</label>
              <input value={form.domain} onChange={set('domain')} />
            </div>
            <div className="form-field">
              <label>Severity</label>
              <select value={form.severity} onChange={set('severity')}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="catastrophic">Catastrophic</option>
              </select>
            </div>
            <div className="form-field">
              <label>Learner Role</label>
              <input value={form.learnerRole} onChange={set('learnerRole')} />
            </div>
            <div className="form-field">
              <label>Duration (min)</label>
              <input type="number" min="5" max="180" value={form.durationMinutes} onChange={set('durationMinutes')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Hazards (comma-separated)</label>
              <input value={form.hazards} onChange={set('hazards')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Seed Incident (optional — leave blank for default)</label>
              <textarea rows={3} value={form.seedIncident} onChange={set('seedIncident')} placeholder="describe a real near-miss / event to base the simulation on" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating…' : 'Generate Incident Simulation'}
            </button>
          </div>
        </form>
      </div>
      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      {result && (
        <div className="ai-generate-section" style={{ marginTop: 16 }}>
          <h3>Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#0f172a08', padding: 12, borderRadius: 8 }}>
            {JSON.stringify(result.result || result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
