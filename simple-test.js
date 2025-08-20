const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 訪問網站...');
    await page.goto('https://construction-management-c6e.pages.dev', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // 截圖看看網站狀態
    await page.screenshot({ path: 'website-state.png', fullPage: true });
    console.log('📸 已保存網站狀態截圖');
    
    // 檢查頁面標題
    const title = await page.title();
    console.log('📄 頁面標題:', title);
    
    // 列出所有可見的按鈕
    const buttons = await page.locator('button').all();
    console.log(`🔘 發現 ${buttons.length} 個按鈕`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`  ${i + 1}. "${text}" (可見: ${isVisible})`);
    }
    
    // 檢查是否有專案列表
    const projects = await page.locator('.project-item, .project-card').all();
    console.log(`📂 發現 ${projects.length} 個專案`);
    
    // 檢查導航菜單
    const navItems = await page.locator('nav a, .nav-item').all();
    console.log(`🧭 發現 ${navItems.length} 個導航項目`);
    
    // 等待10秒讓我們觀察
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await browser.close();
  }
}

simpleTest();