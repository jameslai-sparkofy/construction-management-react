const { chromium } = require('playwright');

async function simplifiedAutoTest() {
  console.log('🤖 開始簡化自動化測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const page = await browser.newPage();
  
  try {
    const productionUrl = 'https://construction-management-c6e.pages.dev';
    console.log('🌐 訪問生產網址:', productionUrl);
    
    await page.goto(productionUrl);
    await page.waitForTimeout(3000);
    
    console.log('🎯 點擊測試甘特圖...');
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    // 檢查是否需要創建專案
    const needProject = await page.locator('text=請先創建一個專案').isVisible().catch(() => false);
    
    if (needProject) {
      console.log('📋 需要創建專案...');
      
      // 回到新增專案
      await page.click('text=新增專案');
      await page.waitForTimeout(2000);
      
      console.log('📝 填寫專案資料...');
      
      // 尋找並填寫專案名稱
      const nameInput = await page.locator('input').first();
      await nameInput.fill('自動測試專案');
      await page.waitForTimeout(500);
      
      // 尋找並填寫日期
      const dateInput = await page.locator('input[type="date"]');
      await dateInput.fill('2025-08-21');
      await page.waitForTimeout(500);
      
      // 嘗試找到保存按鈕
      console.log('💾 尋找保存按鈕...');
      const saveButtons = await page.$$('button');
      console.log('找到', saveButtons.length, '個按鈕');
      
      // 嘗試點擊包含"保存"文字的按鈕
      for (let i = 0; i < saveButtons.length; i++) {
        const buttonText = await saveButtons[i].textContent();
        console.log('按鈕', i + 1, ':', buttonText);
        if (buttonText.includes('保存') || buttonText.includes('確認') || buttonText.includes('新增')) {
          console.log('💾 點擊保存按鈕...');
          await saveButtons[i].click();
          await page.waitForTimeout(2000);
          break;
        }
      }
      
      // 檢查是否有可用專案
      console.log('🔍 檢查專案狀態...');
      await page.waitForTimeout(2000);
    }
    
    // 回到甘特圖
    await page.click('text=🧪 測試甘特圖');
    await page.waitForTimeout(2000);
    
    // 檢查界面改進效果
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
    } else {
      console.log('ℹ️ 未找到工程類別欄（可能沒有專案）');
    }
    
    // 檢查日期格式
    const dateCells = await page.$$('.gantt-day');
    if (dateCells.length > 0) {
      const dateText = await dateCells[0].textContent();
      console.log('📅 日期格式範例:', dateText);
      
      if (dateText.includes('/')) {
        console.log('✅ 日期包含月份');
      } else {
        console.log('❌ 日期格式不正確');
      }
    } else {
      console.log('ℹ️ 未找到日期列（可能沒有專案）');
    }
    
    // 測試拖拽功能
    console.log('🖱️ 測試拖拽功能...');
    const taskBars = await page.$$('.gantt-task');
    console.log('📊 找到', taskBars.length, '個任務條');
    
    if (taskBars.length === 0) {
      console.log('ℹ️ 沒有任務條，無法測試拖拽功能');
      console.log('💡 建議：手動創建專案和任務後再測試拖拽');
    }
    
    // 截圖
    console.log('📸 保存測試截圖...');
    await page.screenshot({ 
      path: 'simplified-test-result.png',
      fullPage: true 
    });
    
    console.log('🎉 簡化測試完成！');
    console.log('');
    console.log('=== 測試結果摘要 ===');
    console.log('1. 頁面加載：✅ 正常');
    console.log('2. 測試甘特圖按鈕：✅ 可點擊');
    console.log('3. 界面改進：需要有專案數據才能完整驗證');
    console.log('4. 拖拽功能：需要有任務條才能測試');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await browser.close();
  }
}

simplifiedAutoTest();
