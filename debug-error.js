const { chromium } = require('playwright');

async function debugSystemError() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 開啟開發者工具來查看錯誤
  });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 訪問網站並檢查錯誤...');
    
    // 監聽瀏覽器控制台錯誤
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ 瀏覽器控制台錯誤:', msg.text());
      } else if (msg.type() === 'warn') {
        console.log('⚠️ 瀏覽器控制台警告:', msg.text());
      }
    });
    
    // 監聽頁面錯誤
    page.on('pageerror', error => {
      console.log('💥 頁面JavaScript錯誤:', error.message);
      console.log('錯誤堆疊:', error.stack);
    });
    
    // 監聽請求失敗
    page.on('requestfailed', request => {
      console.log('🚫 請求失敗:', request.url(), request.failure()?.errorText);
    });
    
    await page.goto('https://construction-management-c6e.pages.dev', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 等待一段時間讓錯誤顯示
    await page.waitForTimeout(3000);
    
    // 檢查是否有錯誤頁面
    const errorMessage = await page.locator('text="系統發生錯誤"').count();
    if (errorMessage > 0) {
      console.log('🚨 確認發現系統錯誤頁面');
      
      // 截圖錯誤頁面
      await page.screenshot({ path: 'system-error.png', fullPage: true });
      console.log('📸 已保存錯誤頁面截圖: system-error.png');
      
      // 檢查網頁標題
      const title = await page.title();
      console.log('📄 頁面標題:', title);
      
      // 檢查是否有任何可見的錯誤信息
      const errorDetails = await page.locator('.error-details, .error-message, .error-info').textContent().catch(() => '未找到詳細錯誤信息');
      console.log('📋 錯誤詳情:', errorDetails);
    } else {
      console.log('✅ 未發現系統錯誤頁面，網站可能正常');
      
      // 檢查是否能看到正常的頁面元素
      const buttons = await page.locator('button').count();
      console.log(`🔘 找到 ${buttons} 個按鈕`);
      
      const projectSection = await page.locator('text="專案管理"').count();
      console.log(`📂 專案管理區域: ${projectSection > 0 ? '存在' : '不存在'}`);
      
      // 截圖正常狀態
      await page.screenshot({ path: 'normal-state.png', fullPage: true });
      console.log('📸 已保存正常狀態截圖: normal-state.png');
    }
    
    // 檢查 VersionInfo 組件是否加載
    const versionInfo = await page.locator('.version-info').count();
    console.log(`🏷️ 版本資訊組件: ${versionInfo > 0 ? '存在' : '不存在'}`);
    
    // 等待更長時間來觀察任何延遲加載的錯誤
    console.log('⏳ 等待觀察是否有延遲錯誤...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('🔥 測試過程中發生錯誤:', error);
    
    // 即使發生錯誤也要截圖
    try {
      await page.screenshot({ path: 'debug-error.png', fullPage: true });
      console.log('📸 已保存調試錯誤截圖: debug-error.png');
    } catch (e) {
      console.log('無法保存截圖');
    }
  } finally {
    await browser.close();
  }
}

debugSystemError();