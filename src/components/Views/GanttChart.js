import React, { useMemo, useState, useRef } from 'react';
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
  const [dragState, setDragState] = useState(null);
  const ganttRef = useRef(null);

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

  // 拖拽處理函數
  const handleTaskMouseDown = (e, task, category) => {
    if (e.target.classList.contains('resize-handle')) return;
    
    const rect = ganttRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    
    setDragState({
      taskId: task.id,
      category,
      type: 'move',
      startX,
      startDay: Math.floor((task.startDate - currentProject.startDate) / (1000 * 60 * 60 * 24))
    });
    
    e.preventDefault();
  };

  const handleResizeStart = (e, task, direction) => {
    e.stopPropagation();
    
    const rect = ganttRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    
    setDragState({
      taskId: task.id,
      type: 'resize',
      direction,
      startX,
      originalDuration: task.duration
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;
    
    const rect = ganttRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const deltaX = currentX - dragState.startX;
    const deltaDays = Math.round(deltaX / 60);
    
    if (dragState.type === 'move') {
      const newStartDay = Math.max(0, dragState.startDay + deltaDays);
      if (newStartDay !== dragState.startDay) {
        // 這裡會在 handleMouseUp 時處理實際更新
      }
    } else if (dragState.type === 'resize') {
      // 預覽調整大小，實際更新在 handleMouseUp 時處理
    }
  };

  const handleMouseUp = async (e) => {
    if (!dragState) return;
    
    const rect = ganttRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const deltaX = currentX - dragState.startX;
    const deltaDays = Math.round(deltaX / 60);
    
    const task = scheduledTasks.find(t => t.id === dragState.taskId);
    if (!task) return;
    
    let updateNeeded = false;
    let newStartDate = task.startDate;
    let newDuration = task.duration;
    
    if (dragState.type === 'move' && deltaDays !== 0) {
      const newStartDay = Math.max(0, dragState.startDay + deltaDays);
      newStartDate = new Date(currentProject.startDate);
      newStartDate.setDate(newStartDate.getDate() + newStartDay);
      updateNeeded = true;
    } else if (dragState.type === 'resize') {
      if (dragState.direction === 'right') {
        newDuration = Math.max(1, dragState.originalDuration + deltaDays);
        updateNeeded = newDuration !== task.duration;
      } else if (dragState.direction === 'left') {
        newDuration = Math.max(1, dragState.originalDuration - deltaDays);
        const daysDiff = task.duration - newDuration;
        newStartDate = new Date(task.startDate);
        newStartDate.setDate(newStartDate.getDate() + daysDiff);
        updateNeeded = newDuration !== task.duration;
      }
    }
    
    if (updateNeeded) {
      // 檢查是否會影響後續任務
      const affectedTasks = scheduledTasks.filter(t => 
        t.order > task.order && 
        (newStartDate > task.startDate || newDuration !== task.duration)
      );
      
      if (affectedTasks.length > 0) {
        const shouldUpdateFollowing = window.confirm(
          `此變更會影響到 ${affectedTasks.length} 個後續任務的排程，是否一併調整？`
        );
        
        if (shouldUpdateFollowing) {
          // 更新當前任務
          actions.updateTask(currentProject.id, task.id, {
            duration: newDuration,
            startDate: newStartDate
          });
          
          // 重新計算所有任務排程
          setTimeout(() => {
            const updatedProject = getCurrentProject();
            const rescheduledTasks = calculateProjectSchedule(
              updatedProject.tasks,
              updatedProject.startDate,
              updatedProject.skipSaturday,
              updatedProject.skipSunday
            );
            
            rescheduledTasks.forEach(scheduledTask => {
              actions.updateTask(updatedProject.id, scheduledTask.id, {
                startDate: scheduledTask.startDate,
                endDate: scheduledTask.endDate
              });
            });
          }, 100);
        } else {
          // 只更新當前任務
          actions.updateTask(currentProject.id, task.id, {
            duration: newDuration,
            startDate: newStartDate
          });
        }
      } else {
        // 沒有影響其他任務，直接更新
        actions.updateTask(currentProject.id, task.id, {
          duration: newDuration,
          startDate: newStartDate
        });
      }
    }
    
    setDragState(null);
  };

  return (
    <div 
      className="gantt-container"
      ref={ganttRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setDragState(null)}
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
                  {date.getDate()}<br />
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
                  const startDay = Math.floor(
                    (task.startDate - currentProject.startDate) / (1000 * 60 * 60 * 24)
                  );
                  const endDay = Math.floor(
                    (task.endDate - currentProject.startDate) / (1000 * 60 * 60 * 24)
                  );
                  const duration = endDay - startDay + 1;

                  if (startDay < 0 || startDay >= dateRange.length) return null;

                  const width = Math.min(duration * 60, (dateRange.length - startDay) * 60);
                  const left = startDay * 60;

                  // 創建分段任務條，每個日期一個分段
                  const taskSegments = [];
                  for (let d = startDay; d <= endDay; d++) {
                    if (d >= 0 && d < dateRange.length) {
                      const date = dateRange[d];
                      const dayOfWeek = date.getDay();
                      const isWeekend = (currentProject.skipSunday && dayOfWeek === 0) || 
                                       (currentProject.skipSaturday && dayOfWeek === 6);
                      
                      const segmentLeft = (d - startDay) * 60;
                      const segmentWidth = 60;
                      const segmentOpacity = isWeekend ? 0.5 : 1;
                      
                      taskSegments.push(
                        <div
                          key={`${task.id}-segment-${d}`}
                          className="task-segment"
                          style={{
                            position: 'absolute',
                            left: `${segmentLeft}px`,
                            width: `${segmentWidth}px`,
                            height: '100%',
                            opacity: segmentOpacity,
                            background: 'inherit',
                            borderRadius: d === startDay ? '6px 0 0 6px' : d === endDay ? '0 6px 6px 0' : '0',
                          }}
                        />
                      );
                    }
                  }

                  return (
                    <div
                      key={task.id}
                      className={`gantt-task ${task.category} ${dragState?.taskId === task.id ? 'dragging' : ''}`}
                      style={{ 
                        left: `${left}px`, 
                        width: `${width}px`,
                        background: 'transparent' // 讓分段背景顯示
                      }}
                      title={`${task.name}\n${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}\n${task.duration}天 | 成本: NT$ ${task.cost.toLocaleString()} | 售價: NT$ ${task.price.toLocaleString()}`}
                      onMouseDown={(e) => handleTaskMouseDown(e, task, category)}
                    >
                      {/* 背景分段 */}
                      {taskSegments}
                      
                      {/* 控制手柄 */}
                      <div className="resize-handle left" onMouseDown={(e) => handleResizeStart(e, task, 'left')} />
                      <div className="resize-handle right" onMouseDown={(e) => handleResizeStart(e, task, 'right')} />
                      
                      {/* 任務名稱 */}
                      <div style={{ 
                        position: 'relative', 
                        zIndex: 2, 
                        width: '100%', 
                        textAlign: 'center',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
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