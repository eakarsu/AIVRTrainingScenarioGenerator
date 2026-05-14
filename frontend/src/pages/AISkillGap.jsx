import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AISkillGap({ addToast }) {
  const [form, setForm] = useState({
    learnerName: '',
    role: '',
    targetRole: '',
    certifications: '',
    competencyScores: 'lockout-tagout: 6/10\nfall-protection: 4/10\nemergency-response: 7/10',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const parseScores = (text) =>
    text.split('\n').map(line => {
      const m = line.match(/^\s*(.+?)\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
      if (!m) return null;
      return { skill: m[1], score: Number(m[2]), max: Number(m[3]) };
    }).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null); setLoading(true);
    try {
      const competencyScores = parseScores(form.competencyScores);
      if (competencyScores.length === 0) {
        setError('Provide at least one competency in the form "skill: score/max" per line.');
        setLoading(false);
        return;
      }
      const r = await aiAPI.skillGapIdentification({
        learnerProfile: { name: form.learnerName, role: form.role },
        targetRole: form.targetRole,
        certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean),
        competencyScores,
      });
      setResult(r.data);
      addToast?.('Skill-gap analysis generated', 'success');
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
        <h1><span style={{ fontSize: '28px' }}>🎯</span> Skill Gap Identification</h1>
        <p>Identify skill gaps and prioritise remediation against a target role.</p>
      </div>
      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-field">
              <label>Learner Name</label>
              <input value={form.learnerName} onChange={set('learnerName')} />
            </div>
            <div className="form-field">
              <label>Current Role</label>
              <input value={form.role} onChange={set('role')} />
            </div>
            <div className="form-field">
              <label>Target Role</label>
              <input value={form.targetRole} onChange={set('targetRole')} />
            </div>
            <div className="form-field">
              <label>Held Certifications (comma)</label>
              <input value={form.certifications} onChange={set('certifications')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Competency Scores (one per line: "skill: score/max")</label>
              <textarea rows={6} value={form.competencyScores} onChange={set('competencyScores')} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Analysing…' : 'Identify Skill Gaps'}
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
