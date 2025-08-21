const { chromium } = require('playwright');

async function realDragTest() {
  console.log('🚀 開始真正的拖拽測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 打開頁面: http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    console.log('🎯 點擊測試甘特圖...');
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    console.log('📋 瀏覽器已開啟，請手動執行以下步驟：');
    console.log('1. 如果顯示"請先創建一個專案"，點擊左側"新增專案"');
    console.log('2. 填寫專案名稱和開始日期（如：2025-08-21）');
    console.log('3. 保存專案後，點擊"新增工序"添加幾個任務');
    console.log('4. 回到"🧪 測試甘特圖"頁面');
    console.log('5. 嘗試拖拽任務條，看看是否會彈回');
    console.log('6. 檢查拖拽後是否保存（可以刷新頁面驗證）');
    console.log('');
    console.log('⚠️  請在瀏覽器中手動測試拖拽功能');
    console.log('⌨️  按 Ctrl+C 結束測試');
    
    // 添加控制台監聽來查看拖拽調試信息
    page.on('console', msg => {
      if (msg.text().includes('拖拽')) {
        console.log('🔍 拖拽調試:', msg.text());
      }
    });
    
    // 保持瀏覽器開啟
    while (true) {
      await page.waitForTimeout(1000);
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

realDragTest();
