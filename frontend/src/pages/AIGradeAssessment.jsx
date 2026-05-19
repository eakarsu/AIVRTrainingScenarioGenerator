import { useState } from 'react';
import { aiAPI } from '../services/api';

export default function AIGradeAssessment({ addToast }) {
  const [form, setForm] = useState({
    question: '',
    expectedAnswer: '',
    studentAnswer: '',
    rubric: '',
    maxPoints: 10,
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
      const r = await aiAPI.gradeAssessment({
        question: form.question,
        expectedAnswer: form.expectedAnswer,
        studentAnswer: form.studentAnswer,
        rubric: form.rubric,
        maxPoints: Number(form.maxPoints) || 10,
      });
      setResult(r.data);
      addToast?.('Assessment graded', 'success');
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
          <span style={{ fontSize: '28px' }}>{'📝'}</span>
          AI Assessment Grader
        </h1>
        <p>Grade a quiz or assessment submission against a rubric.</p>
      </div>

      <div className="ai-generate-section">
        <form onSubmit={submit}>
          <div className="form-field">
            <label>Question *</label>
            <textarea rows={2} value={form.question} onChange={set('question')} required />
          </div>
          <div className="form-field">
            <label>Expected / Reference Answer</label>
            <textarea rows={3} value={form.expectedAnswer} onChange={set('expectedAnswer')} />
          </div>
          <div className="form-field">
            <label>Student Answer *</label>
            <textarea rows={4} value={form.studentAnswer} onChange={set('studentAnswer')} required />
          </div>
          <div className="form-field">
            <label>Rubric</label>
            <textarea rows={3} value={form.rubric} onChange={set('rubric')} placeholder="Criteria, weighting, partial-credit rules..." />
          </div>
          <div className="form-field">
            <label>Max Points</label>
            <input type="number" value={form.maxPoints} onChange={set('maxPoints')} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Grading…' : 'Grade Assessment'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="ai-generate-section" style={{ marginTop: 16 }}>
          <h3>Grading Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#0f172a08', padding: 12, borderRadius: 8 }}>
            {typeof (result.grade || result.result) === 'string'
              ? (result.grade || result.result)
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
