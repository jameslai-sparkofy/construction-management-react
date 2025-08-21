const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('正在打開 http://localhost:3000...');
    await page.goto('http://localhost:3000');
    
    console.log('等待頁面加載...');
    await page.waitForTimeout(3000);
    
    // 檢查頁面是否正確加載
    const title = await page.title();
    console.log('頁面標題:', title);
    
    // 尋找專案並點擊
    console.log('尋找專案列表...');
    const projects = await page.$$('.project-item');
    console.log('找到', projects.length, '個專案');
    
    if (projects.length > 0) {
      console.log('點擊第一個專案...');
      await projects[0].click();
      await page.waitForTimeout(1000);
      
      // 切換到甘特圖視圖
      console.log('切換到甘特圖視圖...');
      const ganttButton = await page.$('button:has-text("甘特圖")');
      if (ganttButton) {
        await ganttButton.click();
        await page.waitForTimeout(2000);
        
        // 截圖甘特圖
        console.log('截圖甘特圖...');
        await page.screenshot({ 
          path: 'gantt-test-result.png',
          fullPage: true 
        });
        console.log('截圖已保存為 gantt-test-result.png');
        
        // 檢查對齊
        const categoryLabels = await page.$$('.gantt-lane-label');
        const dateCells = await page.$$('.gantt-day');
        
        if (categoryLabels.length > 0 && dateCells.length > 0) {
          const categoryWidth = await categoryLabels[0].evaluate(el => el.offsetWidth);
          const dateWidth = await dateCells[0].evaluate(el => el.offsetWidth);
          
          console.log('工程類別欄寬度:', categoryWidth + 'px');
          console.log('日期欄寬度:', dateWidth + 'px');
          console.log('對齊檢查:', categoryWidth === dateWidth ? '✅ 已對齊' : '❌ 未對齊');
        }
        
        // 檢查任務條
        const taskBars = await page.$$('.gantt-task');
        console.log('找到', taskBars.length, '個任務條');
        
        if (taskBars.length > 0) {
          // 檢查第一個任務條的分段
          const segments = await taskBars[0].$$('div');
          console.log('第一個任務條有', segments.length, '個分段');
          
          // 檢查是否有透明度效果
          for (let i = 0; i < Math.min(segments.length, 3); i++) {
            const opacity = await segments[i].evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.opacity;
            });
            console.log('分段', i + 1, '透明度:', opacity);
          }
        }
        
        console.log('✅ 甘特圖測試完成');
      } else {
        console.log('❌ 找不到甘特圖按鈕');
      }
    } else {
      console.log('❌ 找不到專案');
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
  }
})();