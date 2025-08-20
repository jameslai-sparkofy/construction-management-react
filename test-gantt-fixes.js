const { chromium } = require('playwright');

async function testGanttFixes() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 500
  });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 測試甘特圖修復效果...');
    
    // 監聽控制台輸出（包括我們的調試信息）
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'log' && (msg.text().includes('開始拖拽') || msg.text().includes('開始調整大小'))) {
        console.log(`📝 [瀏覽器] ${msg.text()}`);
      } else if (type === 'error') {
        console.log(`❌ [瀏覽器錯誤] ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log('💥 頁面錯誤:', error.message);
    });
    
    await page.goto('https://construction-management-c6e.pages.dev', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('🧪 創建測試專案...');
    await page.click('button:has-text("🧪 生成測試專案")');
    await page.waitForTimeout(2000);
    
    console.log('🏊‍♂️ 切換到甘特圖視圖...');
    await page.click('button:has-text("🏊‍♂️ 甘特圖")');
    await page.waitForTimeout(3000);
    
    // 截圖初始狀態
    await page.screenshot({ path: 'gantt-fixed-initial.png', fullPage: true });
    console.log('📸 已保存甘特圖初始狀態');
    
    console.log('📏 檢查日期欄對齊...');
    
    // 檢查日期欄寬度一致性
    const dateColumns = await page.locator('.gantt-day').all();
    if (dateColumns.length > 0) {
      const widths = [];
      for (let i = 0; i < Math.min(dateColumns.length, 10); i++) {
        const box = await dateColumns[i].boundingBox();
        if (box) widths.push(Math.round(box.width));
      }
      
      const allSameWidth = widths.every(w => w === widths[0]);
      console.log(`✅ 日期欄寬度一致性: ${allSameWidth ? '通過' : '失敗'}`);
      console.log(`📊 前10個日期欄寬度: ${widths.join('px, ')}px`);
    }
    
    // 檢查行高一致性
    const lanes = await page.locator('.gantt-lane').all();
    if (lanes.length > 0) {
      const heights = [];
      for (let i = 0; i < Math.min(lanes.length, 5); i++) {
        const box = await lanes[i].boundingBox();
        if (box) heights.push(Math.round(box.height));
      }
      
      const allSameHeight = heights.every(h => h === heights[0]);
      console.log(`✅ 行高一致性: ${allSameHeight ? '通過' : '失敗'}`);
      console.log(`📊 前5行高度: ${heights.join('px, ')}px`);
    }
    
    console.log('🔍 檢查任務條...');
    
    const taskBars = await page.locator('.gantt-task').all();
    console.log(`📋 發現 ${taskBars.length} 個任務條`);
    
    if (taskBars.length > 0) {
      console.log('🎨 檢查休息日透明效果...');
      
      // 檢查任務條的分段結構
      const taskSegments = await page.locator('.task-segment').all();
      console.log(`📊 發現 ${taskSegments.length} 個任務分段`);
      
      // 檢查是否有透明度為 0.5 的分段
      let weekendSegments = 0;
      for (let i = 0; i < Math.min(taskSegments.length, 20); i++) {
        const opacity = await taskSegments[i].evaluate(el => window.getComputedStyle(el).opacity);
        if (parseFloat(opacity) === 0.5) {
          weekendSegments++;
        }
      }
      console.log(`🌅 發現 ${weekendSegments} 個休息日透明分段`);
      
      console.log('🖱️ 測試拖拽功能...');
      
      // 測試第一個任務條的拖拽
      const firstTask = taskBars[0];
      const taskBox = await firstTask.boundingBox();
      
      if (taskBox) {
        console.log(`📍 第一個任務位置: x=${taskBox.x}, width=${taskBox.width}`);
        
        // 測試拖拽移動
        console.log('🚀 測試拖拽移動...');
        await firstTask.hover();
        await page.mouse.down();
        
        // 移動滑鼠
        await page.mouse.move(taskBox.x + 120, taskBox.y + taskBox.height / 2, { steps: 10 });
        await page.waitForTimeout(1000);
        
        // 檢查是否有拖拽狀態
        const isDragging = await firstTask.evaluate(el => el.classList.contains('dragging'));
        console.log(`🎯 拖拽狀態: ${isDragging ? '激活' : '未激活'}`);
        
        await page.mouse.up();
        await page.waitForTimeout(1000);
        
        // 檢查位置是否改變
        const newTaskBox = await firstTask.boundingBox();
        if (newTaskBox) {
          const moved = Math.abs(newTaskBox.x - taskBox.x) > 30;
          console.log(`✅ 任務移動測試: ${moved ? '成功' : '失敗'}`);
          console.log(`📍 移動後位置: x=${newTaskBox.x} (變化: ${newTaskBox.x - taskBox.x}px)`);
        }
        
        // 截圖拖拽後狀態
        await page.screenshot({ path: 'gantt-after-drag-test.png', fullPage: true });
        console.log('📸 已保存拖拽測試後狀態');
        
        console.log('🔧 測試調整大小功能...');
        
        // 測試調整大小手柄
        await firstTask.hover();
        const resizeHandle = page.locator('.gantt-task .resize-handle.right').first();
        
        if (await resizeHandle.isVisible({ timeout: 2000 })) {
          console.log('👀 調整大小手柄可見');
          
          const handleBox = await resizeHandle.boundingBox();
          if (handleBox) {
            await resizeHandle.hover();
            await page.mouse.down();
            await page.mouse.move(handleBox.x + 120, handleBox.y, { steps: 5 });
            await page.waitForTimeout(1000);
            await page.mouse.up();
            await page.waitForTimeout(1000);
            
            console.log('✅ 調整大小操作完成');
            
            // 截圖調整大小後狀態
            await page.screenshot({ path: 'gantt-after-resize-test.png', fullPage: true });
            console.log('📸 已保存調整大小測試後狀態');
          }
        } else {
          console.log('⚠️ 調整大小手柄不可見');
        }
      }
    }
    
    console.log('📊 生成測試報告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      tests: {
        taskBars: taskBars.length,
        taskSegments: taskSegments?.length || 0,
        weekendSegments: weekendSegments || 0,
        dateColumnsConsistent: widths?.every(w => w === widths[0]) || false,
        rowHeightsConsistent: heights?.every(h => h === heights[0]) || false
      }
    };
    
    console.log('\n🎉 甘特圖測試報告:');
    console.log(JSON.stringify(report, null, 2));
    
    // 保持瀏覽器開啟供觀察
    console.log('👀 保持瀏覽器開啟15秒供觀察...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('🔥 測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

testGanttFixes();