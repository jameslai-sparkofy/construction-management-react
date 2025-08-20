# Cloudflare Pages 部署指南

## 自動部署方法（推薦）

### 1. 準備 Git 倉庫
```bash
# 在專案根目錄初始化 git
git init
git add .
git commit -m "Initial commit: React 建築工序管理系統"

# 推送到 GitHub/GitLab（需要先在平台上創建倉庫）
git remote add origin https://github.com/your-username/construction-management-react.git
git push -u origin main
```

### 2. 連接 Cloudflare Pages
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 選擇 **Pages** > **Create a project**
3. 選擇 **Connect to Git**
4. 授權並選擇你的倉庫
5. 設定構建配置：
   - **Framework preset**: Create React App
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/`

### 3. 部署設定
Cloudflare Pages 會自動檢測到這是 React 應用並使用正確設定：
- Node.js 版本: 18.x（自動檢測）
- 包管理器: npm（自動檢測）

## 手動部署方法

### 1. 本地構建
```bash
cd construction-management-react
npm install
npm run build
```

### 2. 手動上傳
1. 登入 Cloudflare Dashboard
2. Pages > Create a project > Upload assets
3. 拖拽整個 `build` 文件夾到上傳區域
4. 設定專案名稱，例如：`construction-management`
5. 點擊 **Create Pages project**

## 使用 Wrangler CLI 部署

### 1. 安裝 Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. 部署
```bash
cd construction-management-react
wrangler pages publish build --project-name=construction-management
```

## 環境變數設定（如需要）

如果未來需要 API 端點等環境變數，在 Cloudflare Pages 設定：

1. 進入專案設定頁面
2. 選擇 **Settings** > **Environment variables**
3. 添加變數：
   ```
   REACT_APP_API_URL=https://your-api-domain.com
   REACT_APP_ENV=production
   ```

## 自定義域名設定

1. 在專案設定中選擇 **Custom domains**
2. 點擊 **Set up a custom domain**
3. 輸入你的域名並按照指示設定 DNS

## 效能優化建議

### CDN 設定
Cloudflare Pages 自動提供全球 CDN，無需額外配置。

### 快取設定
靜態資源自動快取，`_redirects` 文件確保 SPA 路由正常工作。

### 壓縮
Gzip 和 Brotli 壓縮自動啟用。

## 預期結果

部署成功後，你會得到一個類似的 URL：
```
https://construction-management.pages.dev
```

或者如果設定了自定義域名：
```
https://your-domain.com
```

## 功能驗證清單

部署完成後請測試：

- [ ] 應用正常載入
- [ ] 可以創建新專案
- [ ] 可以生成測試數據
- [ ] 專案列表正常顯示
- [ ] 任務管理功能正常
- [ ] 視圖切換功能（列表視圖完整，其他視圖顯示開發中訊息）
- [ ] 響應式設計在不同設備上正常

## 疑難排解

### 常見問題

1. **白屏問題**
   - 檢查瀏覽器開發者工具的錯誤訊息
   - 確認 `_redirects` 文件存在於 build 目錄

2. **路由不工作**
   - 確認 `_redirects` 內容正確：`/*    /index.html   200`

3. **構建失敗**
   - 檢查 Node.js 版本兼容性
   - 清理 node_modules 重新安裝：`rm -rf node_modules && npm install`

4. **靜態資源載入問題**
   - 檢查 package.json 中的 homepage 設定
   - 確認資源路徑正確

## 後續開發

當新功能開發完成後：
1. 本地測試
2. 提交到 git
3. 推送到遠程倉庫
4. Cloudflare Pages 會自動構建並部署新版本

## 監控和分析

可以在 Cloudflare Dashboard 中查看：
- 部署歷史
- 分析數據
- 錯誤日誌
- 效能指標