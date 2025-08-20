# 🚀 GitHub Actions 自動部署到 Cloudflare Pages 設定指南

## 已完成的設定

### ✅ GitHub Actions Workflow
- 檔案位置: `.github/workflows/deploy.yml`
- 觸發條件: 推送到 `main` 分支或 Pull Request
- 自動構建和部署流程

## 🔧 需要手動設定的部分

### 1. 取得 Cloudflare API Token

#### 步驟 A: 登入 Cloudflare Dashboard
前往 [Cloudflare Dashboard](https://dash.cloudflare.com)

#### 步驟 B: 創建 API Token
1. 點擊右上角用戶頭像 → **My Profile**
2. 選擇 **API Tokens** 頁籤
3. 點擊 **Create Token**
4. 使用 **Custom token** 模板

#### 步驟 C: 設定 Token 權限
```
Token name: GitHub Actions Cloudflare Pages
Permissions:
  - Account - Cloudflare Pages:Edit
  - Zone - Zone Settings:Read
  - Zone - Zone:Read

Account Resources:
  - Include - All accounts (或選擇特定帳戶)

Zone Resources:
  - Include - All zones (或選擇特定域名)
```

5. 點擊 **Continue to summary** → **Create Token**
6. **複製並保存** Token（只會顯示一次！）

### 2. 取得 Cloudflare Account ID

#### 方法 A: 從 Dashboard 取得
1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 右側欄
2. 找到 **Account ID** 並複製

#### 方法 B: 使用 Wrangler CLI
```bash
wrangler whoami
```

### 3. 在 GitHub 設定 Secrets

#### 前往 GitHub Repository Settings
1. 開啟 https://github.com/jameslai-sparkofy/construction-management-react
2. 點擊 **Settings** 頁籤
3. 左側選單選擇 **Secrets and variables** → **Actions**

#### 新增 Repository Secrets
點擊 **New repository secret** 並添加：

**Secret 1:**
```
Name: CLOUDFLARE_API_TOKEN
Value: [你剛才複製的 API Token]
```

**Secret 2:**
```
Name: CLOUDFLARE_ACCOUNT_ID  
Value: [你的 Cloudflare Account ID]
```

## 🎯 部署流程

### 自動觸發條件
- ✅ **推送到 main 分支** → 生產環境部署
- ✅ **Pull Request to main** → 預覽環境部署
- ✅ **手動觸發** → Actions 頁面手動執行

### 部署步驟 (自動執行)
1. **Checkout** 程式碼
2. **Setup Node.js 18**
3. **npm ci** 安裝依賴
4. **npm run build** 構建應用
5. **Deploy** 到 Cloudflare Pages

### 預期執行時間
- 總時間: ~2-3 分鐘
- 構建: ~1-2 分鐘  
- 部署: ~30 秒

## 🔍 監控和驗證

### GitHub Actions
- 前往 **Actions** 頁籤查看部署狀態
- 每次 commit 都會觸發新的 workflow
- 可以查看詳細的構建日誌

### Cloudflare Pages Dashboard  
- 前往 [Cloudflare Pages](https://dash.cloudflare.com/pages)
- 查看 `construction-management` 專案
- 監控部署歷史和效能

### 部署 URL
部署成功後會獲得：
- **生產環境**: `https://construction-management.pages.dev`
- **預覽環境**: `https://<branch-name>.construction-management.pages.dev`

## ⚡ 首次部署步驟

### 方法 A: 推送觸發自動部署
```bash
cd "/mnt/c/claude/通用工程開發軟體/construction-management-react"

# 添加 GitHub Actions 配置
git add .github/workflows/deploy.yml GITHUB_ACTIONS_SETUP.md
git commit -m "Setup GitHub Actions for Cloudflare Pages deployment

- 自動構建和部署 workflow
- 支援 main 分支和 PR 部署  
- 使用 Cloudflare Pages Action"

git push origin main
```

### 方法 B: 手動觸發部署
1. 前往 GitHub Repository
2. **Actions** 頁籤
3. 選擇 **Deploy to Cloudflare Pages** workflow
4. 點擊 **Run workflow**

## 🛠️ 高級設定 (可選)

### 環境變數設定
如果需要環境變數，在 workflow 中添加：
```yaml
- name: Build application
  run: npm run build
  env:
    REACT_APP_API_URL: ${{ secrets.API_URL }}
    REACT_APP_ENV: production
```

### 多環境部署
```yaml
# 為不同分支設定不同專案
- name: Deploy to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: ${{ github.ref == 'refs/heads/main' && 'construction-management' || 'construction-management-dev' }}
    directory: build
```

### 自定義域名
在 Cloudflare Pages 專案設定中：
1. **Custom domains** → **Set up a custom domain**
2. 輸入域名並更新 DNS 設定

## 🐛 疑難排解

### 常見錯誤及解決方法

**1. API Token 權限不足**
```
Error: Authentication error (10000)
```
解決方法: 確認 Token 有 `Cloudflare Pages:Edit` 權限

**2. Account ID 錯誤**  
```
Error: Account ID is invalid
```
解決方法: 重新複製正確的 Account ID

**3. 專案名稱衝突**
```
Error: Project name already exists
```
解決方法: 修改 `deploy.yml` 中的 `projectName`

**4. 構建失敗**
```
Error: Build failed
```
解決方法: 檢查 `package.json` scripts 和依賴

### Debug 步驟
1. 檢查 Actions 日誌詳細錯誤
2. 確認 Secrets 設定正確
3. 驗證 API Token 權限
4. 本地測試 `npm run build`

## 📊 效能監控

### Cloudflare Analytics
- 訪問量和地理分布
- 效能指標 (TTFB, FCP, LCP)
- 錯誤率監控

### GitHub Insights
- 部署頻率統計
- 成功率追蹤
- 構建時間趨勢

---

## ✅ 完成清單

設定完成後請確認：

- [ ] Cloudflare API Token 已創建並複製
- [ ] GitHub Secrets 已正確設定
- [ ] 推送程式碼觸發自動部署
- [ ] 部署成功並獲得 URL
- [ ] 訪問 URL 驗證應用功能正常

**🎉 設定完成後，每次推送到 main 分支都會自動部署到 Cloudflare Pages！**