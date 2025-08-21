import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CATEGORIES } from '../../types/index.js';
import { 
  calculateProjectSchedule, 
  generateDateRange, 
  formatDate, 
  getWeekdayName 
} from '../../utils/scheduleCalculator';
import './GanttChart.css';

function GanttChart() {
  const { getCurrentProject, actions } = useProject();
  const currentProject = getCurrentProject();
  const ganttRef = useRef(null);
  
  // 簡化的拖拽狀態
  const [isDragging, setIsDragging] = useState(false);
  
  // 純JavaScript拖拽實現
  useEffect(() => {
    const ganttContainer = ganttRef.current;
    if (!ganttContainer) return;

    let dragData = null;

    const handleMouseDown = (e) => {
      const taskElement = e.target.closest('.gantt-task');
      if (!taskElement) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const taskId = taskElement.dataset.taskId;
      const task = scheduledTasks.find(t => t.id === taskId);
      if (!task) return;

      const rect = ganttContainer.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      
      // 計算當前任務的startDay
      const projectStartDate = new Date(currentProject.startDate);
      const taskStartDate = new Date(task.startDate);
      projectStartDate.setHours(0, 0, 0, 0);
      taskStartDate.setHours(0, 0, 0, 0);
      const startDay = Math.floor((taskStartDate - projectStartDate) / (1000 * 60 * 60 * 24));

      dragData = {
        taskId,
        task,
        startX,
        startDay,
        originalLeft: parseInt(taskElement.style.left) || 0
      };

      setIsDragging(true);
      taskElement.style.zIndex = '1000';
      taskElement.style.opacity = '0.8';
      
      console.log('開始拖拽:', dragData);
    };

    const handleMouseMove = (e) => {
      if (!dragData) return;
      
      const rect = ganttContainer.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const deltaX = currentX - dragData.startX;
      const deltaDays = Math.round(deltaX / 60);
      const newLeft = Math.max(0, dragData.originalLeft + deltaX);
      
      const taskElement = ganttContainer.querySelector(`[data-task-id="${dragData.taskId}"]`);
      if (taskElement) {
        taskElement.style.left = newLeft + 'px';
        taskElement.style.transform = 'translateY(-50%) scale(1.02)';
      }
    };

    const handleMouseUp = (e) => {
      if (!dragData) return;
      
      const rect = ganttContainer.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const deltaX = currentX - dragData.startX;
      const deltaDays = Math.round(deltaX / 60);
      
      const taskElement = ganttContainer.querySelector(`[data-task-id="${dragData.taskId}"]`);
      if (taskElement) {
        taskElement.style.zIndex = '';
        taskElement.style.opacity = '';
        taskElement.style.transform = 'translateY(-50%)';
      }

      if (deltaDays !== 0) {
        // 計算新的開始日期
        const newStartDay = Math.max(0, dragData.startDay + deltaDays);
        const newStartDate = new Date(currentProject.startDate);
        newStartDate.setDate(newStartDate.getDate() + newStartDay);
        
        // 計算新的結束日期
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + dragData.task.duration - 1);

        console.log('更新任務位置:', {
          taskName: dragData.task.name,
          deltaDays,
          newStartDate: newStartDate.toISOString().split('T')[0],
          newEndDate: newEndDate.toISOString().split('T')[0]
        });

        try {
          actions.updateTask(currentProject.id, dragData.taskId, {
            startDate: newStartDate,
            endDate: newEndDate
          });
        } catch (error) {
          console.error('更新任務失敗:', error);
          // 恢復原位置
          if (taskElement) {
            taskElement.style.left = dragData.originalLeft + 'px';
          }
        }
      }

      dragData = null;
      setIsDragging(false);
    };

    // 添加事件監聽器
    ganttContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      ganttContainer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scheduledTasks, currentProject, actions]);

  const { scheduledTasks, dateRange } = useMemo(() => {
    if (!currentProject || !currentProject.startDate || currentProject.tasks.length === 0) {
      return { scheduledTasks: [], dateRange: [] };
    }

    const scheduled = calculateProjectSchedule(
      currentProject.tasks,
      currentProject.startDate,
      currentProject.skipSaturday,
      currentProject.skipSunday
    );

    const lastTask = scheduled[scheduled.length - 1];
    const endDate = lastTask?.endDate || currentProject.startDate;
    const dates = generateDateRange(currentProject.startDate, endDate);

    return { scheduledTasks: scheduled, dateRange: dates };
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="empty-state">
        <h3>請選擇專案</h3>
        <p>從左側專案列表選擇一個專案開始查看甘特圖</p>
      </div>
    );
  }

  if (!currentProject.startDate || currentProject.tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>請設定專案開始日期並新增工序</h3>
        <p>系統將自動產生泳道甘特圖</p>
      </div>
    );
  }

  if (scheduledTasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>排程計算中...</h3>
        <p>請稍候，正在計算工序排程</p>
      </div>
    );
  }

  const categories = [...new Set(scheduledTasks.map(t => t.category))];

  // 原本的拖拽函數已被純JavaScript實現替代



  return (
    <div 
      className="gantt-container"
      ref={ganttRef}
    >
      <div className="view-header">
        <h2>🏊‍♂️ 甘特圖 - {currentProject.name}</h2>
      </div>
      <div className="gantt-chart">
        {/* 甘特圖標題列 */}
        <div className="gantt-header">
          <div className="gantt-lane-header">工程類別</div>
          <div className="gantt-timeline">
            {dateRange.map((date, index) => {
              const dayOfWeek = date.getDay();
              const isWeekend = (currentProject.skipSunday && dayOfWeek === 0) || 
                               (currentProject.skipSaturday && dayOfWeek === 6);
              
              return (
                <div 
                  key={index} 
                  className={`gantt-day ${isWeekend ? 'weekend' : ''}`}
                >
                  {date.getMonth() + 1}/{date.getDate()}<br />
                  {getWeekdayName(dayOfWeek)}
                </div>
              );
            })}
          </div>
        </div>

        {/* 各工程類別的泳道 */}
        {categories.map(category => {
          const categoryTasks = scheduledTasks.filter(t => t.category === category);
          
          return (
            <div key={category} className="gantt-lane">
              <div className="gantt-lane-label">
                {CATEGORIES[category]}
              </div>
              <div className="gantt-lane-content">
                {/* 日期背景格子 */}
                {dateRange.map((date, index) => {
                  const dayOfWeek = date.getDay();
                  const isWeekend = (currentProject.skipSunday && dayOfWeek === 0) || 
                                   (currentProject.skipSaturday && dayOfWeek === 6);
                  
                  return (
                    <div 
                      key={index}
                      className={`gantt-day-column ${isWeekend ? 'weekend' : ''}`}
                    />
                  );
                })}

                {/* 任務條 */}
                {categoryTasks.map(task => {
                  const taskStartDate = new Date(task.startDate);
                  const taskEndDate = new Date(task.endDate);
                  const projectStartDate = new Date(currentProject.startDate);
                  
                  // 重置時間到午夜，避免時區問題
                  taskStartDate.setHours(0, 0, 0, 0);
                  taskEndDate.setHours(0, 0, 0, 0);
                  projectStartDate.setHours(0, 0, 0, 0);
                  
                  const startDay = Math.floor(
                    (taskStartDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const endDay = Math.floor(
                    (taskEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const duration = endDay - startDay + 1;

                  if (startDay < 0 || startDay >= dateRange.length) return null;

                  // 計算實際顯示位置和寬度（考慮拖拽狀態）
                  let displayLeft = startDay * 60;
                  let displayWidth = Math.min(duration * 60, (dateRange.length - startDay) * 60);
                  
                  // 純JavaScript拖拽不需要預覽狀態
                  
                  const width = displayWidth;
                  const left = displayLeft;

                  // 獲取任務分類的背景顏色
                  const getTaskBackground = (category) => {
                    switch(category) {
                      case 'water-electric': return 'linear-gradient(135deg, #00b894, #00a085)';
                      case 'masonry': return 'linear-gradient(135deg, #fd79a8, #e84393)';
                      case 'carpentry': return 'linear-gradient(135deg, #fdcb6e, #e17055)';
                      case 'painting': return 'linear-gradient(135deg, #74b9ff, #0984e3)';
                      case 'flooring': return 'linear-gradient(135deg, #a29bfe, #6c5ce7)';
                      default: return 'linear-gradient(135deg, #74b9ff, #0984e3)';
                    }
                  };

                  // 創建精準的透明分段 - 使用實際顯示的範圍
                  const taskSegments = [];
                  const taskBackground = getTaskBackground(task.category);
                  
                  // 簡化分段計算
                  let segmentStartDay = startDay;
                  let segmentEndDay = endDay;
                  
                  for (let d = segmentStartDay; d <= segmentEndDay; d++) {
                    if (d >= 0 && d < dateRange.length) {
                      const date = dateRange[d];
                      const dayOfWeek = date.getDay();
                      const isWeekend = (currentProject.skipSunday && dayOfWeek === 0) || 
                                       (currentProject.skipSaturday && dayOfWeek === 6);
                      
                      const segmentLeft = (d - segmentStartDay) * 60;
                      const segmentOpacity = isWeekend ? 0.5 : 1.0;
                      
                      taskSegments.push(
                        <div
                          key={`seg-${d}`}
                          style={{
                            position: 'absolute',
                            left: `${segmentLeft}px`,
                            width: '60px',
                            height: '100%',
                            opacity: segmentOpacity,
                            background: taskBackground,
                            borderRadius: d === segmentStartDay && d === segmentEndDay ? '6px' :
                                         d === segmentStartDay ? '6px 0 0 6px' :
                                         d === segmentEndDay ? '0 6px 6px 0' : '0'
                          }}
                        />
                      );
                    }
                  }

                  return (
                    <div
                      key={task.id}
                      data-task-id={task.id}
                      className={`gantt-task ${task.category} ${isDragging ? 'dragging' : ''}`}
                      style={{ 
                        left: `${left}px`, 
                        width: `${width}px`,
                        background: 'transparent',
                        cursor: 'grab',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: '24px',
                        userSelect: 'none'
                      }}
                      title={`${task.name}\n${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}\n${task.duration}天 | 成本: NT$ ${task.cost.toLocaleString()} | 售價: NT$ ${task.price.toLocaleString()}`}
                    >
                      {/* 分段背景 */}
                      {taskSegments}
                      
                      {/* 控制手柄暫時移除 */}
                      
                      {/* 任務文字 */}
                      <div style={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        pointerEvents: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>
                        {task.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GanttChart;