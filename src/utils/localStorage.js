// localStorage 數據持久化工具

const STORAGE_KEYS = {
  PROJECTS: 'construction_management_projects',
  CURRENT_PROJECT: 'construction_management_current_project',
  APP_VERSION: 'construction_management_version'
};

const CURRENT_VERSION = '1.0.0';

// 保存專案數據
export function saveProjects(projects) {
  try {
    const data = {
      projects: projects.map(project => ({
        ...project,
        // 序列化日期對象
        startDate: project.startDate ? project.startDate.toISOString() : null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        tasks: project.tasks.map(task => ({
          ...task,
          startDate: task.startDate ? task.startDate.toISOString() : null,
          endDate: task.endDate ? task.endDate.toISOString() : null
        }))
      })),
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存專案數據失敗:', error);
    return false;
  }
}

// 加載專案數據
export function loadProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    
    // 檢查版本兼容性
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('數據版本不兼容，清空本地數據');
      clearStorage();
      return [];
    }
    
    // 反序列化日期對象
    return parsed.projects.map(project => ({
      ...project,
      startDate: project.startDate ? new Date(project.startDate) : null,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
      tasks: project.tasks.map(task => ({
        ...task,
        startDate: task.startDate ? new Date(task.startDate) : null,
        endDate: task.endDate ? new Date(task.endDate) : null
      }))
    }));
  } catch (error) {
    console.error('加載專案數據失敗:', error);
    return [];
  }
}

// 保存當前選中的專案ID
export function saveCurrentProjectId(projectId) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId || '');
    return true;
  } catch (error) {
    console.error('保存當前專案ID失敗:', error);
    return false;
  }
}

// 加載當前選中的專案ID
export function loadCurrentProjectId() {
  try {
    const projectId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
    return projectId || null;
  } catch (error) {
    console.error('加載當前專案ID失敗:', error);
    return null;
  }
}

// 清空所有本地存儲
export function clearStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('清空本地存儲失敗:', error);
    return false;
  }
}

// 檢查 localStorage 是否可用
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

// 獲取存儲使用情況
export function getStorageInfo() {
  if (!isStorageAvailable()) {
    return { available: false };
  }
  
  try {
    let totalSize = 0;
    let itemCount = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage.getItem(key).length;
        itemCount++;
      }
    }
    
    return {
      available: true,
      totalSize,
      itemCount,
      projects: localStorage.getItem(STORAGE_KEYS.PROJECTS) ? 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)).projects?.length || 0 : 0
    };
  } catch (error) {
    return { available: true, error: error.message };
  }
}