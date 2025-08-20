import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Project } from '../types/index.js';
import { saveProjects, loadProjects, saveCurrentProjectId, loadCurrentProjectId } from '../utils/localStorage.js';

// 初始狀態
const initialState = {
  projects: [],
  currentProjectId: null,
  currentView: 'list',
  loading: false,
  error: null
};

// Action 類型
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK', 
  DELETE_TASK: 'DELETE_TASK',
  REORDER_TASKS: 'REORDER_TASKS',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  GENERATE_TEST_DATA: 'GENERATE_TEST_DATA'
};

// Reducer
function projectReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ActionTypes.SET_PROJECTS:
      return { ...state, projects: action.payload, loading: false };
      
    case ActionTypes.ADD_PROJECT:
      return { 
        ...state, 
        projects: [...state.projects, action.payload],
        currentProjectId: action.payload.id
      };
      
    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
      
    case ActionTypes.DELETE_PROJECT:
      const updatedProjects = state.projects.filter(p => p.id !== action.payload);
      return {
        ...state,
        projects: updatedProjects,
        currentProjectId: state.currentProjectId === action.payload 
          ? (updatedProjects.length > 0 ? updatedProjects[0].id : null)
          : state.currentProjectId
      };
      
    case ActionTypes.SET_CURRENT_PROJECT:
      return { ...state, currentProjectId: action.payload };
      
    case ActionTypes.ADD_TASK:
      return {
        ...state,
        projects: state.projects.map(project => {
          if (project.id === action.payload.projectId) {
            const updatedProject = new Project(project);
            updatedProject.addTask(action.payload.taskData);
            return updatedProject;
          }
          return project;
        })
      };
      
    case ActionTypes.UPDATE_TASK:
      return {
        ...state,
        projects: state.projects.map(project => {
          if (project.id === action.payload.projectId) {
            const updatedProject = new Project({
              ...project,
              tasks: project.tasks.map(task => 
                task.id === action.payload.taskId 
                  ? { ...task, ...action.payload.updates }
                  : task
              )
            });
            updatedProject.updatedAt = new Date();
            return updatedProject;
          }
          return project;
        })
      };
      
    case ActionTypes.DELETE_TASK:
      return {
        ...state,
        projects: state.projects.map(project => {
          if (project.id === action.payload.projectId) {
            const updatedProject = new Project(project);
            updatedProject.removeTask(action.payload.taskId);
            return updatedProject;
          }
          return project;
        })
      };
      
    case ActionTypes.REORDER_TASKS:
      return {
        ...state,
        projects: state.projects.map(project => {
          if (project.id === action.payload.projectId) {
            const updatedProject = new Project(project);
            updatedProject.reorderTasks(action.payload.draggedId, action.payload.targetId);
            return updatedProject;
          }
          return project;
        })
      };
      
    case ActionTypes.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
      
    case ActionTypes.GENERATE_TEST_DATA:
      const testProject = createTestProject();
      return {
        ...state,
        projects: [...state.projects, testProject],
        currentProjectId: testProject.id
      };
      
    default:
      return state;
  }
}

