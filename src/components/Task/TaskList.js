import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CATEGORIES, TASK_STATUS } from '../../types/index.js';
import TaskForm from './TaskForm';

function TaskList() {
  const { currentProjectId, getCurrentProject, currentView, actions } = useProject();
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const currentProject = getCurrentProject();

  if (!currentProject) {
    return (
      <div className="empty-state">
        <h3>請選擇專案</h3>
        <p>從左側專案列表選擇一個專案，或建立新專案開始管理工序</p>
      </div>
    );
  }

  if (currentView === 'list') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📝 工序列表 - {currentProject.name}</h2>
          <div>
            <button 
              className="btn btn-success"
              onClick={() => setShowTaskForm(true)}
              style={{ marginRight: '10px' }}
            >
              ➕ 新增工序
            </button>
            <button 
              className="btn btn-warning"
              onClick={() => updateProjectSchedule(currentProject)}
            >
              🔄 更新排程
            </button>
          </div>
        </div>

        {showTaskForm && (
          <TaskForm 
            projectId={currentProjectId}
            onClose={() => setShowTaskForm(false)} 
          />
        )}

        <TaskTable project={currentProject} />
      </div>
    );
  }

  // 其他視圖暫時顯示佔位符
  return (
    <div className="empty-state">
      <h3>{getViewTitle(currentView)} - {currentProject.name}</h3>
      <p>此視圖正在開發中...</p>
      <button 
        className="btn" 
        onClick={() => actions.setCurrentView('list')}
      >
        返回列表視圖
      </button>
    </div>
  );
}

function TaskTable({ project }) {
  const { actions } = useProject();
  
  if (project.tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>尚未新增工序</h3>
        <p>點擊「新增工序」按鈕開始建立專案工序</p>
      </div>
    );
  }

  const sortedTasks = [...project.tasks].sort((a, b) => a.order - b.order);

  return (
    <table className="list-table">
      <thead>
        <tr>
          <th>順序</th>
          <th>工序名稱</th>
          <th>工程類別</th>
          <th>天數</th>
          <th>成本</th>
          <th>售價</th>
          <th>利潤</th>
          <th>開始日期</th>
          <th>結束日期</th>
          <th>狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {sortedTasks.map((task, index) => (
          <tr key={task.id}>
            <td>{index + 1}</td>
            <td>{task.name}</td>
            <td>{CATEGORIES[task.category]}</td>
            <td>{task.duration}天</td>
            <td>NT$ {task.cost.toLocaleString()}</td>
            <td>NT$ {task.price.toLocaleString()}</td>
            <td style={{ color: task.profit >= 0 ? '#27ae60' : '#e74c3c' }}>
              NT$ {task.profit.toLocaleString()}
            </td>
            <td>{task.startDate ? formatDate(task.startDate) : '-'}</td>
            <td>{task.endDate ? formatDate(task.endDate) : '-'}</td>
            <td>
              <span 
                className={`status-badge status-${task.status.replace('-', '')}`}
                onClick={() => changeTaskStatus(project.id, task.id, task.status, actions)}
                style={{ cursor: 'pointer' }}
                title="點擊切換狀態"
              >
                {TASK_STATUS[task.status]}
              </span>
            </td>
            <td>
              <button
                className="btn-small"
                onClick={() => {
                  if (window.confirm('確定要刪除此工序嗎？')) {
                    actions.deleteTask(project.id, task.id);
                  }
                }}
              >
                刪除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function changeTaskStatus(projectId, taskId, currentStatus, actions) {
  const statuses = ['planned', 'in-progress', 'completed', 'blocked'];
  const currentIndex = statuses.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % statuses.length;
  const nextStatus = statuses[nextIndex];
  
  actions.updateTask(projectId, taskId, { status: nextStatus });
}

function formatDate(date) {
  if (!date) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getViewTitle(view) {
  const titles = {
    'gantt': '🏊‍♂️ 甘特圖',
    'calendar': '📅 日曆視圖',
    'kanban-category': '🏗️ 工程看板',
    'kanban-status': '📋 進度看板',
    'list': '📝 列表視圖'
  };
  return titles[view] || '未知視圖';
}

// 更新專案排程的輔助函數
function updateProjectSchedule(project) {
  // 這裡可以實作排程計算邏輯
  console.log('更新排程:', project);
  alert('排程更新功能即將實作！');
}

export default TaskList;