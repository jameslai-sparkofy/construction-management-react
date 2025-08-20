import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

function ProjectForm({ onClose }) {
  const { actions } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    skipSaturday: false,
    skipSunday: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('請輸入專案名稱');
      return;
    }

    const projectData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : null
    };

    actions.addProject(projectData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>新增專案</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">專案名稱 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="輸入專案名稱"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">專案描述</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="輸入專案描述（可選）"
            />
          </div>

          <div className="input-group">
            <label htmlFor="startDate">專案開始日期</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>不排工日設定</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', fontWeight: 'normal' }}>
                <input
                  type="checkbox"
                  name="skipSaturday"
                  checked={formData.skipSaturday}
                  onChange={handleChange}
                />
                週六
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', fontWeight: 'normal' }}>
                <input
                  type="checkbox"
                  name="skipSunday"
                  checked={formData.skipSunday}
                  onChange={handleChange}
                />
                週日
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-success">
              ✅ 建立專案
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

export default ProjectForm;