// 創建測試專案
function createTestProject() {
  const testProject = new Project({
    name: '測試建築專案',
    description: '這是一個包含各類工程的測試專案',
    startDate: new Date()
  });

  const testTasks = [
    { category: 'water-electric', name: '配電箱安裝', duration: 2, cost: 15000, price: 22000, status: 'completed' },
    { category: 'water-electric', name: '電路配線', duration: 3, cost: 25000, price: 35000, status: 'completed' },
    { category: 'water-electric', name: '給水管路配置', duration: 2, cost: 18000, price: 28000, status: 'in-progress' },
    { category: 'water-electric', name: '排水管路安裝', duration: 2, cost: 16000, price: 24000, status: 'planned' },
    { category: 'water-electric', name: '電氣測試驗收', duration: 1, cost: 8000, price: 12000, status: 'planned' },
    
    { category: 'masonry', name: '牆面打毛處理', duration: 1, cost: 12000, price: 18000, status: 'planned' },
    { category: 'masonry', name: '水泥粉刷', duration: 4, cost: 32000, price: 48000, status: 'planned' },
    { category: 'masonry', name: '地磚鋪設', duration: 5, cost: 45000, price: 68000, status: 'planned' },
    { category: 'masonry', name: '牆磚貼附', duration: 3, cost: 28000, price: 42000, status: 'planned' },
    { category: 'masonry', name: '填縫收尾', duration: 2, cost: 15000, price: 22000, status: 'planned' },
    
    { category: 'carpentry', name: '天花板骨架', duration: 3, cost: 22000, price: 35000, status: 'planned' },
    { category: 'carpentry', name: '櫥櫃製作安裝', duration: 6, cost: 85000, price: 125000, status: 'planned' },
    { category: 'carpentry', name: '木地板安裝', duration: 4, cost: 55000, price: 78000, status: 'planned' },
    { category: 'carpentry', name: '門窗框製作', duration: 3, cost: 38000, price: 55000, status: 'planned' },
    { category: 'carpentry', name: '收邊條安裝', duration: 2, cost: 18000, price: 26000, status: 'planned' },
    
    { category: 'painting', name: '牆面批土', duration: 2, cost: 16000, price: 24000, status: 'planned' },
    { category: 'painting', name: '底漆塗刷', duration: 2, cost: 14000, price: 21000, status: 'planned' },
    { category: 'painting', name: '面漆塗刷', duration: 3, cost: 22000, price: 32000, status: 'planned' },
    { category: 'painting', name: '特殊塗料處理', duration: 2, cost: 18000, price: 28000, status: 'planned' },
    
    { category: 'flooring', name: '地面整平', duration: 2, cost: 20000, price: 30000, status: 'planned' },
    { category: 'flooring', name: '防潮層施作', duration: 1, cost: 12000, price: 18000, status: 'planned' },
    { category: 'flooring', name: '超耐磨地板', duration: 4, cost: 65000, price: 95000, status: 'planned' },
    { category: 'flooring', name: '踢腳板安裝', duration: 2, cost: 15000, price: 22000, status: 'planned' },
    { category: 'flooring', name: '清潔保養', duration: 1, cost: 8000, price: 12000, status: 'planned' }
  ];

  testTasks.forEach(taskData => {
    testProject.addTask(taskData);
  });

  return testProject;
}

// Context
const ProjectContext = createContext();

// Provider 組件
export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, {
    ...initialState,
    projects: loadProjects(),
    currentProjectId: loadCurrentProjectId()
  });
  
  // 自動保存數據到 localStorage
  useEffect(() => {
    saveProjects(state.projects);
  }, [state.projects]);
  
  useEffect(() => {
    saveCurrentProjectId(state.currentProjectId);
  }, [state.currentProjectId]);

  // Actions
  const actions = {
    setLoading: useCallback((loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, []),

    addProject: useCallback((projectData) => {
      const project = new Project(projectData);
      dispatch({ type: ActionTypes.ADD_PROJECT, payload: project });
      return project;
    }, []),

    updateProject: useCallback((projectId, updates) => {
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const updatedProject = new Project({ ...project, ...updates });
        dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: updatedProject });
      }
    }, [state.projects]),

    deleteProject: useCallback((projectId) => {
      dispatch({ type: ActionTypes.DELETE_PROJECT, payload: projectId });
    }, []),

    setCurrentProject: useCallback((projectId) => {
      dispatch({ type: ActionTypes.SET_CURRENT_PROJECT, payload: projectId });
    }, []),

    addTask: useCallback((projectId, taskData) => {
      dispatch({ 
        type: ActionTypes.ADD_TASK, 
        payload: { projectId, taskData } 
      });
    }, []),

    updateTask: useCallback((projectId, taskId, updates) => {
      dispatch({ 
        type: ActionTypes.UPDATE_TASK, 
        payload: { projectId, taskId, updates } 
      });
    }, []),

    deleteTask: useCallback((projectId, taskId) => {
      dispatch({ 
        type: ActionTypes.DELETE_TASK, 
        payload: { projectId, taskId } 
      });
    }, []),

    reorderTasks: useCallback((projectId, draggedId, targetId) => {
      dispatch({ 
        type: ActionTypes.REORDER_TASKS, 
        payload: { projectId, draggedId, targetId } 
      });
    }, []),

    setCurrentView: useCallback((view) => {
      dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view });
    }, []),

    generateTestData: useCallback(() => {
      dispatch({ type: ActionTypes.GENERATE_TEST_DATA });
    }, [])
  };

  // 取得當前專案
  const getCurrentProject = useCallback(() => {
    return state.projects.find(p => p.id === state.currentProjectId) || null;
  }, [state.projects, state.currentProjectId]);

  const value = {
    ...state,
    actions,
    getCurrentProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// Hook
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}