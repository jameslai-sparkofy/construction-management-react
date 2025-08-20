// 排程計算輔助函數

// 檢查是否為工作日
export function isWorkingDay(date, skipSaturday = false, skipSunday = true) {
  const dayOfWeek = date.getDay();
  if (skipSunday && dayOfWeek === 0) return false;
  if (skipSaturday && dayOfWeek === 6) return false;
  return true;
}

// 計算專案排程
export function calculateProjectSchedule(tasks, projectStartDate, skipSaturday, skipSunday) {
  if (!projectStartDate || tasks.length === 0) return tasks;

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  let currentDate = new Date(projectStartDate);

  sortedTasks.forEach(task => {
    task.startDate = new Date(currentDate);
    
    let workDaysAdded = 0;
    let endDate = new Date(currentDate);
    
    while (workDaysAdded < task.duration) {
      if (isWorkingDay(endDate, skipSaturday, skipSunday)) {
        workDaysAdded++;
        if (workDaysAdded === task.duration) {
          break;
        }
      }
      endDate.setDate(endDate.getDate() + 1);
    }
    
    task.endDate = endDate;
    
    currentDate = new Date(endDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (!isWorkingDay(currentDate, skipSaturday, skipSunday)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return sortedTasks;
}

// 格式化日期
export function formatDate(date) {
  if (!date) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 獲取星期名稱
export function getWeekdayName(dayOfWeek) {
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  return names[dayOfWeek];
}

// 生成日期範圍
export function generateDateRange(startDate, endDate, maxDays = 60) {
  const dates = [];
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  for (let i = 0; i < Math.min(totalDays, maxDays); i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}