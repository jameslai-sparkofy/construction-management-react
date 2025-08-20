import React, { useMemo } from 'react';
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
  const { getCurrentProject } = useProject();
  const currentProject = getCurrentProject();

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

  return (
    <div className="gantt-container">
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

                  const width = Math.min(duration * 40, (dateRange.length - startDay) * 40);
                  const left = startDay * 40;

                  return (
                    <div
                      key={task.id}
                      className={`gantt-task ${task.category}`}
                      style={{ 
                        left: `${left}px`, 
                        width: `${width}px` 
                      }}
                      title={`${task.name}\n${formatDate(task.startDate)} ~ ${formatDate(task.endDate)}\n${task.duration}天 | 成本: NT$ ${task.cost.toLocaleString()} | 售價: NT$ ${task.price.toLocaleString()}`}
                    >
                      {task.name}
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