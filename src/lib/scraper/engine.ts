import { Browser, Page } from 'puppeteer';
import { ScrapedItem, ScraperOptions, ScrapeProgress, ScrapeProgressCallback } from '@/types/scraper';
import { launchBrowser, closeBrowser } from './browser';
import { extractListItems, extractDetails } from './parser';
import { logger } from '@/lib/logger';

function emitProgress(
  onProgress: ScrapeProgressCallback,
  status: ScrapeProgress['status'],
  message: string,
  count: number,
  limit: number,
  item?: ScrapedItem
) {
  // Centralized server-side logging for all SSE scraper progress changes
  if (status === 'error') {
    logger.error(`[Scraper API] Status: ${status} - ${message}`);
  } else if (status === 'completed') {
    logger.info(`[Scraper API] Status: ${status} - ${message}`);
  } else {
    logger.info(`[Scraper API] Status: ${status} - ${message}`);
  }

  onProgress({
    status,
    message,
    count,
    limit,
    item,
    timestamp: new Date().toISOString()
  });
}


export async function scrapeGoogleMaps(
  options: ScraperOptions,
  onProgress: ScrapeProgressCallback,
  signal?: AbortSignal
): Promise<ScrapedItem[]> {
  const { query, location, limit, deepScrape } = options;
  const scrapedItems: ScrapedItem[] = [];
  const seenNamesAndUrls = new Set<string>();
  
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    if (signal?.aborted) throw new Error('Scraping cancelled by user');

    emitProgress(onProgress, 'initializing', 'Launching Puppeteer browser instance...', 0, limit);
    
    browser = await launchBrowser();
    page = await browser.newPage();
    
    // Set User Agent and language headers to prevent bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    const searchQuery = location ? `${query} in ${location}` : query;
    emitProgress(onProgress, 'searching', `Navigating and searching Google Maps for "${searchQuery}"...`, 0, limit);
    
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
      // Fallback wait if domcontentloaded takes too long
      return page?.waitForSelector('body');
    });

    // Give extra 2 seconds for JS execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (signal?.aborted) throw new Error('Scraping cancelled by user');

    // Check if redirected directly to a detail page (single result)
    const isDetailPage = await page.evaluate(() => {
      const hasFeed = !!document.querySelector('div[role="feed"]') || 
                      !!document.querySelector('div[aria-label*="Results"]') ||
                      !!document.querySelector('a[href*="/maps/place/"]');
      const hasAddressButton = !!document.querySelector('button[data-item-id="address"]') ||
                               !!document.querySelector('button[aria-label*="Address:"]');
      return !hasFeed && hasAddressButton;
    });

    if (isDetailPage) {
      emitProgress(onProgress, 'extracting_details', 'Direct match found! Extracting single business details...', 0, limit);
      const name = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || 'Single Result');
      const detailInfo = await extractDetails(page);
      
      const item: ScrapedItem = {
        id: btoa(name + page.url()).substring(0, 16),
        name,
        rating: detailInfo.rating || 5.0,
        reviewsCount: detailInfo.reviewsCount || 1,
        category: detailInfo.category || 'Business',
        address: detailInfo.address || 'Address listed',
        phone: detailInfo.phone || '',
        website: detailInfo.website || '',
        mapsUrl: page.url(),
        scrapedAt: new Date().toISOString(),
        ...detailInfo
      };

      scrapedItems.push(item);
      emitProgress(onProgress, 'completed', 'Scraping completed successfully!', 1, limit, item);
      return scrapedItems;
    }

    emitProgress(onProgress, 'scrolling', 'Waiting for search results to load...', 0, limit);

    // Wait for either list results card or direct business details page to appear
    const loadSuccess = await page.waitForFunction(() => {
      return !!document.querySelector('a[href*="/maps/place/"]') || 
             !!document.querySelector('button[data-item-id="address"]') ||
             !!document.querySelector('button[aria-label*="Address:"]') ||
             document.body.innerText.includes("Google Maps can't find") ||
             document.body.innerText.includes("No results");
    }, { timeout: 15000 }).catch(() => false);

    if (!loadSuccess) {
      throw new Error('No search results found on Google Maps. Try refining your search query.');
    }

    let consecutiveNoNewItems = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 100;

    while (scrapedItems.length < limit && scrollAttempts < maxScrollAttempts) {
      if (signal?.aborted) throw new Error('Scraping cancelled by user');

      emitProgress(
        onProgress, 
        'scrolling', 
        `Scrolling and gathering search list items (Found: ${scrapedItems.length}/${limit})...`, 
        scrapedItems.length, 
        limit
      );

      // Scroll the list feed
      const scrollStatus = await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]') ||
                     document.querySelector('div[aria-label*="Results"]') ||
                     document.querySelector('a[href*="/maps/place/"]')?.closest('div[style*="overflow-y"]');
        if (feed) {
          feed.scrollBy(0, 1200);
          return {
            scrolled: true,
            reachedEnd: document.body.innerText.includes("You've reached the end") || 
                        document.body.innerText.includes("No more results") ||
                        document.body.innerText.includes("reached the end")
          };
        }
        return { scrolled: false, reachedEnd: true };
      });

      // Wait a moment for dynamic results to load
      await new Promise(resolve => setTimeout(resolve, 1500));
      scrollAttempts++;

      // Extract items currently visible in the feed
      const currentBatch = await extractListItems(page);
      
      let newItemsInBatch = 0;

      for (const rawItem of currentBatch) {
        if (scrapedItems.length >= limit) break;
        if (signal?.aborted) throw new Error('Scraping cancelled by user');

        const uniqueKey = `${rawItem.name}_${rawItem.mapsUrl}`;
        if (seenNamesAndUrls.has(uniqueKey)) continue;

        seenNamesAndUrls.add(uniqueKey);
        newItemsInBatch++;

        const completedItem: ScrapedItem = {
          id: rawItem.id || btoa(uniqueKey).substring(0, 16),
          name: rawItem.name || 'Unknown',
          rating: rawItem.rating,
          reviewsCount: rawItem.reviewsCount,
          category: rawItem.category || 'Business',
          address: rawItem.address || 'Address listed',
          phone: rawItem.phone || '',
          website: rawItem.website || '',
          mapsUrl: rawItem.mapsUrl || '',
          scrapedAt: new Date().toISOString()
        };

        if (deepScrape && completedItem.mapsUrl) {
          // DEEP SCRAPE: Open business detail page
          try {
            emitProgress(
              onProgress,
              'extracting_details',
              `[Deep Scrape] Fetching website and phone for "${completedItem.name}"...`,
              scrapedItems.length,
              limit
            );
            
            // Create a separate tab for business details
            const detailPage = await browser.newPage();
            await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await detailPage.setExtraHTTPHeaders({
              'Accept-Language': 'en-US,en;q=0.9'
            });
            
            await detailPage.goto(completedItem.mapsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const details = await extractDetails(detailPage);
            
            if (details.phone) completedItem.phone = details.phone;
            if (details.website) completedItem.website = details.website;
            if (details.address) completedItem.address = details.address;
            if (details.category) completedItem.category = details.category;
            
            await detailPage.close();
          } catch (deepError) {
            logger.error(`[Scraper Engine] Deep scrape failed for ${completedItem.name}`, deepError);
            // Fallback: keep the item as-is, continue scraping
          }
        }

        scrapedItems.push(completedItem);
        emitProgress(
          onProgress,
          'extracting_list',
          `Scraped: "${completedItem.name}" (Rating: ${completedItem.rating || 'N/A'}, Phone: ${completedItem.phone || 'N/A'})`,
          scrapedItems.length,
          limit,
          completedItem
        );
      }

      if (newItemsInBatch === 0) {
        consecutiveNoNewItems++;
      } else {
        consecutiveNoNewItems = 0;
      }

      // Stop if scrolled and found no new items, or hit the end text
      if (scrollStatus.reachedEnd || consecutiveNoNewItems > 5) {
        emitProgress(
          onProgress,
          'scrolling',
          scrollStatus.reachedEnd 
            ? 'Reached the end of Google Maps results list!'
            : 'No new results loading, completing search...',
          scrapedItems.length,
          limit
        );
        break;
      }
    }

    emitProgress(onProgress, 'completed', `Successfully scraped ${scrapedItems.length} locations.`, scrapedItems.length, limit);
    return scrapedItems;
  } catch (err: any) {
    emitProgress(onProgress, 'error', `Error occurred: ${err.message || err}`, scrapedItems.length, limit);
    throw err;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await closeBrowser(browser).catch(() => {});
  }
}
export default scrapeGoogleMaps;
