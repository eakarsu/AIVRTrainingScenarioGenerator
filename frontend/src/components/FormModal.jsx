import { useState } from 'react';

export default function FormModal({ feature, item, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const data = {};
      feature.formFields.forEach(f => {
        let val = item[f.key];
        if (val === true) val = 'true';
        if (val === false) val = 'false';
        data[f.key] = val ?? '';
      });
      return data;
    }
    const data = {};
    feature.formFields.forEach(f => { data[f.key] = ''; });
    return data;
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processed = { ...formData };
    feature.formFields.forEach(f => {
      if (f.type === 'number' && processed[f.key] !== '') {
        processed[f.key] = Number(processed[f.key]);
      }
      if (f.key === 'passed' || f.key === 'renewalRequired') {
        processed[f.key] = processed[f.key] === 'true';
      }
    });
    onSave(processed);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit' : 'New'} {feature.shortName || feature.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {feature.formFields.map(f => (
              <div className="form-group" key={f.key}>
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    required={f.required}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    required={f.required}
                  >
                    <option value="">Select...</option>
                    {f.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={formData[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
