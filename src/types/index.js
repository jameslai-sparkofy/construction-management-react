// 工程類別定義
export const CATEGORIES = {
  'water-electric': '💧 水電工程',
  'masonry': '🧱 泥作工程', 
  'carpentry': '🪵 木工工程',
  'painting': '🎨 油漆工程',
  'flooring': '🏠 地板工程'
};

// 工序狀態定義
export const TASK_STATUS = {
  'planned': '計劃中',
  'in-progress': '進行中', 
  'completed': '已完成',
  'blocked': '阻塞'
};

// 視圖類型
export const VIEW_TYPES = {
  'gantt': '甘特圖',
  'calendar': '日曆',
  'kanban-category': '工程看板',
  'kanban-status': '進度看板',
  'list': '列表'
};

// Task 資料模型
export class Task {
  constructor({
    id = null,
    projectId = null,
    category = 'water-electric',
    name = '',
    duration = 1,
    cost = 0,
    price = 0,
    order = 0,
    startDate = null,
    endDate = null,
    status = 'planned'
  }) {
    this.id = id || this.generateId();
    this.projectId = projectId;
    this.category = category;
    this.name = name;
    this.duration = duration;
    this.cost = cost;
    this.price = price;
    this.profit = price - cost;
    this.order = order;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 更新利潤計算
  updateProfit() {
    this.profit = this.price - this.cost;
  }
}

// Project 資料模型  
export class Project {
  constructor({
    id = null,
    name = '',
    description = '',
    startDate = null,
    skipSaturday = false,
    skipSunday = true,
    tasks = [],
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.skipSaturday = skipSaturday;
    this.skipSunday = skipSunday;
    this.tasks = tasks;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 獲取專案統計
  getStats() {
    const totalTasks = this.tasks.length;
    const totalCost = this.tasks.reduce((sum, task) => sum + task.cost, 0);
    const totalPrice = this.tasks.reduce((sum, task) => sum + task.price, 0);
    const totalProfit = totalPrice - totalCost;

    let totalDays = 0;
    let endDate = null;

    if (this.tasks.length > 0 && this.startDate) {
      const sortedTasks = [...this.tasks].sort((a, b) => a.order - b.order);
      const lastTask = sortedTasks[sortedTasks.length - 1];
      
      if (lastTask && lastTask.endDate) {
        totalDays = Math.ceil((lastTask.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
        endDate = lastTask.endDate;
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
  }

  // 新增工序
  addTask(taskData) {
    const task = new Task({
      ...taskData,
      projectId: this.id,
      order: this.tasks.length
    });
    this.tasks.push(task);
    this.updatedAt = new Date();
    return task;
  }

  // 移除工序
  removeTask(taskId) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    const deletedOrder = this.tasks[taskIndex].order;
    this.tasks.splice(taskIndex, 1);

    // 重新排序
    this.tasks.forEach(task => {
      if (task.order > deletedOrder) {
        task.order--;
      }
    });

    this.updatedAt = new Date();
    return true;
  }

  // 重新排序工序
  reorderTasks(draggedId, targetId) {
    const draggedTask = this.tasks.find(t => t.id === draggedId);
    const targetTask = this.tasks.find(t => t.id === targetId);
    
    if (!draggedTask || !targetTask) return false;
    
    const draggedOrder = draggedTask.order;
    const targetOrder = targetTask.order;
    
    if (draggedOrder < targetOrder) {
      this.tasks.forEach(task => {
        if (task.order > draggedOrder && task.order <= targetOrder) {
          task.order--;
        }
      });
      draggedTask.order = targetOrder;
    } else {
      this.tasks.forEach(task => {
        if (task.order >= targetOrder && task.order < draggedOrder) {
          task.order++;
        }
      });
      draggedTask.order = targetOrder;
    }
    
    this.updatedAt = new Date();
    return true;
  }
}