const { chromium } = require('playwright');

async function testVersionInfo() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000 // 慢動作執行
  });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 詳細檢查 VersionInfo 組件...');
    
    // 監聽所有錯誤
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        console.log(`${type === 'error' ? '❌' : '⚠️'} [${type}]:`, msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('💥 頁面錯誤:', error.message);
      if (error.stack) {
        console.log('錯誤堆疊:', error.stack);
      }
    });
    
    await page.goto('https://construction-management-c6e.pages.dev', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('⏳ 等待頁面完全加載...');
    await page.waitForTimeout(5000);
    
    // 檢查頁面狀態
    const title = await page.title();
    console.log('📄 頁面標題:', title);
    
    // 檢查是否有錯誤頁面
    const hasError = await page.locator('text="系統發生錯誤"').count() > 0;
    console.log('🚨 是否顯示系統錯誤:', hasError);
    
    if (hasError) {
      console.log('發現系統錯誤頁面，截圖保存...');
      await page.screenshot({ path: 'error-found.png', fullPage: true });
      return;
    }
    
    // 檢查 VersionInfo 組件
    const versionInfo = page.locator('.version-info');
    const versionExists = await versionInfo.count() > 0;
    console.log('🏷️ VersionInfo 組件存在:', versionExists);
    
    if (versionExists) {
      // 檢查組件內容
      const commitHashExists = await page.locator('.version-info .version-value a').count() > 0;
      const timeExists = await page.locator('.version-info .version-value').nth(1).count() > 0;
      
      console.log('🔧 Commit hash 連結存在:', commitHashExists);
      console.log('📅 時間顯示存在:', timeExists);
      
      // 獲取實際顯示的內容
      if (commitHashExists) {
        const commitText = await page.locator('.version-info .version-value a').textContent();
        console.log('🔗 顯示的 commit:', commitText);
      }
      
      if (timeExists) {
        const timeText = await page.locator('.version-info .version-value').nth(1).textContent();
        console.log('⏰ 顯示的時間:', timeText);
      }
    }
    
    // 嘗試強制刷新頁面來測試
    console.log('🔄 強制刷新頁面測試...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const hasErrorAfterRefresh = await page.locator('text="系統發生錯誤"').count() > 0;
    console.log('🚨 刷新後是否顯示系統錯誤:', hasErrorAfterRefresh);
    
    // 測試清除緩存後的狀態
    console.log('🧹 清除緩存並重新測試...');
    const context = page.context();
    await context.clearCookies();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const hasErrorAfterClearCache = await page.locator('text="系統發生錯誤"').count() > 0;
    console.log('🚨 清除緩存後是否顯示系統錯誤:', hasErrorAfterClearCache);
    
    // 最終截圖
    await page.screenshot({ path: 'final-state.png', fullPage: true });
    console.log('📸 已保存最終狀態截圖');
    
    // 保持瀏覽器開啟供觀察
    console.log('👀 保持瀏覽器開啟10秒供觀察...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('🔥 測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

testVersionInfo();