const { chromium } = require('playwright');

async function testGantt() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 開始測試甘特圖...');
    
    // 訪問頁面
    console.log('📱 打開頁面: http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 點擊測試甘特圖按鈕
    console.log('🎯 點擊測試甘特圖按鈕...');
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(3000);
    
    // 截圖
    console.log('📸 截圖甘特圖...');
    await page.screenshot({ 
      path: 'gantt-test-final.png',
      fullPage: true 
    });
    
    // 檢查甘特圖功能
    console.log('🔍 檢查甘特圖元素...');
    
    // 1. 檢查對齊
    const categoryLabels = await page.$$('.gantt-lane-label');
    const dateCells = await page.$$('.gantt-day');
    
    if (categoryLabels.length > 0 && dateCells.length > 0) {
      const categoryWidth = await categoryLabels[0].evaluate(el => el.offsetWidth);
      const dateWidth = await dateCells[0].evaluate(el => el.offsetWidth);
      console.log(`📏 類別欄寬度: ${categoryWidth}px`);
      console.log(`📏 日期欄寬度: ${dateWidth}px`);
      console.log(`✅ 對齊檢查: ${categoryWidth === dateWidth ? '已對齊' : '未對齊'}`);
    }
    
    // 2. 檢查任務條
    const taskBars = await page.$$('.gantt-task');
    console.log(`📊 找到 ${taskBars.length} 個任務條`);
    
    if (taskBars.length > 0) {
      // 檢查透明度分段
      const firstTask = taskBars[0];
      const segments = await firstTask.$$('div');
      console.log(`🎨 第一個任務有 ${segments.length} 個分段`);
      
      // 檢查分段透明度
      for (let i = 0; i < Math.min(segments.length, 5); i++) {
        const opacity = await segments[i].evaluate(el => 
          window.getComputedStyle(el).opacity
        );
        const background = await segments[i].evaluate(el => 
          window.getComputedStyle(el).background
        );
        console.log(`🎯 分段 ${i + 1}: 透明度=${opacity}, 有背景=${!!background}`);
      }
    }
    
    // 3. 測試拖拽功能（模擬）
    if (taskBars.length > 0) {
      console.log('🖱️ 測試拖拽功能...');
      const firstTask = taskBars[0];
      const box = await firstTask.boundingBox();
      
      if (box) {
        // 模擬拖拽開始
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        
        // 移動一點距離
        await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2);
        await page.waitForTimeout(500);
        
        // 放開
        await page.mouse.up();
        
        console.log('✅ 拖拽測試完成');
      }
    }
    
    console.log('🎉 甘特圖測試完成！截圖已保存為 gantt-test-final.png');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
  }
}

testGantt();