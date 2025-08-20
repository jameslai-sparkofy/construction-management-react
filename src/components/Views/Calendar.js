import React, { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CATEGORIES } from '../../types/index.js';
import { calculateProjectSchedule } from '../../utils/scheduleCalculator';
import './Calendar.css';

function Calendar() {
  const { getCurrentProject } = useProject();
  const currentProject = getCurrentProject();
  const [currentDate, setCurrentDate] = useState(new Date());

  const scheduledTasks = useMemo(() => {
    if (!currentProject || !currentProject.startDate || currentProject.tasks.length === 0) {
      return [];
    }

    return calculateProjectSchedule(
      currentProject.tasks,
      currentProject.startDate,
      currentProject.skipSaturday,
      currentProject.skipSunday
    );
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="empty-state">
        <h3>請選擇專案</h3>
        <p>從左側專案列表選擇一個專案開始查看日曆</p>
      </div>
    );
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 0) {
      setCurrentDate(new Date());
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
      setCurrentDate(newDate);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay();
    
    const calendarDays = [];

    // 前一個月的日期
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
      calendarDays.push(createCalendarDay(date, true));
    }

    // 當前月份的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      calendarDays.push(createCalendarDay(date, false));
    }

    // 填滿剩餘格子
    const totalCells = Math.ceil(calendarDays.length / 7) * 7;
    const remainingCells = totalCells - calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      calendarDays.push(createCalendarDay(date, true));
    }

    return calendarDays;
  };

  const createCalendarDay = (date, isOtherMonth) => {
    const dayTasks = scheduledTasks.filter(task => {
      if (!task.startDate || !task.endDate) return false;
      const taskStart = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
      const taskEnd = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate());
      const currentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return currentDay >= taskStart && currentDay <= taskEnd;
    });

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return {
      date,
      isOtherMonth,
      isWeekend,
      tasks: dayTasks
    };
  };

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const calendarDays = renderCalendar();

  return (
    <div className="calendar-view">
      <div className="view-header">
        <h2>📅 日曆視圖 - {currentProject.name}</h2>
      </div>
      <div className="calendar-header">
        <h3>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
        <div className="calendar-nav">
          <button onClick={() => navigateMonth(-1)}>‹ 上月</button>
          <button onClick={() => navigateMonth(0)}>今天</button>
          <button onClick={() => navigateMonth(1)}>下月 ›</button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* 星期標題 */}
        {weekdays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {/* 日期格子 */}
        {calendarDays.map((dayData, index) => (
          <div
            key={index}
            className={`calendar-day ${dayData.isOtherMonth ? 'other-month' : ''} ${dayData.isWeekend ? 'weekend' : ''}`}
          >
            <div className="calendar-day-number">
              {dayData.date.getDate()}
            </div>
            
            {dayData.tasks.map(task => (
              <div
                key={task.id}
                className={`calendar-task ${task.category}`}
                title={`${task.name} - ${CATEGORIES[task.category]}`}
              >
                {task.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;