const { chromium } = require('playwright');

async function manualDragTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // 慢速操作，方便觀察
  });
  const page = await browser.newPage();
  
  try {
    console.log('正在打開頁面...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    console.log('點擊測試甘特圖按鈕...');
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    // 檢查是否需要創建專案
    const needProject = await page.locator('text=請先創建一個專案').isVisible();
    
    if (needProject) {
      console.log('需要創建專案，正在創建...');
      
      await page.click('text=新增專案');
      await page.waitForTimeout(1000);
      
      await page.fill('input[placeholder*="專案名稱"]', '拖拽測試專案');
      await page.fill('input[type="date"]', '2025-08-21');
      
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1000);
      
      // 添加任務
      console.log('添加第一個任務...');
      await page.click('text=新增工序');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder*="工序名稱"]', '配電箱安裝');
      await page.selectOption('select', 'water-electric');
      await page.fill('input[placeholder*="工期"]', '3');
      await page.fill('input[placeholder*="成本"]', '15000');
      await page.fill('input[placeholder*="售價"]', '25000');
      
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1000);
      
      // 添加第二個任務
      console.log('添加第二個任務...');
      await page.click('text=新增工序');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder*="工序名稱"]', '電路佈線');
      await page.selectOption('select', 'water-electric');
      await page.fill('input[placeholder*="工期"]', '5');
      await page.fill('input[placeholder*="成本"]', '20000');
      await page.fill('input[placeholder*="售價"]', '35000');
      
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1000);
      
      // 回到甘特圖
      console.log('切換到甘特圖...');
      await page.click('text=🧪 測試甘特圖');
      await page.waitForTimeout(2000);
    }
    
    // 尋找任務條
    console.log('尋找任務條...');
    await page.waitForSelector('.gantt-task', { timeout: 5000 });
    const taskBars = await page.$$('.gantt-task');
    console.log('找到', taskBars.length, '個任務條');
    
    if (taskBars.length > 0) {
      console.log('=== 開始拖拽測試 ===');
      
      const firstTask = taskBars[0];
      const box = await firstTask.boundingBox();
      
      if (box) {
        // 記錄原始位置
        const originalStyle = await firstTask.evaluate(el => el.style.left);
        console.log('原始位置:', originalStyle);
        
        console.log('開始拖拽（移動120px，約2天）...');
        
        // 移動到任務條中心
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
        
        // 按下鼠標
        await page.mouse.down();
        await page.waitForTimeout(500);
        
        // 拖拽到新位置（向右移動120px，約2天）
        await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2);
        await page.waitForTimeout(1000);
        
        // 放開鼠標
        await page.mouse.up();
        await page.waitForTimeout(2000);
        
        // 檢查新位置
        const newStyle = await firstTask.evaluate(el => el.style.left);
        console.log('拖拽後位置:', newStyle);
        
        if (originalStyle === newStyle) {
          console.log('❌ 拖拽失敗：位置沒有變化');
        } else {
          console.log('✅ 拖拽成功：位置已改變');
        }
        
        // 刷新頁面檢查是否持久化
        console.log('刷新頁面檢查持久化...');
        await page.reload();
        await page.waitForTimeout(3000);
        
        await page.click('text=🧪 測試甘特圖');
        await page.waitForTimeout(2000);
        
        const taskAfterReload = await page.$('.gantt-task');
        if (taskAfterReload) {
          const reloadStyle = await taskAfterReload.evaluate(el => el.style.left);
          console.log('刷新後位置:', reloadStyle);
          
          if (reloadStyle === newStyle) {
            console.log('✅ 持久化成功：位置保持不變');
          } else {
            console.log('❌ 持久化失敗：位置被重置');
          }
        }
      }
    }
    
    console.log('=== 測試完成，瀏覽器將保持打開供手動檢查 ===');
    console.log('請手動測試拖拽功能，然後按 Ctrl+C 結束');
    
    // 保持瀏覽器打開
    await new Promise(() => {});
    
  } catch (error) {
    console.error('測試失敗:', error.message);
  }
}

manualDragTest();
