import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TrainingCurriculumPDF() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/custom-views/training-curriculum-pdf')
      .then(r => setData(r.data))
      .catch(e => setErr(e.message));
  }, []);

  const download = () => {
    if (!data?.pdfBase64) return;
    const bin = atob(data.pdfBase64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: data.mimeType || 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename || 'curriculum.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (err) return <div data-testid="pdf-error" style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div data-testid="pdf-loading">Loading curriculum...</div>;

  return (
    <div data-testid="training-curriculum-pdf" style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#0f172a' }}>{data.title}</h3>
        <button onClick={download} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Download PDF
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
        Total: <strong>{data.totalHours}h</strong> across <strong>{data.modules.length}</strong> modules
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: 8, fontSize: 12 }}>Code</th>
            <th style={{ padding: 8, fontSize: 12 }}>Title</th>
            <th style={{ padding: 8, fontSize: 12 }}>Hours</th>
            <th style={{ padding: 8, fontSize: 12 }}>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {data.modules.map(m => (
            <tr key={m.code} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: 8, fontSize: 13, fontFamily: 'monospace' }}>{m.code}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{m.title}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{m.hours}</td>
              <td style={{ padding: 8, fontSize: 13, textTransform: 'capitalize' }}>{m.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
