import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { CATEGORIES } from '../../types/index.js';
import { formatDate } from '../../utils/scheduleCalculator';
import './Kanban.css';

function CategoryKanban() {
  const { getCurrentProject, actions } = useProject();
  const currentProject = getCurrentProject();

  if (!currentProject) {
    return (
      <div className="empty-state">
        <h3>請選擇專案</h3>
        <p>從左側專案列表選擇一個專案開始查看工程看板</p>
      </div>
    );
  }

  const createKanbanCard = (task) => {
    return (
      <div key={task.id} className="kanban-card">
        <div className="kanban-card-title">{task.name}</div>
        <div className="kanban-card-details">
          {task.duration}天<br />
          {task.startDate ? `${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}` : '尚未排程'}
        </div>
        <div className="kanban-card-financial">
          成本: NT$ {task.cost.toLocaleString()}<br />
          售價: NT$ {task.price.toLocaleString()}<br />
          <strong>利潤: NT$ {task.profit.toLocaleString()}</strong>
        </div>
        <div className="kanban-card-status">
          <span 
            className={`status-indicator ${task.status.replace('-', '')}`}
            onClick={() => changeTaskStatus(task.id)}
            title="點擊切換狀態"
          >
            {getStatusText(task.status)}
          </span>
        </div>
      </div>
    );
  };

  const changeTaskStatus = (taskId) => {
    const task = currentProject.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const statuses = ['planned', 'in-progress', 'completed', 'blocked'];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    actions.updateTask(currentProject.id, taskId, { status: nextStatus });
  };

  const getStatusText = (status) => {
    const statusMap = {
      'planned': '計劃中',
      'in-progress': '進行中',
      'completed': '已完成',
      'blocked': '阻塞'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="kanban-view">
      <div className="kanban-board">
        {Object.entries(CATEGORIES).map(([categoryKey, categoryName]) => {
          const categoryTasks = currentProject.tasks
            .filter(task => task.category === categoryKey)
            .sort((a, b) => a.order - b.order);

          return (
            <div key={categoryKey} className="kanban-column">
              <div className={`kanban-header ${categoryKey}`}>
                {categoryName}
              </div>
              <div className="kanban-content">
                {categoryTasks.length === 0 ? (
                  <div className="kanban-empty">
                    暫無{categoryName.replace(/.*\s/, '')}
                  </div>
                ) : (
                  categoryTasks.map(task => createKanbanCard(task))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryKanban;