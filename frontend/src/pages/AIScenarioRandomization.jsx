import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AIScenarioRandomization({ addToast }) {
  const [form, setForm] = useState({
    baseScenario: '',
    variantCount: 3,
    randomizationDimensions: 'actor-role, environment, hazard-injection',
    difficultyShift: 'neutral',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setResult(null); setLoading(true);
    try {
      if (!form.baseScenario.trim()) {
        setError('Provide a base scenario (text or JSON).');
        setLoading(false);
        return;
      }
      let baseScenario = form.baseScenario;
      try { baseScenario = JSON.parse(form.baseScenario); } catch {}
      const r = await aiAPI.scenarioRandomization({
        baseScenario,
        variantCount: parseInt(form.variantCount, 10) || 3,
        randomizationDimensions: form.randomizationDimensions.split(',').map(s => s.trim()).filter(Boolean),
        difficultyShift: form.difficultyShift,
      });
      setResult(r.data);
      addToast?.('Variants generated', 'success');
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
        <h1><span style={{ fontSize: '28px' }}>🎲</span> Scenario Randomization</h1>
        <p>Generate randomised variants of a base scenario while preserving the learning objectives.</p>
      </div>
      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-field">
              <label>Variant Count</label>
              <input type="number" min="1" max="8" value={form.variantCount} onChange={set('variantCount')} />
            </div>
            <div className="form-field">
              <label>Difficulty Shift</label>
              <select value={form.difficultyShift} onChange={set('difficultyShift')}>
                <option value="easier">Easier</option>
                <option value="neutral">Neutral</option>
                <option value="harder">Harder</option>
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Randomisation Dimensions (comma)</label>
              <input value={form.randomizationDimensions} onChange={set('randomizationDimensions')} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Base Scenario (text or JSON)</label>
              <textarea rows={8} value={form.baseScenario} onChange={set('baseScenario')} placeholder="paste a scenario summary or full JSON" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating…' : 'Generate Variants'}
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
