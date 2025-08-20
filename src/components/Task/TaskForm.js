import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CATEGORIES } from '../../types/index.js';

function TaskForm({ projectId, onClose }) {
  const { actions } = useProject();
  const [formData, setFormData] = useState({
    category: 'water-electric',
    name: '',
    duration: 1,
    cost: 0,
    price: 0
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('請輸入工序名稱');
      return;
    }

    if (formData.duration < 1) {
      alert('工作天數必須大於0');
      return;
    }

    actions.addTask(projectId, formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>新增工序</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="category">工程類別</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {Object.entries(CATEGORIES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="name">工序名稱 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="輸入工序名稱"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="duration">工作天數 *</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="cost">成本 (元)</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                placeholder="成本"
              />
            </div>
            <div className="input-group">
              <label htmlFor="price">售價 (元)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                placeholder="售價"
              />
            </div>
          </div>

          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>利潤預覽: NT$ {(formData.price - formData.cost).toLocaleString()}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-success">
              ✅ 新增工序
            </button>
            <button type="button" className="btn" onClick={onClose}>
              ❌ 取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;