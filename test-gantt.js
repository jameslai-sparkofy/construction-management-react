const { chromium } = require('playwright');

async function testGanttChart() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 正在訪問網站...');
    await page.goto('https://construction-management-c6e.pages.dev');
    await page.waitForLoadState('networkidle');
    
    console.log('📝 創建測試專案...');
    
    // 尋找並點擊新增專案按鈕
    const addProjectBtn = await page.locator('button:has-text("新增專案")').first();
    if (await addProjectBtn.isVisible()) {
      await addProjectBtn.click();
      
      // 填寫專案資訊
      await page.fill('input[name="name"], input[placeholder*="專案名稱"]', '甘特圖測試專案');
      await page.fill('textarea[name="description"], textarea[placeholder*="描述"]', '測試拖拽功能的專案');
      
      // 設置開始日期
      const startDateInput = page.locator('input[type="date"]').first();
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2024-01-01');
      }
      
      // 保存專案
      await page.click('button:has-text("儲存"), button:has-text("保存")');
      await page.waitForTimeout(1000);
    }
    
    console.log('🔧 新增測試任務...');
    
    // 新增幾個測試任務
    const tasks = [
      { name: '基礎工程', category: 'masonry', duration: 5 },
      { name: '水電配置', category: 'water-electric', duration: 3 },
      { name: '裝潢施工', category: 'carpentry', duration: 7 }
    ];
    
    for (const task of tasks) {
      const addTaskBtn = page.locator('button:has-text("新增工序"), .floating-add-btn').first();
      if (await addTaskBtn.isVisible()) {
        await addTaskBtn.click();
        await page.waitForTimeout(500);
        
        await page.fill('input[name="name"], input[placeholder*="工序名稱"]', task.name);
        await page.fill('input[name="duration"], input[placeholder*="天數"]', task.duration.toString());
        
        // 選擇類別
        const categorySelect = page.locator('select[name="category"]').first();
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption(task.category);
        }
        
        await page.click('button:has-text("儲存"), button:has-text("保存")');
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('📅 更新專案排程...');
    
    // 更新排程
    const updateScheduleBtn = page.locator('button:has-text("更新排程")').first();
    if (await updateScheduleBtn.isVisible()) {
      await updateScheduleBtn.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('🏊‍♂️ 切換到甘特圖視圖...');
    
    // 切換到甘特圖視圖
    const ganttBtn = page.locator('button:has-text("甘特圖"), a[href*="gantt"]').first();
    if (await ganttBtn.isVisible()) {
      await ganttBtn.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('📏 檢查日期欄對齊...');
    
    // 檢查日期欄寬度是否固定
    const dateCols = await page.locator('.gantt-day').all();
    if (dateCols.length > 0) {
      const widths = [];
      for (const col of dateCols.slice(0, 5)) {
        const box = await col.boundingBox();
        if (box) widths.push(box.width);
      }
      
      const allSameWidth = widths.every(w => Math.abs(w - widths[0]) < 2);
      console.log(`✅ 日期欄寬度一致性: ${allSameWidth ? '通過' : '失敗'} (寬度: ${widths.join(', ')})`);
    }
    
    console.log('🔄 測試任務拖拽功能...');
    
    // 尋找任務條
    const taskBars = await page.locator('.gantt-task').all();
    
    if (taskBars.length > 0) {
      console.log(`找到 ${taskBars.length} 個任務條`);
      
      // 測試拖拽第一個任務條
      const firstTask = taskBars[0];
      const taskBox = await firstTask.boundingBox();
      
      if (taskBox) {
        console.log('🖱️ 測試任務條移動...');
        
        // 拖拽任務條向右移動
        await firstTask.hover();
        await page.mouse.down();
        await page.mouse.move(taskBox.x + 120, taskBox.y + taskBox.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        
        console.log('✅ 任務條拖拽測試完成');
      }
      
      console.log('🔧 測試任務條調整大小...');
      
      // 測試調整大小
      const resizeHandle = page.locator('.gantt-task .resize-handle.right').first();
      if (await resizeHandle.isVisible()) {
        const handleBox = await resizeHandle.boundingBox();
        if (handleBox) {
          await resizeHandle.hover();
          await page.mouse.down();
          await page.mouse.move(handleBox.x + 60, handleBox.y);
          await page.mouse.up();
          await page.waitForTimeout(1000);
          
          console.log('✅ 任務條調整大小測試完成');
        }
      }
    }
    
    console.log('🌅 檢查休息日透明效果...');
    
    // 檢查週末透明效果
    const weekendTasks = await page.locator('.gantt-task.weekend-overlap').all();
    console.log(`📊 發現 ${weekendTasks.length} 個跨越休息日的任務條`);
    
    console.log('📋 檢查數據同步...');
    
    // 切換到任務列表檢查數據同步
    const listBtn = page.locator('button:has-text("列表"), a[href*="list"]').first();
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(1000);
      
      // 檢查任務列表是否有數據
      const taskRows = await page.locator('.list-table tbody tr').all();
      console.log(`📝 任務列表顯示 ${taskRows.length} 個任務`);
    }
    
    console.log('🎉 測試完成！');
    
    // 截圖
    await page.screenshot({ path: 'gantt-test-result.png', fullPage: true });
    console.log('📸 已保存測試截圖: gantt-test-result.png');
    
  } catch (error) {
    console.error('❌ 測試過程中出現錯誤:', error);
  } finally {
    await browser.close();
  }
}

testGanttChart();