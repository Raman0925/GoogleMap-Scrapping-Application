const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Puppeteer diagnostic test...");
  let browser = null;
  try {
    console.log("Attempting to launch Puppeteer browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log("SUCCESS: Browser launched successfully!");
    
    console.log("Opening new tab page...");
    const page = await browser.newPage();
    
    console.log("Navigating to Google Maps search page for 'coffee in London'...");
    const searchUrl = `https://www.google.com/maps/search/coffee+in+London`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log("SUCCESS: Page loaded!");
    
    console.log("Waiting 3 seconds for dynamic content hydration...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("Checking for list cards...");
    const cardsCount = await page.evaluate(() => {
      return document.querySelectorAll('a[href*="/maps/place/"]').length;
    });
    console.log(`Diagnostic count of cards found: ${cardsCount}`);
    
    if (cardsCount === 0) {
      console.log("WARNING: 0 cards found. Let's dump the HTML body text snippet:");
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log(bodyText);
    } else {
      console.log("SUCCESS: Found search result elements!");
    }
  } catch (err) {
    console.error("DIAGNOSTIC FAILED:", err);
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
      console.log("Diagnostic test finished.");
    }
  }
})();
