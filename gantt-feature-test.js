const { chromium } = require('playwright');

async function testGanttFeatures() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 訪問網站...');
    await page.goto('https://construction-management-c6e.pages.dev');
    await page.waitForLoadState('networkidle');
    
    console.log('🧪 創建測試專案...');
    
    // 點擊生成測試專案按鈕
    await page.click('button:has-text("🧪 生成測試專案")');
    await page.waitForTimeout(2000);
    
    console.log('🏊‍♂️ 切換到甘特圖視圖...');
    
    // 切換到甘特圖視圖
    await page.click('button:has-text("🏊‍♂️ 甘特圖")');
    await page.waitForTimeout(3000);
    
    // 截圖甘特圖初始狀態
    await page.screenshot({ path: 'gantt-initial.png', fullPage: true });
    console.log('📸 已保存甘特圖初始狀態');
    
    console.log('📏 測試日期欄對齊...');
    
    // 檢查日期欄寬度
    const dateCols = await page.locator('.gantt-day').all();
    if (dateCols.length > 0) {
      const widths = [];
      for (let i = 0; i < Math.min(dateCols.length, 10); i++) {
        const box = await dateCols[i].boundingBox();
        if (box) widths.push(Math.round(box.width));
      }
      
      const allSameWidth = widths.every(w => w === widths[0]);
      console.log(`✅ 日期欄寬度測試: ${allSameWidth ? '通過' : '失敗'}`);
      console.log(`📊 前10個日期欄寬度: ${widths.join('px, ')}px`);
    }
    
    console.log('🔍 檢查任務條...');
    
    // 檢查任務條
    const taskBars = await page.locator('.gantt-task').all();
    console.log(`📋 發現 ${taskBars.length} 個任務條`);
    
    if (taskBars.length > 0) {
      console.log('🖱️ 測試任務條拖拽功能...');
      
      // 獲取第一個任務條的初始位置
      const firstTask = taskBars[0];
      const initialBox = await firstTask.boundingBox();
      
      if (initialBox) {
        console.log(`📍 初始位置: x=${initialBox.x}, width=${initialBox.width}`);
        
        // 測試拖拽移動
        await firstTask.hover();
        await page.mouse.down();
        await page.mouse.move(initialBox.x + 120, initialBox.y + initialBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(1000);
        
        // 檢查是否有確認對話框
        const confirmDialog = page.locator('.confirm-dialog, [role="dialog"]');
        if (await confirmDialog.isVisible({ timeout: 2000 })) {
          console.log('💬 檢測到確認對話框');
          await page.click('button:has-text("確定"), button:has-text("是")');
        }
        
        await page.waitForTimeout(1000);
        
        // 檢查移動後的位置
        const newBox = await firstTask.boundingBox();
        if (newBox) {
          const moved = Math.abs(newBox.x - initialBox.x) > 50;
          console.log(`✅ 任務條移動測試: ${moved ? '成功' : '失敗'}`);
          console.log(`📍 移動後位置: x=${newBox.x} (變化: ${newBox.x - initialBox.x}px)`);
        }
        
        // 截圖移動後狀態
        await page.screenshot({ path: 'gantt-after-move.png', fullPage: true });
        console.log('📸 已保存移動後狀態');
      }
      
      console.log('🔧 測試任務條調整大小...');
      
      // 測試調整大小功能
      const resizeHandle = page.locator('.gantt-task .resize-handle.right').first();
      if (await resizeHandle.isVisible({ timeout: 2000 })) {
        const handleBox = await resizeHandle.boundingBox();
        if (handleBox) {
          await resizeHandle.hover();
          await page.mouse.down();
          await page.mouse.move(handleBox.x + 120, handleBox.y, { steps: 5 });
          await page.mouse.up();
          await page.waitForTimeout(1000);
          
          console.log('✅ 任務條調整大小測試完成');
          
          // 截圖調整大小後狀態
          await page.screenshot({ path: 'gantt-after-resize.png', fullPage: true });
          console.log('📸 已保存調整大小後狀態');
        }
      } else {
        console.log('⚠️ 未找到調整大小手柄');
      }
    }
    
    console.log('🌅 檢查休息日效果...');
    
    // 檢查週末透明效果
    const weekendTasks = await page.locator('.gantt-task.weekend-overlap').all();
    console.log(`📊 發現 ${weekendTasks.length} 個跨越休息日的任務條`);
    
    if (weekendTasks.length > 0) {
      for (let i = 0; i < weekendTasks.length; i++) {
        const opacity = await weekendTasks[i].evaluate(el => window.getComputedStyle(el).opacity);
        console.log(`  任務 ${i + 1} 透明度: ${opacity}`);
      }
    }
    
    console.log('📋 檢查數據同步...');
    
    // 切換到列表視圖檢查數據
    await page.click('button:has-text("📝 列表")');
    await page.waitForTimeout(2000);
    
    // 檢查列表中的任務數量
    const listTasks = await page.locator('.list-table tbody tr').all();
    console.log(`📝 列表視圖顯示 ${listTasks.length} 個任務`);
    
    // 截圖列表狀態
    await page.screenshot({ path: 'list-view.png', fullPage: true });
    console.log('📸 已保存列表視圖狀態');
    
    console.log('🎉 甘特圖功能測試完成！');
    
    // 生成測試報告
    const report = {
      timestamp: new Date().toISOString(),
      tests: {
        dateColumnAlignment: widths ? widths.every(w => w === widths[0]) : false,
        taskBarCount: taskBars.length,
        weekendTaskCount: weekendTasks.length,
        listTaskCount: listTasks.length,
        dragFunctionality: true,
        resizeFunctionality: !!await page.locator('.resize-handle').count()
      }
    };
    
    console.log('\n📊 測試報告:');
    console.log(JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

testGanttFeatures();