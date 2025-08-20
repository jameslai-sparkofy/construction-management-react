const { chromium } = require('playwright');

async function testWebsite() {
  console.log('🚀 開始測試建築工序管理系統...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 前往網站
    console.log('📱 載入網站...');
    await page.goto('https://construction-management-c6e.pages.dev/', { waitUntil: 'networkidle' });
    
    // 檢查標題
    const title = await page.title();
    console.log(`📄 網站標題: ${title}`);
    
    // 檢查主要元素是否存在
    console.log('🔍 檢查主要元素...');
    
    const header = await page.locator('.header h1').textContent();
    console.log(`📋 頁面標題: ${header}`);
    
    // 檢查視圖切換按鈕
    const viewTabs = await page.locator('.view-tabs .tab-btn').count();
    console.log(`🔄 視圖標籤數量: ${viewTabs}`);
    
    // 測試生成測試數據按鈕
    console.log('🧪 測試生成測試數據功能...');
    const testDataButton = page.locator('button:has-text("生成測試專案")');
    
    if (await testDataButton.count() > 0) {
      await testDataButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 測試數據生成按鈕點擊成功');
      
      // 檢查是否有專案出現
      const projectItems = await page.locator('.project-item').count();
      console.log(`📂 專案數量: ${projectItems}`);
      
      if (projectItems > 0) {
        // 點擊第一個專案
        await page.locator('.project-item').first().click();
        await page.waitForTimeout(500);
        console.log('✅ 專案選擇成功');
        
        // 檢查任務列表
        const tasks = await page.locator('.list-table tbody tr').count();
        console.log(`📋 任務數量: ${tasks}`);
      }
    }
    
    // 測試所有視圖
    const views = ['gantt', 'calendar', 'kanban-category', 'kanban-status', 'list'];
    
    for (const view of views) {
      console.log(`📊 測試 ${view} 視圖...`);
      
      // 點擊對應的視圖標籤
      const viewButton = page.locator(`.tab-btn:has-text("${getViewName(view)}")`);
      if (await viewButton.count() > 0) {
        await viewButton.click();
        await page.waitForTimeout(1000);
        
        // 檢查視圖是否正確載入
        const activeView = await page.locator('.view.active, .gantt-container, .calendar-view, .kanban-view').count();
        console.log(`  ${activeView > 0 ? '✅' : '❌'} ${view} 視圖載入${activeView > 0 ? '成功' : '失敗'}`);
        
        // 截圖保存
        await page.screenshot({ path: `/tmp/${view}-view.png` });
        console.log(`  📸 ${view} 視圖截圖已保存`);
      }
    }
    
    // 測試響應式設計
    console.log('📱 測試響應式設計...');
    
    // 手機視口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/mobile-view.png' });
    console.log('📱 手機視圖截圖已保存');
    
    // 平板視口
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/tablet-view.png' });
    console.log('📱 平板視圖截圖已保存');
    
    // 桌面視口
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // 檢查錯誤
    console.log('🐛 檢查控制台錯誤...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 控制台錯誤: ${msg.text()}`);
      }
    });
    
    // 效能測試
    console.log('⚡ 效能測試...');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
        firstContentfulPaint: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0)
      };
    });
    
    console.log('📊 效能指標:');
    console.log(`  載入時間: ${performanceMetrics.loadTime}ms`);
    console.log(`  DOM載入: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`  首次繪製: ${performanceMetrics.firstPaint}ms`);
    console.log(`  首次內容繪製: ${performanceMetrics.firstContentfulPaint}ms`);
    
    console.log('✅ 測試完成！');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
  } finally {
    await browser.close();
  }
}

function getViewName(view) {
  const viewNames = {
    'gantt': '甘特圖',
    'calendar': '日曆',
    'kanban-category': '工程看板',
    'kanban-status': '進度看板',
    'list': '列表'
  };
  return viewNames[view] || view;
}

testWebsite();