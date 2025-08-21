import React from 'react';
import { useProject } from './context/ProjectContext';
import GanttChart from './components/Views/GanttChart';

const TestGantt = () => {
  const { getCurrentProject } = useProject();
  const currentProject = getCurrentProject();
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>🧪 甘特圖測試</h2>
      <p>測試欄位對齊、透明度效果和拖拽功能</p>
      
      {currentProject ? (
        <div style={{ 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          overflow: 'hidden',
          marginTop: '20px',
          height: '600px'
        }}>
          <GanttChart />
        </div>
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>📋 請先創建一個專案來測試甘特圖</h3>
          <p>點擊左側的「新增專案」按鈕，創建一個專案並添加一些任務，然後再回到這個測試頁面。</p>
          <p>專案需要設定開始日期和至少一個任務才能顯示甘特圖。</p>
        </div>
      )}
    </div>
  );
};

export default TestGantt;