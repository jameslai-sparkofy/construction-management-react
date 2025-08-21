import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import Header from './components/Header/Header';
import ProjectList from './components/Project/ProjectList';
import TaskList from './components/Task/TaskList';
import ProjectForm from './components/Project/ProjectForm';
import ErrorBoundary from './components/Common/ErrorBoundary';
import VersionInfo from './components/Common/VersionInfo';
import TestGantt from './TestGantt';
import './App.css';

function App() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTestGantt, setShowTestGantt] = useState(false);

  return (
    <ErrorBoundary>
      <ProjectProvider>
        <div className="App">
          <Header />
          
          <div className="main-container">
            {/* 側邊欄 */}
            <div className="sidebar" role="complementary" aria-label="專案管理側邊欄">
              {/* 專案管理區 */}
              <div className="control-section">
                <h3 id="project-management-title">📂 專案管理</h3>
                <button 
                  className="btn btn-success" 
                  onClick={() => setShowProjectForm(true)}
                  aria-describedby="project-management-title"
                >
                  ➕ 新增專案
                </button>
                
                <button 
                  className="btn btn-info" 
                  onClick={() => setShowTestGantt(!showTestGantt)}
                  style={{ marginTop: '10px' }}
                >
                  🧪 測試甘特圖
                </button>
                
                {showProjectForm && (
                  <ProjectForm onClose={() => setShowProjectForm(false)} />
                )}
                
                <ProjectList />
              </div>
            </div>

            {/* 主要內容區 */}
            <main className="content-area" role="main" aria-label="主要內容區域">
              {showTestGantt ? <TestGantt /> : <TaskList />}
            </main>
          </div>
          
          {/* 版本資訊 */}
          <VersionInfo />
        </div>
      </ProjectProvider>
    </ErrorBoundary>
  );
}

export default App;