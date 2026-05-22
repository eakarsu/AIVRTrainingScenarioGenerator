import { useEffect, useState } from 'react';
import api from '../services/api';

const empty = { name: '', difficulty: 'beginner', environment: 'classroom', industry: 'general', maxDurationMin: 20, enabled: true };

export default function ScenarioRulesEditor() {
  const [rules, setRules] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState(null);

  const load = () => api.get('/custom-views/scenario-rules')
    .then(r => {
      setRules(r.data.rules);
      setDifficulties(r.data.difficulties);
      setEnvironments(r.data.environments);
    })
    .catch(e => setErr(e.message));

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, maxDurationMin: Number(form.maxDurationMin) };
      if (editId) {
        await api.put(`/custom-views/scenario-rules/${editId}`, payload);
      } else {
        await api.post('/custom-views/scenario-rules', payload);
      }
      setForm(empty); setEditId(null); load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  const edit = (r) => { setEditId(r.id); setForm({ ...r }); };
  const del = async (id) => { await api.delete(`/custom-views/scenario-rules/${id}`); load(); };

  return (
    <div data-testid="scenario-rules-editor" style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginBottom: 12, color: '#0f172a' }}>Scenario Generation Rules</h3>
      {err && <div style={{ color: '#ef4444', marginBottom: 8 }}>Error: {err}</div>}

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        <input required placeholder="Rule name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
               style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })}
                style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}>
          {environments.map(env => <option key={env} value={env}>{env}</option>)}
        </select>
        <input placeholder="Industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
               style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <input type="number" placeholder="Max duration (min)" value={form.maxDurationMin}
               onChange={e => setForm({ ...form, maxDurationMin: e.target.value })}
               style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
        <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontWeight: 600, cursor: 'pointer' }}>
          {editId ? 'Update Rule' : 'Add Rule'}
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: 8, fontSize: 12 }}>Name</th>
            <th style={{ padding: 8, fontSize: 12 }}>Difficulty</th>
            <th style={{ padding: 8, fontSize: 12 }}>Environment</th>
            <th style={{ padding: 8, fontSize: 12 }}>Industry</th>
            <th style={{ padding: 8, fontSize: 12 }}>Max Min</th>
            <th style={{ padding: 8, fontSize: 12 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: 8, fontSize: 13 }}>{r.name}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{r.difficulty}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{r.environment}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{r.industry}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{r.maxDurationMin}</td>
              <td style={{ padding: 8, fontSize: 13 }}>
                <button onClick={() => edit(r)} style={{ marginRight: 6, background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(r.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
