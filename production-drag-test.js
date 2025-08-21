const { chromium } = require('playwright');

async function productionDragTest() {
  console.log('🚀 開始測試生產環境的拖拽功能...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    const productionUrl = 'https://construction-management-c6e.pages.dev';
    console.log('🌐 打開生產網址:', productionUrl);
    
    await page.goto(productionUrl);
    await page.waitForTimeout(3000);
    
    console.log('🎯 點擊測試甘特圖...');
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    console.log('📋 生產環境已開啟，請手動執行以下步驟：');
    console.log('');
    console.log('=== 測試步驟 ===');
    console.log('1. 如果顯示"請先創建一個專案"，點擊左側"新增專案"');
    console.log('2. 填寫專案名稱（如：拖拽測試專案）和開始日期（如：2025-08-21）');
    console.log('3. 保存專案後，點擊"新增工序"添加幾個任務：');
    console.log('   - 任務1：配電箱安裝，水電工程，工期3天');
    console.log('   - 任務2：電路佈線，水電工程，工期5天');
    console.log('   - 任務3：給水管路，水電工程，工期4天');
    console.log('4. 回到"🧪 測試甘特圖"頁面');
    console.log('5. 🖱️ 嘗試拖拽任務條：');
    console.log('   - 點擊並按住任務條');
    console.log('   - 向右拖拽移動位置');
    console.log('   - 放開鼠標');
    console.log('   - 觀察任務條是否彈回原位');
    console.log('6. 🔄 檢查持久化：刷新頁面，看位置是否保存');
    console.log('');
    console.log('=== 檢查項目 ===');
    console.log('✅ 工程類別欄是否變寬且橫向顯示');
    console.log('✅ 日期是否顯示月份（如：8/21）');
    console.log('✅ 拖拽功能是否正常（不彈回）');
    console.log('✅ 拖拽後位置是否持久保存');
    console.log('');
    console.log('⚠️  請在瀏覽器中手動測試');
    console.log('⌨️  測試完成後按 Ctrl+C 結束');
    
    // 監聽控制台消息
    page.on('console', msg => {
      if (msg.text().includes('拖拽') || msg.text().includes('drag')) {
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

productionDragTest();
