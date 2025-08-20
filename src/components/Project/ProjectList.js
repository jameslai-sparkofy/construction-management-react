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

  // 計算專案統計的輔助函數
  const calculateStats = (project) => {
    if (typeof project.getStats === 'function') {
      return project.getStats();
    }
    
    // 如果不是 Project 類實例，手動計算統計
    const totalTasks = project.tasks ? project.tasks.length : 0;
    const totalCost = project.tasks ? project.tasks.reduce((sum, task) => sum + (task.cost || 0), 0) : 0;
    const totalPrice = project.tasks ? project.tasks.reduce((sum, task) => sum + (task.price || 0), 0) : 0;
    const totalProfit = totalPrice - totalCost;

    let totalDays = 0;
    let endDate = null;

    if (project.tasks && project.tasks.length > 0 && project.startDate) {
      const sortedTasks = [...project.tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
      const lastTask = sortedTasks[sortedTasks.length - 1];
      
      if (lastTask && lastTask.endDate) {
        const start = new Date(project.startDate);
        const end = new Date(lastTask.endDate);
        totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        endDate = end;
      }
    }

    return {
      totalTasks,
      totalCost,
      totalPrice, 
      totalProfit,
      totalDays,
      endDate
    };
  };

  return (
    <div className="project-list">
      {projects.map(project => {
        const stats = calculateStats(project);
        
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