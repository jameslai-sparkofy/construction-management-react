# 🚀 Cloudflare Pages 自動部署設定

## GitHub 倉庫
**倉庫地址**: https://github.com/jameslai-sparkofy/construction-management-react

## 自動部署設定步驟

### 1. 登入 Cloudflare Dashboard
前往 [Cloudflare Dashboard](https://dash.cloudflare.com)

### 2. 創建 Pages 項目
1. 點擊左側選單的 **Pages**
2. 點擊 **Create a project**
3. 選擇 **Connect to Git**

### 3. 連接 GitHub 倉庫
1. 授權 Cloudflare 存取你的 GitHub 帳戶
2. 選擇倉庫：`jameslai-sparkofy/construction-management-react`
3. 點擊 **Begin setup**

### 4. 配置建置設定
**項目名稱**: `construction-management` (或你喜歡的名稱)

**建置設定**:
- **Framework preset**: `Create React App`
- **Build command**: `npm run build`
- **Build output directory**: `build`
- **Root directory (advanced)**: `/` (預設)

**環境變數** (目前不需要):
暫時留空，未來整合 API 時可添加

### 5. 部署設定
- **Production branch**: `main`
- **Preview deployments**: 啟用 (推薦)

### 6. 完成部署
點擊 **Save and Deploy**

## 預期結果

### 部署 URL
部署成功後會獲得類似的 URL：
```
https://construction-management-[random].pages.dev
```

### 自動部署觸發條件
- 推送到 `main` 分支 → 生產環境部署
- 推送到其他分支 → 預覽環境部署
- Pull Request → 自動建立預覽環境

## 驗證部署成功

### 功能檢查清單
訪問部署 URL 後請驗證：

- [ ] 🏠 首頁正常載入，顯示系統標題
- [ ] 📂 可以點擊「生成測試專案」創建範例數據
- [ ] ✅ 測試專案顯示在左側專案列表
- [ ] 🔄 可以選擇專案，右側顯示工序列表
- [ ] ➕ 「新增專案」和「新增工序」按鈕正常工作
- [ ] 📊 工序統計數據正確顯示（成本、售價、利潤）
- [ ] 🏷️ 點擊狀態標籤可以切換工序狀態
- [ ] 📱 響應式設計在手機/平板上正常顯示
- [ ] 🔀 視圖切換功能正常（目前只有列表視圖完整）

### 範例測試數據
生成的測試專案包含：
- **25個工序項目**分布在5個工程類別
- **水電工程**: 5項（配電箱、電路、給排水等）
- **泥作工程**: 5項（打毛、粉刷、地磚等）  
- **木工工程**: 5項（天花板、櫥櫃、地板等）
- **油漆工程**: 4項（批土、底漆、面漆等）
- **地板工程**: 5項（整平、防潮、地板等）

### 效能指標
- **首次載入**: < 2秒
- **Lighthouse 分數**: 90+ (效能、SEO、最佳實踐)
- **全球 CDN**: 自動啟用
- **HTTPS**: 自動配置

## 自定義域名 (可選)

### 設定步驟
1. 在 Pages 項目設定中選擇 **Custom domains**
2. 點擊 **Set up a custom domain**
3. 輸入你的域名 (例如: `construction.yourdomain.com`)
4. 按照指示更新 DNS 設定

### DNS 設定範例
如果你的域名是 `yourdomain.com`：
```
# 子域名設定
construction    CNAME    construction-management-[random].pages.dev

# 或根域名設定
@    CNAME    construction-management-[random].pages.dev
```

## 監控和維護

### Cloudflare Analytics
在項目儀表板可以查看：
- 訪問量統計
- 效能指標
- 錯誤率
- 地理分布

### 部署歷史
- 查看所有部署記錄
- 回滾到之前版本
- 比較不同版本差異

### 預覽環境
每個 Pull Request 會自動創建預覽環境，方便測試新功能。

## 未來更新流程

### 開發新功能
```bash
# 創建新功能分支
git checkout -b feature/gantt-chart

# 開發並提交
git add .
git commit -m "Add gantt chart view"
git push origin feature/gantt-chart

# 創建 Pull Request (會自動建立預覽環境)
gh pr create --title "新增甘特圖視圖" --body "實作甘特圖功能"
```

### 發布到生產環境
```bash
# 合併到主分支
gh pr merge --squash

# 或直接推送到 main
git checkout main
git merge feature/gantt-chart
git push origin main
```

Cloudflare Pages 會自動檢測推送並重新部署。

## 疑難排解

### 常見問題

**1. 建置失敗**
- 檢查 `package.json` 中的 scripts
- 確認 Node.js 版本兼容性 (預設使用 Node 18)

**2. 靜態資源載入問題**
- 確認 `_redirects` 文件存在於 build 目錄
- 檢查 SPA 路由設定

**3. 環境變數問題**
- 確認變數名稱以 `REACT_APP_` 開頭
- 在 Cloudflare Pages 設定中正確配置

**4. 部署成功但無法訪問**
- 檢查 DNS 傳播狀態
- 確認 Cloudflare 代理狀態

### 支援管道
- Cloudflare Support: [support.cloudflare.com](https://support.cloudflare.com)
- GitHub Issues: 在倉庫中創建 Issue
- 文檔: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)

---

🎉 **準備就緒！現在可以前往 Cloudflare Dashboard 開始自動部署設定。**