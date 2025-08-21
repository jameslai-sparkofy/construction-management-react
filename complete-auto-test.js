const { chromium } = require('playwright');

async function completeAutoTest() {
  console.log('🤖 開始完整自動化測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    const productionUrl = 'https://construction-management-c6e.pages.dev';
    console.log('🌐 訪問生產網址:', productionUrl);
    
    await page.goto(productionUrl);
    await page.waitForTimeout(3000);
    
    console.log('📱 檢查頁面加載...');
    const title = await page.title();
    console.log('✅ 頁面標題:', title);
    
    // 檢查界面改進
    console.log('🎨 檢查界面改進...');
    
    console.log('🎯 點擊測試甘特圖...');
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    // 檢查是否需要創建專案
    const needProject = await page.locator('text=請先創建一個專案').isVisible().catch(() => false);
    
    if (needProject) {
      console.log('📋 需要創建專案...');
      
      // 點擊新增專案
      await page.click('text=新增專案');
      await page.waitForTimeout(1000);
      
      // 填寫專案資料
      console.log('📝 填寫專案資料...');
      await page.fill('input[placeholder*="專案名稱"]', '自動測試專案');
      await page.fill('input[type="date"]', '2025-08-21');
      
      // 保存專案
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1500);
      
      // 添加第一個任務
      console.log('➕ 添加第一個任務...');
      await page.click('text=新增工序');
      await page.waitForTimeout(1000);
      
      await page.fill('input[placeholder*="工序名稱"]', '配電箱安裝');
      await page.selectOption('select', 'water-electric');
      await page.fill('input[placeholder*="工期"]', '3');
      await page.fill('input[placeholder*="成本"]', '15000');
      await page.fill('input[placeholder*="售價"]', '25000');
      
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1500);
      
      // 添加第二個任務
      console.log('➕ 添加第二個任務...');
      await page.click('text=新增工序');
      await page.waitForTimeout(1000);
      
      await page.fill('input[placeholder*="工序名稱"]', '電路佈線');
      await page.selectOption('select', 'water-electric');
      await page.fill('input[placeholder*="工期"]', '5');
      await page.fill('input[placeholder*="成本"]', '20000');
      await page.fill('input[placeholder*="售價"]', '35000');
      
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(1500);
      
      // 回到甘特圖
      console.log('📊 切換到甘特圖...');
      await page.click('text=🧪 測試甘特圖');
      await page.waitForTimeout(2000);
    }
    
    // 檢查界面改進效果
    console.log('🔍 檢查界面改進效果...');
    
    // 檢查工程類別欄寬度
    const categoryLabels = await page.$$('.gantt-lane-label');
    if (categoryLabels.length > 0) {
      const width = await categoryLabels[0].evaluate(el => el.offsetWidth);
      const writingMode = await categoryLabels[0].evaluate(el => 
        window.getComputedStyle(el).writingMode
      );
      console.log('📏 工程類別欄寬度:', width + 'px');
      console.log('📝 文字方向:', writingMode);
      
      if (width >= 140) {
        console.log('✅ 工程類別欄寬度正確（≥140px）');
      } else {
        console.log('❌ 工程類別欄寬度不足');
      }
      
      if (writingMode === 'horizontal-tb') {
        console.log('✅ 文字方向正確（橫向）');
      } else {
        console.log('❌ 文字方向錯誤（應為橫向）');
      }
    }
    
    // 檢查日期格式
    const dateCells = await page.$$('.gantt-day');
    if (dateCells.length > 0) {
      const dateText = await dateCells[0].textContent();
      console.log('📅 日期格式範例:', dateText);
      
      if (dateText.includes('/')) {
        console.log('✅ 日期包含月份（格式正確）');
      } else {
        console.log('❌ 日期格式不正確（應包含月份）');
      }
    }
    
    // 測試拖拽功能
    console.log('🖱️ 開始測試拖拽功能...');
    
    const taskBars = await page.$$('.gantt-task');
    console.log('📊 找到', taskBars.length, '個任務條');
    
    if (taskBars.length > 0) {
      const firstTask = taskBars[0];
      const box = await firstTask.boundingBox();
      
      if (box) {
        // 記錄原始位置
        const originalLeft = await firstTask.evaluate(el => el.style.left);
        console.log('📍 原始位置:', originalLeft);
        
        // 設置控制台監聽
        const dragLogs = [];
        page.on('console', msg => {
          if (msg.text().includes('拖拽')) {
            dragLogs.push(msg.text());
            console.log('🔍 拖拽日誌:', msg.text());
          }
        });
        
        console.log('🖱️ 執行拖拽操作...');
        
        // 移動到任務條中心
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
        
        // 按下鼠標
        await page.mouse.down();
        await page.waitForTimeout(500);
        
        // 拖拽向右移動120px（約2天）
        await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2);
        await page.waitForTimeout(1000);
        
        // 放開鼠標
        await page.mouse.up();
        await page.waitForTimeout(2000);
        
        // 檢查新位置
        const newLeft = await firstTask.evaluate(el => el.style.left);
        console.log('📍 拖拽後位置:', newLeft);
        
        // 分析拖拽結果
        if (originalLeft === newLeft) {
          console.log('❌ 拖拽失敗：位置沒有變化');
          console.log('🔍 可能的問題：');
          console.log('   - 拖拽事件沒有觸發');
          console.log('   - 位置計算錯誤');
          console.log('   - 更新邏輯有問題');
        } else {
          console.log('✅ 拖拽成功：位置已改變');
          
          // 測試持久化
          console.log('🔄 測試持久化...');
          await page.reload();
          await page.waitForTimeout(3000);
          
          await page.click('text=🧪 測試甘特圖');
          await page.waitForTimeout(2000);
          
          const reloadedTasks = await page.$$('.gantt-task');
          if (reloadedTasks.length > 0) {
            const reloadedLeft = await reloadedTasks[0].evaluate(el => el.style.left);
            console.log('📍 刷新後位置:', reloadedLeft);
            
            if (reloadedLeft === newLeft) {
              console.log('✅ 持久化成功：位置保持不變');
            } else {
              console.log('❌ 持久化失敗：位置被重置');
            }
          }
        }
        
        // 顯示拖拽日誌摘要
        if (dragLogs.length > 0) {
          console.log('📋 拖拽日誌摘要:');
          dragLogs.forEach(log => console.log('   -', log));
        } else {
          console.log('❌ 沒有拖拽調試信息');
        }
      }
    } else {
      console.log('❌ 沒有找到任務條');
    }
    
    // 截圖保存
    console.log('📸 保存測試截圖...');
    await page.screenshot({ 
      path: 'complete-test-result.png',
      fullPage: true 
    });
    
    console.log('🎉 測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
  }
}

completeAutoTest();
