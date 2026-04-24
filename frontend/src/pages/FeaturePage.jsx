import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFeature } from '../config/features';
import FormModal from '../components/FormModal';
import AIGenerateSection from '../components/AIGenerateSection';

export default function FeaturePage({ addToast }) {
  const { featureKey } = useParams();
  const navigate = useNavigate();
  const feature = getFeature(featureKey);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, [featureKey]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await feature.api.getAll();
      setItems(res.data);
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await feature.api.update(editItem.id, formData);
        addToast('Updated successfully', 'success');
      } else {
        await feature.api.create(formData);
        addToast('Created successfully', 'success');
      }
      setShowModal(false);
      setEditItem(null);
      loadItems();
    } catch (err) {
      addToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await feature.api.delete(id);
      addToast('Deleted successfully', 'success');
      loadItems();
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  const handleEdit = (item, e) => {
    e.stopPropagation();
    setEditItem(item);
    setShowModal(true);
  };

  const handleAIGenerated = () => {
    addToast('AI scenario generated and saved!', 'success');
    loadItems();
  };

  if (!feature) return <div>Feature not found</div>;

  const renderCellValue = (item, col) => {
    let val = item[col.key];
    if (val === null || val === undefined) return '-';

    if (col.type === 'status') {
      const cls = `status-${val}`.toLowerCase();
      return <span className={`status-badge ${cls}`}>{val}</span>;
    }
    if (col.type === 'difficulty') {
      const cls = `difficulty-${val}`.toLowerCase();
      return <span className={`status-badge ${cls}`}>{val}</span>;
    }
    if (col.type === 'severity') {
      const cls = `severity-${val}`.toLowerCase();
      return <span className={`status-badge ${cls}`}>{val}</span>;
    }
    if (col.type === 'boolean') {
      return <span className={`status-badge ${val ? 'status-passed' : 'status-failed'}`}>{val ? 'Yes' : 'No'}</span>;
    }
    if (col.type === 'date') {
      return val ? new Date(val).toLocaleDateString() : '-';
    }
    if (col.type === 'number') {
      return typeof val === 'number' ? val.toLocaleString() : val;
    }
    if (col.suffix) {
      return `${val}${col.suffix}`;
    }
    return String(val).length > 40 ? String(val).substring(0, 40) + '...' : String(val);
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          <button className="back-btn" onClick={() => navigate('/')}>&larr;</button>
          <span style={{ fontSize: '28px' }}>{feature.icon}</span>
          {feature.name}
        </h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
            + New Item
          </button>
        </div>
      </div>

      {feature.isAI && (
        <AIGenerateSection feature={feature} onGenerated={handleAIGenerated} addToast={addToast} />
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading data...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{feature.icon}</div>
          <h3>No items yet</h3>
          <p>Create your first item or generate one with AI</p>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                {feature.columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => navigate(`/feature/${featureKey}/${item.id}`)}>
                  {feature.columns.map(col => (
                    <td key={col.key}>{renderCellValue(item, col)}</td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={(e) => handleEdit(item, e)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={(e) => handleDelete(item.id, e)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <FormModal
          feature={feature}
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}
