import puppeteer, { Browser } from 'puppeteer';
import { logger } from '@/lib/logger';

export async function launchBrowser(): Promise<Browser> {
  logger.info('Launching Puppeteer browser instance in headless mode...');
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=1280,720',
      '--lang=en-US,en;q=0.9', // Request English language to make parsing reliable
    ],
    defaultViewport: {
      width: 1280,
      height: 720,
    },
  });
}

export async function closeBrowser(browser: Browser | null): Promise<void> {
  if (browser) {
    logger.info('Closing Puppeteer browser instance...');
    await browser.close();
  }
}

