const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    console.log('頁面標題:', await page.title());
    
    // 截圖
    await page.screenshot({ 
      path: 'page-screenshot.png',
      fullPage: true 
    });
    
    console.log('截圖完成: page-screenshot.png');
    
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await browser.close();
  }
}

simpleTest();
