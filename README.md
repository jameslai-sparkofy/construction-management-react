# 建築工序管理系統 - React 版本

這是原始 HTML 建築工序管理系統的 React 重構版本，提供更好的組件化架構和可擴展性。

## 功能特色

### 已實現功能 ✅
- **專案管理**: 創建、查看、刪除專案
- **工序管理**: 新增、編輯、刪除工序任務
- **基本視圖**: 列表視圖顯示所有工序
- **狀態管理**: 使用 React Context 進行全局狀態管理
- **資料模型**: 完整的 Project 和 Task 資料結構
- **測試數據**: 一鍵生成測試專案和工序

### 開發中功能 🚧
- **甘特圖視圖**: 泳道式甘特圖顯示
- **日曆視圖**: 工序日曆排程
- **看板視圖**: 按工程類別和進度狀態分組
- **拖拉排序**: 工序順序調整
- **排程計算**: 自動計算工期和日期

### 計劃功能 📋
- **CRM/ERP 整合**: 資料庫連接和 API 接口
- **多用戶支持**: 用戶權限管理
- **報表生成**: PDF/Excel 導出
- **行動端適配**: 響應式設計優化

## 技術架構

### 前端技術
- **React 18**: 主要框架
- **React Context**: 狀態管理
- **CSS3**: 樣式設計（保持原始視覺風格）

### 資料結構
```javascript
// Project 結構
{
  id, name, description, startDate,
  skipSaturday, skipSunday, tasks[],
  createdAt, updatedAt
}

// Task 結構  
{
  id, projectId, category, name, duration,
  cost, price, profit, order,
  startDate, endDate, status
}
```

### 組件架構
```
App
├── Header (標題和視圖切換)
├── Sidebar
│   ├── ProjectList (專案列表)
│   └── ProjectForm (新增專案表單)
└── ContentArea
    ├── TaskList (任務列表)
    ├── TaskForm (新增任務表單)
    └── [其他視圖組件開發中...]
```

## 安裝和運行

### 1. 安裝依賴
```bash
cd construction-management-react
npm install
```

### 2. 啟動開發服務器
```bash
npm start
```

應用將在 http://localhost:3000 打開

### 3. 建議的測試流程
1. 點擊「生成測試專案」按鈕創建範例數據
2. 在專案列表中選擇專案
3. 查看工序列表，測試新增/刪除功能
4. 嘗試不同的視圖切換（目前只有列表視圖完整）

## 開發指南

### 新增視圖組件
1. 在 `src/components/Views/` 創建新組件
2. 在 `TaskList.js` 中添加視圖條件渲染
3. 更新 `types/index.js` 中的 VIEW_TYPES

### 資料庫整合準備
- Project 和 Task 類別已包含 id 字段用於資料庫主鍵
- 支持 createdAt/updatedAt 時間戳
- 預留 projectId 外鍵關聯

### API 接口設計
```javascript
// 建議的 API 端點
GET    /api/projects          // 獲取專案列表
POST   /api/projects          // 創建專案
PUT    /api/projects/:id      // 更新專案
DELETE /api/projects/:id      // 刪除專案

GET    /api/projects/:id/tasks  // 獲取專案任務
POST   /api/projects/:id/tasks  // 創建任務
PUT    /api/tasks/:id           // 更新任務
DELETE /api/tasks/:id           // 刪除任務
```

## 與原始 HTML 版本的差異

### 優勢
- **組件化**: 更好的代碼組織和重用性
- **狀態管理**: 統一的數據流管理
- **類型安全**: 明確的資料模型定義
- **可擴展性**: 易於添加新功能和視圖
- **測試友好**: 組件化便於單元測試

### 保持一致
- **視覺設計**: 完全保持原始 CSS 樣式
- **功能邏輯**: 相同的業務邏輯和計算方式
- **用戶體驗**: 一致的操作流程

## 下一步開發計劃

1. **完成視圖組件** (甘特圖、日曆、看板)
2. **實作拖拉排序功能**
3. **添加工序排程計算邏輯**
4. **建立後端 API 接口**
5. **整合資料庫 (MySQL/PostgreSQL)**
6. **CRM/ERP 系統整合**

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

開發時請遵循：
- 使用 ESLint 代碼規範
- 組件名稱使用 PascalCase
- 文件名稱使用 camelCase
- 提交信息使用中文描述