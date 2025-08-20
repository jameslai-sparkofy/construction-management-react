import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import Header from './components/Header/Header';
import ProjectList from './components/Project/ProjectList';
import TaskList from './components/Task/TaskList';
import ProjectForm from './components/Project/ProjectForm';
import './App.css';

function App() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  return (
    <ProjectProvider>
      <div className="App">
        <Header />
        
        <div className="main-container">
          {/* 側邊欄 */}
          <div className="sidebar">
            {/* 專案管理區 */}
            <div className="control-section">
              <h3>📂 專案管理</h3>
              <button 
                className="btn btn-success" 
                onClick={() => setShowProjectForm(true)}
              >
                ➕ 新增專案
              </button>
              
              {showProjectForm && (
                <ProjectForm onClose={() => setShowProjectForm(false)} />
              )}
              
              <ProjectList />
            </div>
          </div>

          {/* 主要內容區 */}
          <div className="content-area">
            <TaskList />
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
}

export default App;