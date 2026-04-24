import { useState } from 'react';

export default function AIGenerateSection({ feature, onGenerated, addToast }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      const res = await feature.api.generate(formData);
      setAiResult(res.data);
      onGenerated();
    } catch (err) {
      addToast(err.response?.data?.error || 'AI generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderAIValue = (key, value) => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) {
      return (
        <div className="ai-field" key={key}>
          <div className="ai-field-label">{formatLabel(key)}</div>
          <div className="tags-list">
            {value.map((item, i) => (
              <span key={i} className="tag">
                {typeof item === 'object' ? (
                  Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')
                ) : item}
              </span>
            ))}
          </div>
        </div>
      );
    }
    if (typeof value === 'object') {
      return (
        <div className="ai-field" key={key}>
          <div className="ai-field-label">{formatLabel(key)}</div>
          <div className="detail-grid" style={{ marginTop: 8 }}>
            {Object.entries(value).map(([k, v]) => (
              <div className="detail-field" key={k}>
                <div className="field-label">{formatLabel(k)}</div>
                <div className="field-value">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="ai-field" key={key}>
        <div className="ai-field-label">{formatLabel(key)}</div>
        <div className="ai-field-value">{String(value)}</div>
      </div>
    );
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/_/g, ' ');
  };

  const ignoredKeys = ['id', 'createdAt', 'updatedAt'];

  return (
    <div className="ai-generate-section">
      <h3>
        <span style={{ fontSize: 20 }}>{'\uD83E\uDD16'}</span>
        AI Generate {feature.shortName || feature.name}
      </h3>
      <div className="ai-form">
        {feature.generateFields?.map(f => (
          <div className="form-group" key={f.key} style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>{f.label}</label>
            {f.type === 'select' ? (
              <select
                value={formData[f.key] || ''}
                onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ padding: '10px 12px' }}
              >
                <option value="">Any</option>
                {f.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                value={formData[f.key] || ''}
                onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ padding: '10px 12px' }}
              />
            )}
          </div>
        ))}
      </div>
      <button
        className="btn btn-ai btn-lg"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
            Generating with AI...
          </>
        ) : (
          <>Generate with AI</>
        )}
      </button>

      {aiResult && (
        <div className="ai-output">
          <div className="ai-header">
            <div className="ai-icon">{'\u2728'}</div>
            <h4>AI Generated Result - Saved Successfully</h4>
          </div>
          {Object.entries(aiResult).map(([key, value]) => {
            if (ignoredKeys.includes(key)) return null;
            return renderAIValue(key, value);
          })}
        </div>
      )}
    </div>
  );
}
