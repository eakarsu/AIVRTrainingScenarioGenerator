import { useState, useEffect } from 'react';
import { adaptiveAssessmentAPI, trainingModuleAPI } from '../services/api';

export default function AdaptiveAssessment({ addToast }) {
  const [modules, setModules] = useState([]);
  const [traineeName, setTraineeName] = useState('');
  const [traineeEmail, setTraineeEmail] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [topicGoal, setTopicGoal] = useState('');
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);

  useEffect(() => {
    trainingModuleAPI.getAll().then(r => setModules(r.data || [])).catch(() => {});
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const r = await adaptiveAssessmentAPI.listSessions();
      setPastSessions(r.data || []);
    } catch {
      setPastSessions([]);
    }
  };

  const start = async () => {
    if (!traineeName || !moduleId) {
      addToast('Trainee name and module are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const r = await adaptiveAssessmentAPI.startSession({
        traineeName,
        traineeEmail,
        moduleId,
        topicGoal,
      });
      setSession(r.data);
      setCurrentQuestion(r.data?.nextQuestion || null);
      setHistory([]);
      setFeedback(null);
      addToast('Adaptive session started', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to start session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentQuestion) return;
    setLoading(true);
    try {
      const r = await adaptiveAssessmentAPI.submitAnswer(session.id, {
        questionId: currentQuestion.id,
        answer: userAnswer,
      });
      const result = r.data;
      setHistory(prev => [
        ...prev,
        {
          question: currentQuestion.question || currentQuestion.title,
          userAnswer,
          score: result?.score,
          rubricFeedback: result?.feedback,
          missingPoints: result?.missingPoints || [],
          correct: result?.correct,
        },
      ]);
      setFeedback(result);
      setUserAnswer('');
      if (result?.nextQuestion) {
        setCurrentQuestion(result.nextQuestion);
      } else {
        setCurrentQuestion(null);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit answer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const r = await adaptiveAssessmentAPI.finishSession(session.id);
      setSession({ ...session, ...r.data, finished: true });
      addToast('Session finished and score persisted', 'success');
      loadHistory();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to finish session', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          <span style={{ fontSize: '28px' }}>{'\uD83C\uDFAF'}</span>
          Adaptive Assessment Engine
        </h1>
      </div>

      {!session && (
        <div className="ai-generate-section">
          <h3>Start a new adaptive session</h3>
          <p style={{ color: '#64748b', marginBottom: 12, fontSize: 13 }}>
            The engine selects each next question based on the trainee's answers so far,
            grades short-answer responses with an AI rubric, and feeds the final score to
            assessment scores plus suggests remedial modules.
          </p>
          <div className="ai-form">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Trainee Name</label>
              <input value={traineeName} onChange={e => setTraineeName(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Trainee Email</label>
              <input type="email" value={traineeEmail} onChange={e => setTraineeEmail(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Training Module</label>
              <select value={moduleId} onChange={e => setModuleId(e.target.value)}>
                <option value="">Select a module</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Topic Goal (optional)</label>
              <input value={topicGoal} onChange={e => setTopicGoal(e.target.value)} placeholder="e.g. Fall protection on scaffolding" />
            </div>
          </div>
          <button className="btn btn-ai btn-lg" onClick={start} disabled={loading}>
            {loading ? 'Starting…' : 'Start Adaptive Session'}
          </button>
        </div>
      )}

      {session && currentQuestion && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header">
            <div className="ai-icon">{'\uD83D\uDCDD'}</div>
            <h4>Question {history.length + 1} — Difficulty: {currentQuestion.difficulty || 'adaptive'}</h4>
          </div>
          <p style={{ marginBottom: 16, fontSize: 16, fontWeight: 500 }}>
            {currentQuestion.question || currentQuestion.title}
          </p>
          {Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {currentQuestion.options.map((opt, i) => (
                <label key={i} style={{ display: 'block', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="opt"
                    value={opt}
                    checked={userAnswer === opt}
                    onChange={() => setUserAnswer(opt)}
                    style={{ marginRight: 8 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {(!currentQuestion.options || currentQuestion.options.length === 0) && (
            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Your answer…"
              rows={4}
              style={{ width: '100%', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12 }}
            />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={submitAnswer} disabled={loading || !userAnswer}>
              Submit Answer
            </button>
            <button className="btn btn-secondary" onClick={finish} disabled={loading}>
              Finish Session
            </button>
          </div>
        </div>
      )}

      {session && !currentQuestion && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header">
            <div className="ai-icon">{'\uD83C\uDFC1'}</div>
            <h4>Session Complete</h4>
          </div>
          {session.finished ? (
            <>
              <p>Final Score: <strong>{session.percentage ?? '-'}%</strong></p>
              {session.recommendedModules?.length > 0 && (
                <>
                  <h5 style={{ marginTop: 16 }}>Recommended remedial modules</h5>
                  <ul>
                    {session.recommendedModules.map((m, i) => <li key={i}>{m.title || m}</li>)}
                  </ul>
                </>
              )}
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => { setSession(null); setHistory([]); }}>
                Start New Session
              </button>
            </>
          ) : (
            <>
              <p>No more questions queued. Finish the session to persist your score.</p>
              <button className="btn btn-primary" onClick={finish} disabled={loading}>
                Finish Session
              </button>
            </>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header">
            <div className="ai-icon">{'\uD83D\uDCC4'}</div>
            <h4>Session History</h4>
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 500 }}>{i + 1}. {h.question}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Your answer: {h.userAnswer}</div>
              {h.score != null && <div style={{ fontSize: 13, marginTop: 4 }}>Score: <strong>{h.score}/10</strong></div>}
              {h.rubricFeedback && <div style={{ fontSize: 13, color: '#0f172a', marginTop: 4 }}>{h.rubricFeedback}</div>}
              {h.missingPoints?.length > 0 && (
                <div style={{ fontSize: 13, color: '#b45309', marginTop: 4 }}>
                  Missing: {h.missingPoints.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header">
            <div className="ai-icon">{'\uD83D\uDCDA'}</div>
            <h4>Past Sessions</h4>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Trainee</th>
                  <th>Module</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pastSessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.traineeName}</td>
                    <td>{s.moduleName || s.moduleId}</td>
                    <td>{s.percentage != null ? `${s.percentage}%` : '-'}</td>
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
