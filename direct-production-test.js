const { chromium } = require('playwright');

async function directProductionTest() {
  console.log('🤖 直接測試生產環境現有功能...');
  
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
    
    console.log('✅ 頁面加載完成');
    
    // 檢查是否有現有專案
    console.log('🔍 檢查現有專案...');
    const projectItems = await page.$$('.project-item');
    console.log('📋 找到', projectItems.length, '個現有專案');
    
    if (projectItems.length > 0) {
      console.log('📂 點擊第一個專案...');
      await projectItems[0].click();
      await page.waitForTimeout(1500);
      
      console.log('🎯 切換到甘特圖視圖...');
      await page.click('text=甘特圖');
      await page.waitForTimeout(2000);
      
      // 檢查界面改進
      console.log('🔍 檢查界面改進效果...');
      
      // 檢查工程類別欄
      const categoryLabels = await page.$$('.gantt-lane-label');
      if (categoryLabels.length > 0) {
        const width = await categoryLabels[0].evaluate(el => el.offsetWidth);
        const writingMode = await categoryLabels[0].evaluate(el => 
          window.getComputedStyle(el).writingMode
        );
        console.log('📏 工程類別欄寬度:', width + 'px');
        console.log('📝 文字方向:', writingMode);
        
        if (width >= 140) {
          console.log('✅ 工程類別欄寬度正確');
        } else {
          console.log('❌ 工程類別欄寬度不足');
        }
        
        if (writingMode === 'horizontal-tb') {
          console.log('✅ 文字方向正確（橫向）');
        } else {
          console.log('❌ 文字方向錯誤');
        }
      }
      
      // 檢查日期格式
      const dateCells = await page.$$('.gantt-day');
      if (dateCells.length > 0) {
        const dateText = await dateCells[0].textContent();
        console.log('📅 日期格式範例:', dateText.trim());
        
        if (dateText.includes('/')) {
          console.log('✅ 日期包含月份');
        } else {
          console.log('❌ 日期格式不正確');
        }
      }
      
      // 測試拖拽功能
      console.log('🖱️ 測試拖拽功能...');
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
          let dragLogged = false;
          page.on('console', msg => {
            if (msg.text().includes('拖拽')) {
              console.log('🔍 拖拽日誌:', msg.text());
              dragLogged = true;
            }
          });
          
          console.log('🖱️ 執行拖拽操作...');
          
          // 移動到任務條中心並拖拽
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(500);
          
          await page.mouse.down();
          await page.waitForTimeout(500);
          
          // 拖拽向右移動120px
          await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2);
          await page.waitForTimeout(1000);
          
          await page.mouse.up();
          await page.waitForTimeout(2000);
          
          // 檢查新位置
          const newLeft = await firstTask.evaluate(el => el.style.left);
          console.log('📍 拖拽後位置:', newLeft);
          
          // 分析結果
          if (originalLeft === newLeft) {
            console.log('❌ 拖拽失敗：位置沒有變化');
            
            if (!dragLogged) {
              console.log('🔍 沒有拖拽調試信息，可能的問題：');
              console.log('   - 拖拽事件監聽器沒有正確綁定');
              console.log('   - 事件被其他元素攔截');
              console.log('   - 拖拽邏輯有錯誤');
            }
          } else {
            console.log('✅ 拖拽成功：位置已改變');
            
            // 測試持久化
            console.log('🔄 測試持久化（刷新頁面）...');
            await page.reload();
            await page.waitForTimeout(3000);
            
            // 重新選擇專案和甘特圖
            const reloadedProjects = await page.$$('.project-item');
            if (reloadedProjects.length > 0) {
              await reloadedProjects[0].click();
              await page.waitForTimeout(1500);
              
              await page.click('text=甘特圖');
              await page.waitForTimeout(2000);
              
              const reloadedTasks = await page.$$('.gantt-task');
              if (reloadedTasks.length > 0) {
                const reloadedLeft = await reloadedTasks[0].evaluate(el => el.style.left);
                console.log('📍 刷新後位置:', reloadedLeft);
                
                if (reloadedLeft === newLeft) {
                  console.log('✅ 持久化成功');
                } else {
                  console.log('❌ 持久化失敗');
                }
              }
            }
          }
        }
      } else {
        console.log('ℹ️ 該專案沒有任務條');
      }
    } else {
      console.log('🎯 沒有現有專案，切換到測試甘特圖...');
      await page.click('text=🧪 測試甘特圖');
      await page.waitForTimeout(2000);
      
      // 檢查測試甘特圖界面
      console.log('🔍 檢查測試甘特圖界面...');
      const ganttContent = await page.textContent('.gantt-container, [class*="gantt"]').catch(() => '');
      
      if (ganttContent.includes('請先創建一個專案')) {
        console.log('ℹ️ 測試甘特圖需要創建專案');
      } else {
        console.log('✅ 測試甘特圖界面正常');
      }
    }
    
    // 截圖
    console.log('📸 保存測試截圖...');
    await page.screenshot({ 
      path: 'direct-production-test.png',
      fullPage: true 
    });
    
    console.log('🎉 直接測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
  }
}

directProductionTest();
