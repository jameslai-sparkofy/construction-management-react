import React from 'react';
import { useProject } from '../../context/ProjectContext';

function ProjectList() {
  const { projects, currentProjectId, actions } = useProject();

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <h3>尚未建立專案</h3>
        <p>請點擊上方「新增專案」按鈕建立第一個專案</p>
        <button 
          className="btn btn-warning" 
          onClick={actions.generateTestData}
          style={{ marginTop: '15px' }}
        >
          🧪 生成測試專案
        </button>
      </div>
    );
  }

  return (
    <div className="project-list">
      {projects.map(project => {
        const stats = project.getStats();
        
        return (
          <div
            key={project.id}
            className={`project-item ${currentProjectId === project.id ? 'active' : ''}`}
            onClick={() => actions.setCurrentProject(project.id)}
          >
            <div className="project-info">
              <div className="project-name">{project.name}</div>
              <div className="project-details">
                {project.description && (
                  <>
                    {project.description}<br />
                  </>
                )}
                工序: {stats.totalTasks}個 | 
                預算: NT$ {stats.totalPrice.toLocaleString()} |
                利潤: NT$ {stats.totalProfit.toLocaleString()}
                {stats.endDate && (
                  <><br />預計完工: {formatDate(stats.endDate)}</>
                )}
              </div>
            </div>
            <div className="project-actions">
              <button
                className="btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('確定要刪除此專案嗎？這將刪除所有相關工序。')) {
                    actions.deleteProject(project.id);
                  }
                }}
              >
                刪除
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(date) {
  if (!date) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default ProjectList;