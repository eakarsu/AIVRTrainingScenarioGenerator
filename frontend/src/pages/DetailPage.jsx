import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFeature } from '../config/features';
import FormModal from '../components/FormModal';

export default function DetailPage({ addToast }) {
  const { featureKey, id } = useParams();
  const navigate = useNavigate();
  const feature = getFeature(featureKey);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadItem();
  }, [featureKey, id]);

  const loadItem = async () => {
    setLoading(true);
    try {
      const res = await feature.api.getOne(id);
      setItem(res.data);
    } catch (err) {
      addToast('Failed to load item', 'error');
      navigate(`/feature/${featureKey}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await feature.api.delete(id);
      addToast('Deleted successfully', 'success');
      navigate(`/feature/${featureKey}`);
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      await feature.api.update(id, formData);
      addToast('Updated successfully', 'success');
      setShowModal(false);
      loadItem();
    } catch (err) {
      addToast('Update failed', 'error');
    }
  };

  if (!feature) return <div>Feature not found</div>;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading details...</p>
      </div>
    );
  }

  if (!item) return <div>Item not found</div>;

  const renderSection = (section) => {
    if (section.type === 'text') {
      const val = item[section.key];
      if (!val) return null;
      return (
        <div className="detail-section" key={section.key}>
          <h3>{section.label}</h3>
          <p>{val}</p>
        </div>
      );
    }

    if (section.type === 'tags') {
      const val = item[section.key];
      if (!val || (Array.isArray(val) && val.length === 0)) return null;
      const tags = Array.isArray(val) ? val : [val];
      return (
        <div className="detail-section" key={section.key}>
          <h3>{section.label}</h3>
          <div className="tags-list">
            {tags.map((tag, i) => (
              <span key={i} className="tag">{typeof tag === 'object' ? JSON.stringify(tag) : tag}</span>
            ))}
          </div>
        </div>
      );
    }

    if (section.type === 'steps') {
      const val = item[section.key];
      if (!val || !Array.isArray(val)) return null;
      return (
        <div className="detail-section" key={section.key}>
          <h3>{section.label}</h3>
          <ul className="steps-list">
            {val.map((step, i) => (
              <li key={i}>
                <div className="step-number">{step.stepNumber || i + 1}</div>
                <div className="step-content">
                  <h4>{step.action || step.title || `Step ${i + 1}`}</h4>
                  <p>{step.details || step.description || ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (section.type === 'grid') {
      return (
        <div className="detail-section" key={section.label}>
          <h3>{section.label}</h3>
          <div className="detail-grid">
            {section.fields.map(field => {
              let val = item[field.key];
              if (val === null || val === undefined) val = '-';
              if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
              if (field.suffix && val !== '-') val = `${val}${field.suffix}`;
              return (
                <div className="detail-field" key={field.key}>
                  <div className="field-label">{field.label}</div>
                  <div className="field-value">{String(val)}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const title = item.title || item.certificationName || item.traineeName || item.moduleName || 'Detail';
  const aiGenerated = item.aiGenerated || item.aiAnalyzed;

  return (
    <div className="detail-page">
      <div className="page-header">
        <h1>
          <button className="back-btn" onClick={() => navigate(`/feature/${featureKey}`)}>&larr;</button>
          <span style={{ fontSize: '28px' }}>{feature.icon}</span>
          {feature.shortName || feature.name}
        </h1>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <h2>{title}</h2>
          <div className="detail-meta">
            {aiGenerated && <span style={{ color: '#c4b5fd' }}>AI Generated</span>}
            <span>ID: {item.id}</span>
            {item.createdAt && <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>}
          </div>
        </div>

        <div className="detail-body">
          {feature.detailSections.map(renderSection)}
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/feature/${featureKey}`)}>
            Back to List
          </button>
        </div>
      </div>

      {showModal && (
        <FormModal
          feature={feature}
          item={item}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
