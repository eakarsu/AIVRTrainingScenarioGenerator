import { useState, useEffect, useRef } from 'react';
import {
  roleplayAPI,
  customerServiceAPI,
  surgicalProcedureAPI,
} from '../services/api';

export default function RoleplaySimulator({ addToast }) {
  const [scenarioType, setScenarioType] = useState('customer-service');
  const [customerScenarios, setCustomerScenarios] = useState([]);
  const [surgicalScenarios, setSurgicalScenarios] = useState([]);
  const [scenarioId, setScenarioId] = useState('');
  const [traineeName, setTraineeName] = useState('');
  const [session, setSession] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [coaching, setCoaching] = useState([]);
  const [softSkillScores, setSoftSkillScores] = useState(null);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    customerServiceAPI.getAll().then(r => setCustomerScenarios(r.data || [])).catch(() => {});
    surgicalProcedureAPI.getAll().then(r => setSurgicalScenarios(r.data || [])).catch(() => {});
    roleplayAPI.listSessions().then(r => setPastSessions(r.data || [])).catch(() => {});
  }, []);

  const list = scenarioType === 'customer-service' ? customerScenarios : surgicalScenarios;

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      addToast('Speech recognition not supported in this browser', 'error');
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setRecording(false);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  };

  const start = async () => {
    if (!scenarioId || !traineeName) {
      addToast('Pick a scenario and enter trainee name', 'error');
      return;
    }
    setLoading(true);
    try {
      const r = await roleplayAPI.startSession({
        scenarioType,
        scenarioId,
        traineeName,
      });
      setSession(r.data);
      const opening = r.data?.openingLine || r.data?.npcOpening;
      const initial = opening
        ? [{ speaker: 'npc', text: opening, role: r.data?.npcRole }]
        : [];
      setConversation(initial);
      if (opening) speak(opening);
      setCoaching([]);
      setSoftSkillScores(null);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to start session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendTurn = async () => {
    if (!session || !input.trim()) return;
    const userTurn = { speaker: 'trainee', text: input };
    setConversation(prev => [...prev, userTurn]);
    setLoading(true);
    try {
      const r = await roleplayAPI.sendTurn(session.id, { text: input });
      const npcReply = r.data?.npcReply;
      const turnCoaching = r.data?.coaching;
      if (npcReply) {
        setConversation(prev => [...prev, { speaker: 'npc', text: npcReply, role: r.data?.npcRole }]);
        speak(npcReply);
      }
      if (turnCoaching) {
        setCoaching(prev => [...prev, { turn: prev.length + 1, ...turnCoaching }]);
      }
      setInput('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Turn failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const end = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const r = await roleplayAPI.endSession(session.id);
      setSoftSkillScores(r.data?.softSkillScores || r.data?.scores || null);
      addToast('Session ended and scored', 'success');
      const list = await roleplayAPI.listSessions();
      setPastSessions(list.data || []);
    } catch (err) {
      addToast(err.response?.data?.error || 'End failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          <span style={{ fontSize: '28px' }}>{'\uD83C\uDFA4'}</span>
          Voice Roleplay Simulator
        </h1>
      </div>

      {!session && (
        <div className="ai-generate-section">
          <h3>Start a roleplay</h3>
          <p style={{ color: '#64748b', marginBottom: 12, fontSize: 13 }}>
            Real-time voice conversation with an AI customer / patient / mentor persona.
            Browser speech recognition captures your voice; speech synthesis voices the
            NPC. Live coaching feedback appears after each turn and final soft-skill scores
            are persisted.
          </p>
          <div className="ai-form">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Scenario Type</label>
              <select value={scenarioType} onChange={e => { setScenarioType(e.target.value); setScenarioId(''); }}>
                <option value="customer-service">Customer Service</option>
                <option value="surgical-procedures">Surgical Mentor</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Scenario</label>
              <select value={scenarioId} onChange={e => setScenarioId(e.target.value)}>
                <option value="">Select…</option>
                {list.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Trainee Name</label>
              <input value={traineeName} onChange={e => setTraineeName(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-ai btn-lg" onClick={start} disabled={loading}>
            {loading ? 'Starting…' : 'Start Voice Session'}
          </button>
        </div>
      )}

      {session && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="ai-icon">{'\uD83D\uDDE3\uFE0F'}</div>
              <h4>{session.scenarioTitle || 'Conversation'}</h4>
            </div>
            <button className="btn btn-secondary" onClick={end} disabled={loading}>End & Score</button>
          </div>

          <div style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 12, padding: 16, maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
            {conversation.length === 0 && <p style={{ color: '#64748b' }}>The NPC will speak first…</p>}
            {conversation.map((c, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: c.speaker === 'trainee' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  background: c.speaker === 'trainee' ? '#6366f1' : '#1e293b',
                  color: c.speaker === 'trainee' ? '#fff' : '#e2e8f0',
                  padding: '10px 14px',
                  borderRadius: 12,
                  maxWidth: '70%',
                }}>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                    {c.speaker === 'trainee' ? 'You' : (c.role || 'NPC')}
                  </div>
                  {c.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Speak or type your response…"
              rows={2}
              style={{ flex: 1, padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }}
            />
            <button
              className={`btn ${recording ? 'btn-danger' : 'btn-secondary'}`}
              onClick={recording ? () => recognitionRef.current?.stop() : startRecording}
            >
              {recording ? 'Stop' : 'Voice'}
            </button>
            <button className="btn btn-primary" onClick={sendTurn} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>

          {coaching.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h5 style={{ fontWeight: 600, marginBottom: 8 }}>Live Coaching</h5>
              {coaching.map((c, i) => (
                <div key={i} style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: 10, borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                  <strong>Turn {c.turn}:</strong> {c.tip || c.feedback || JSON.stringify(c)}
                  {c.missing && <div style={{ color: '#92400e', marginTop: 4 }}>Missed: {Array.isArray(c.missing) ? c.missing.join(', ') : c.missing}</div>}
                </div>
              ))}
            </div>
          )}

          {softSkillScores && (
            <div style={{ marginTop: 16, padding: 16, background: '#dbeafe', borderRadius: 12 }}>
              <h5 style={{ fontWeight: 600, marginBottom: 8 }}>Soft Skill Scores</h5>
              <div className="detail-grid">
                {Object.entries(softSkillScores).map(([k, v]) => (
                  <div key={k} className="detail-field">
                    <div className="field-label">{k}</div>
                    <div className="field-value">{typeof v === 'number' ? `${v}/10` : String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="ai-output" style={{ marginTop: 24 }}>
          <div className="ai-header">
            <div className="ai-icon">{'\uD83D\uDCC4'}</div>
            <h4>Past Roleplay Sessions</h4>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Trainee</th>
                  <th>Scenario</th>
                  <th>Type</th>
                  <th>Overall</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pastSessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.traineeName}</td>
                    <td>{s.scenarioTitle || s.scenarioId}</td>
                    <td>{s.scenarioType}</td>
                    <td>{s.overallScore != null ? `${s.overallScore}/10` : '-'}</td>
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
