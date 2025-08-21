const { chromium } = require('playwright');

async function testDragFunction() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 點擊測試甘特圖
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    // 檢查是否有專案
    const currentProject = await page.textContent('.gantt-container');
    if (currentProject.includes('請先創建一個專案')) {
      console.log('需要先創建專案來測試拖拽功能');
      
      // 點擊新增專案
      await page.click('text=新增專案');
      await page.waitForTimeout(1000);
      
      // 填寫專案資料
      await page.fill('input[placeholder*="專案名稱"]', '拖拽測試專案');
      await page.fill('input[type="date"]', '2025-08-21');
      
      // 保存專案
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1000);
      
      // 添加任務
      await page.click('text=新增工序');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder*="工序名稱"]', '測試拖拽任務');
      await page.selectOption('select', 'water-electric');
      await page.fill('input[placeholder*="工期"]', '5');
      
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1000);
      
      // 再回到甘特圖
      await page.click('text=🧪 測試甘特圖');
      await page.waitForTimeout(2000);
    }
    
    // 尋找任務條
    const taskBars = await page.$$('.gantt-task');
    console.log('找到', taskBars.length, '個任務條');
    
    if (taskBars.length > 0) {
      const firstTask = taskBars[0];
      const box = await firstTask.boundingBox();
      
      if (box) {
        console.log('開始測試拖拽...');
        
        // 記錄原始位置
        const originalLeft = await firstTask.evaluate(el => el.style.left);
        console.log('原始位置:', originalLeft);
        
        // 拖拽
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2); // 移動2天
        await page.waitForTimeout(500);
        await page.mouse.up();
        
        await page.waitForTimeout(2000);
        
        // 檢查新位置
        const newLeft = await firstTask.evaluate(el => el.style.left);
        console.log('拖拽後位置:', newLeft);
        
        if (originalLeft === newLeft) {
          console.log('❌ 拖拽失敗：位置沒有變化');
        } else {
          console.log('✅ 拖拽成功：位置已改變');
        }
      }
    }
    
    // 截圖
    await page.screenshot({ path: 'drag-test.png', fullPage: true });
    console.log('測試截圖已保存');
    
  } catch (error) {
    console.error('測試失敗:', error.message);
  } finally {
    await browser.close();
  }
}

testDragFunction();
