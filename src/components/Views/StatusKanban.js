import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { CATEGORIES } from '../../types/index.js';
import { formatDate } from '../../utils/scheduleCalculator';
import './Kanban.css';

function StatusKanban() {
  const { getCurrentProject, actions } = useProject();
  const currentProject = getCurrentProject();

  if (!currentProject) {
    return (
      <div className="empty-state">
        <h3>請選擇專案</h3>
        <p>從左側專案列表選擇一個專案開始查看進度看板</p>
      </div>
    );
  }

  const createKanbanCard = (task) => {
    return (
      <div key={task.id} className="kanban-card" onClick={() => changeTaskStatus(task.id)}>
        <div className="kanban-card-title">{task.name}</div>
        <div className="kanban-card-details">
          {CATEGORIES[task.category]} | {task.duration}天<br />
          {task.startDate ? `${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}` : '尚未排程'}
        </div>
        <div className="kanban-card-financial">
          成本: NT$ {task.cost.toLocaleString()}<br />
          售價: NT$ {task.price.toLocaleString()}<br />
          <strong>利潤: NT$ {task.profit.toLocaleString()}</strong>
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

  const statusColumns = [
    { key: 'planned', title: '📋 計劃中', className: 'planned' },
    { key: 'in-progress', title: '🔄 進行中', className: 'in-progress' },
    { key: 'completed', title: '✅ 已完成', className: 'completed' },
    { key: 'blocked', title: '⚠️ 阻塞', className: 'blocked' }
  ];

  return (
    <div className="kanban-view">
      <div className="view-header">
        <h2>📋 進度看板 - {currentProject.name}</h2>
      </div>
      <div className="kanban-board">
        {statusColumns.map(column => {
          const columnTasks = currentProject.tasks.filter(task => task.status === column.key);

          return (
            <div key={column.key} className="kanban-column">
              <div className={`kanban-header ${column.className}`}>
                {column.title}
                <span className="task-count">({columnTasks.length})</span>
              </div>
              <div className="kanban-content">
                {columnTasks.length === 0 ? (
                  <div className="kanban-empty">
                    暫無任務
                  </div>
                ) : (
                  columnTasks.map(task => createKanbanCard(task))
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="kanban-help">
        💡 提示：點擊任務卡片可以切換狀態
      </div>
    </div>
  );
}

export default StatusKanban;