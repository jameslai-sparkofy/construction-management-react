const { chromium } = require('playwright');

async function detailedTest() {
  console.log('🔍 開始詳細測試分析...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const issues = [];
  
  try {
    // 監聽控制台錯誤
    page.on('console', msg => {
      if (msg.type() === 'error') {
        issues.push(`❌ 控制台錯誤: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        issues.push(`⚠️ 控制台警告: ${msg.text()}`);
      }
    });
    
    // 監聽網絡錯誤
    page.on('response', response => {
      if (response.status() >= 400) {
        issues.push(`🌐 網絡錯誤: ${response.url()} - ${response.status()}`);
      }
    });
    
    // 載入網站
    await page.goto('https://construction-management-c6e.pages.dev/', { waitUntil: 'networkidle' });
    
    // 生成測試數據
    await page.locator('button:has-text("生成測試專案")').click();
    await page.waitForTimeout(1000);
    
    // 選擇專案
    await page.locator('.project-item').first().click();
    await page.waitForTimeout(500);
    
    console.log('🔍 分析各個視圖的問題...');
    
    // 1. 測試甘特圖
    await page.locator('.tab-btn:has-text("甘特圖")').click();
    await page.waitForTimeout(1000);
    
    const ganttChart = await page.locator('.gantt-chart').count();
    const ganttTasks = await page.locator('.gantt-task').count();
    console.log(`📊 甘特圖: ${ganttChart > 0 ? '✅' : '❌'} 存在, ${ganttTasks} 個任務條`);
    
    if (ganttTasks === 0) {
      issues.push('❌ 甘特圖沒有顯示任務條 - 可能排程計算有問題');
    }
    
    // 2. 測試日曆
    await page.locator('.tab-btn:has-text("日曆")').click();
    await page.waitForTimeout(1000);
    
    const calendarDays = await page.locator('.calendar-day').count();
    const calendarTasks = await page.locator('.calendar-task').count();
    console.log(`📅 日曆: ${calendarDays} 個日期格子, ${calendarTasks} 個任務`);
    
    if (calendarTasks === 0) {
      issues.push('❌ 日曆沒有顯示任務 - 可能日期匹配邏輯有問題');
    }
    
    // 3. 測試工程看板
    await page.locator('.tab-btn:has-text("工程看板")').click();
    await page.waitForTimeout(1000);
    
    const kanbanColumns = await page.locator('.kanban-column').count();
    const kanbanCards = await page.locator('.kanban-card').count();
    console.log(`🏗️ 工程看板: ${kanbanColumns} 個欄位, ${kanbanCards} 張卡片`);
    
    // 4. 測試狀態看板
    await page.locator('.tab-btn:has-text("進度看板")').click();
    await page.waitForTimeout(1000);
    
    const statusColumns = await page.locator('.kanban-column').count();
    const statusCards = await page.locator('.kanban-card').count();
    console.log(`📋 狀態看板: ${statusColumns} 個欄位, ${statusCards} 張卡片`);
    
    // 測試狀態切換功能
    if (statusCards > 0) {
      const firstCard = page.locator('.kanban-card').first();
      await firstCard.click();
      await page.waitForTimeout(500);
      console.log('✅ 狀態切換測試完成');
    }
    
    // 5. 測試列表視圖
    await page.locator('.tab-btn:has-text("列表")').click();
    await page.waitForTimeout(1000);
    
    const listTable = await page.locator('.list-table').count();
    const listRows = await page.locator('.list-table tbody tr').count();
    console.log(`📝 列表視圖: ${listTable > 0 ? '✅' : '❌'} 表格存在, ${listRows} 行數據`);
    
    // 測試新增工序功能
    const addTaskButton = page.locator('button:has-text("新增工序")');
    if (await addTaskButton.count() > 0) {
      await addTaskButton.click();
      await page.waitForTimeout(500);
      
      const modal = await page.locator('.modal-overlay').count();
      console.log(`➕ 新增工序彈窗: ${modal > 0 ? '✅' : '❌'}`);
      
      if (modal > 0) {
        // 關閉彈窗
        await page.locator('.close-btn').click();
      }
    }
    
    // 測試更新排程功能
    const updateScheduleButton = page.locator('button:has-text("更新排程")');
    if (await updateScheduleButton.count() > 0) {
      await updateScheduleButton.click();
      await page.waitForTimeout(1000);
      console.log('🔄 更新排程功能測試完成');
    }
    
    // 檢查響應式設計
    console.log('📱 測試響應式設計...');
    
    // 手機視圖
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileHeader = await page.locator('.header').isVisible();
    const mobileSidebar = await page.locator('.sidebar').isVisible();
    
    console.log(`📱 手機視圖: 標題${mobileHeader ? '✅' : '❌'}, 側邊欄${mobileSidebar ? '✅' : '❌'}`);
    
    if (!mobileHeader) {
      issues.push('❌ 手機視圖下標題不可見');
    }
    
    // 檢查佈局是否適當
    const sidebarWidth = await page.locator('.sidebar').evaluate(el => el.offsetWidth);
    if (sidebarWidth > 300) {
      issues.push('⚠️ 手機視圖下側邊欄可能太寬');
    }
    
    // 平板視圖
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // 桌面視圖
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // 檢查可訪問性
    console.log('♿ 檢查可訪問性...');
    
    const headings = await page.locator('h1, h2, h3').count();
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    
    console.log(`♿ 可訪問性: ${headings} 個標題, ${buttons} 個按鈕, ${inputs} 個輸入框`);
    
    // 檢查是否有缺少的 alt 屬性
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`♿ ${imagesWithoutAlt} 張圖片缺少 alt 屬性`);
    }
    
    // 檢查顏色對比（簡單檢查）
    const lowContrastElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      elements.forEach(el => {
        const styles = getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        
        // 簡單的對比度檢查（實際需要更複雜的算法）
        if (bgColor === textColor) {
          count++;
        }
      });
      return count;
    });
    
    if (lowContrastElements > 0) {
      issues.push(`♿ ${lowContrastElements} 個元素可能存在顏色對比問題`);
    }
    
  } catch (error) {
    issues.push(`❌ 測試過程中發生錯誤: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // 輸出問題報告
  console.log('\n📋 測試報告總結:');
  console.log('================');
  
  if (issues.length === 0) {
    console.log('🎉 恭喜！沒有發現明顯問題');
  } else {
    console.log(`⚠️ 發現 ${issues.length} 個需要注意的問題:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  // 改進建議
  console.log('\n💡 改進建議:');
  console.log('============');
  console.log('1. 🔧 確保排程計算邏輯正確生成開始和結束日期');
  console.log('2. 📱 優化手機端的佈局和互動體驗');
  console.log('3. ♿ 改進可訪問性（添加適當的 ARIA 標籤）');
  console.log('4. ⚡ 優化載入效能（考慮懶加載）');
  console.log('5. 🎨 確保所有視圖在不同螢幕尺寸下都能正常顯示');
  console.log('6. 🐛 添加更好的錯誤處理和用戶反饋');
  console.log('7. 💾 考慮添加數據持久化（localStorage）');
  console.log('8. 🔄 改進拖拉排序功能（目前缺失）');
}

detailedTest();