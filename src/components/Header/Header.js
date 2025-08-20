import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { VIEW_TYPES } from '../../types/index.js';

function Header() {
  const { currentView, actions } = useProject();

  return (
    <div className="header">
      <h1>🏗️ 建築工序管理系統</h1>
      <div className="view-tabs">
        {Object.entries(VIEW_TYPES).map(([viewKey, viewName]) => (
          <button
            key={viewKey}
            className={`tab-btn ${currentView === viewKey ? 'active' : ''}`}
            onClick={() => actions.setCurrentView(viewKey)}
          >
            {getViewIcon(viewKey)} {viewName}
          </button>
        ))}
      </div>
    </div>
  );
}

function getViewIcon(viewType) {
  const icons = {
    'gantt': '🏊‍♂️',
    'calendar': '📅',
    'kanban-category': '🏗️',
    'kanban-status': '📋',
    'list': '📝'
  };
  return icons[viewType] || '📄';
}

export default Header;