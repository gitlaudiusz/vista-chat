const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to standard desktop size
  await page.setViewport({
    width: 1920,
    height: 1080
  });
  
  console.log('Navigating to https://vista.libraxis.cloud...');
  await page.goto('https://vista.libraxis.cloud', {
    waitUntil: 'networkidle2'
  });
  
  // Wait for the main content to load
  await page.waitForSelector('main', { timeout: 10000 });
  
  // Take screenshot
  const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
  const filename = `vista_screenshot_${timestamp}.png`;
  
  await page.screenshot({
    path: filename,
    fullPage: true
  });
  
  console.log(`Screenshot saved as: ${filename}`);
  
  await browser.close();
})();