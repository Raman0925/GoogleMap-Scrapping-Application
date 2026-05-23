import { ScrapedItem } from '@/types/scraper';
import { Page } from 'puppeteer';

export async function extractListItems(page: Page): Promise<Partial<ScrapedItem>[]> {
  return page.evaluate(() => {
    const safeBtoa = (str: string): string => {
      try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
          String.fromCharCode(parseInt(p1, 16))
        ));
      } catch (e) {
        return btoa(str);
      }
    };

    const items: Partial<ScrapedItem>[] = [];
    const links = document.querySelectorAll('a[href*="/maps/place/"]');
    
    links.forEach((linkEl) => {
      const href = (linkEl as HTMLAnchorElement).href;
      if (!href) return;
      
      // Find the card container
      const card = linkEl.closest('div[role="article"]') || linkEl.parentElement;
      if (!card) return;
      
      // Extract Name - typically inside aria-label of the link or in a .fontHeadlineSmall div
      let name = linkEl.getAttribute('aria-label') || '';
      if (!name) {
        const headlineEl = card.querySelector('.fontHeadlineSmall');
        name = headlineEl?.textContent?.trim() || '';
      }
      
      // Clean up name if it has "·" or other indicators
      if (name) {
        name = name.replace(/·/g, '').trim();
      } else {
        return; // Skip if no name
      }
      
      // Avoid duplicate items in current batch
      if (items.some(item => item.name === name || item.mapsUrl === href)) {
        return;
      }

      // Extract Rating and Review Count
      let rating: number | undefined = undefined;
      let reviewsCount: number | undefined = undefined;
      
      // Star span search: aria-label contains "stars" or similar pattern
      const starsEl = card.querySelector('span[aria-label*="stars"]');
      if (starsEl) {
        const ariaLabel = starsEl.getAttribute('aria-label') || '';
        const starsMatch = ariaLabel.match(/([\d.]+)\s*stars?/i);
        const reviewsMatch = ariaLabel.match(/([\d,]+)\s*reviews/i);
        
        if (starsMatch) rating = parseFloat(starsMatch[1]);
        if (reviewsMatch) reviewsCount = parseInt(reviewsMatch[1].replace(/,/g, ''), 10);
      }
      
      // Fallback for rating/reviews
      if (rating === undefined) {
        const ratingTextEl = card.querySelector('span[role="img"]');
        if (ratingTextEl) {
          const label = ratingTextEl.getAttribute('aria-label') || '';
          const match = label.match(/([\d.]+)\s*stars?/i);
          if (match) rating = parseFloat(match[1]);
        }
      }
      
      // Extract Category, Address, Phone, Website from the card details
      let category = '';
      let address = '';
      let phone = '';
      let website = '';
      
      // Google Maps card has multiple divs with text info
      const infoDivs = card.querySelectorAll('div');
      const textLines: string[] = [];
      infoDivs.forEach(div => {
        // Get direct text contents
        const text = div.textContent?.trim() || '';
        if (text && !textLines.includes(text) && text !== name && !text.includes('stars') && !text.includes('reviews')) {
          textLines.push(text);
        }
      });
      
      // Search for a line that contains the "·" (middle dot) divider, which separates Category, Price, and Address
      const dividerLine = textLines.find(line => line.includes('·'));
      if (dividerLine) {
        const parts = dividerLine.split('·').map(p => p.trim());
        if (parts.length > 0) {
          category = parts[0];
        }
        if (parts.length > 1) {
          // Address is often the second part if it's not pricing (e.g. $$, $$$)
          if (parts[1].match(/^\$+/)) {
            if (parts.length > 2) address = parts[2];
          } else {
            address = parts[1];
          }
        }
      } else {
        // If no middle dot, find the most address-like string
        const addressLine = textLines.find(line => 
          line.match(/\b(st|ave|rd|blvd|lane|way|court|drive|square|street|avenue|road|highway|boulevard|circle)\b/i) ||
          line.match(/\b\d+\b/)
        );
        if (addressLine) address = addressLine;
        
        // Category might be the first text block that is short and not address-like
        const possibleCategory = textLines.find(line => line.length < 20 && !line.match(/\b\d+\b/));
        if (possibleCategory) category = possibleCategory;
      }

      // Check for visible phone numbers in list items
      const phoneMatch = textLines.find(line => line.match(/^\+?[\d\s-()]{7,20}$/));
      if (phoneMatch) phone = phoneMatch;

      // Try to find website link if visible on the card
      const websiteLink = card.querySelector('a[aria-label*="Website"], a[data-value="Website"]') as HTMLAnchorElement;
      if (websiteLink && websiteLink.href) {
        website = websiteLink.href;
      }

      items.push({
        id: safeBtoa(name + href).substring(0, 16), // simple unique id
        name,
        rating,
        reviewsCount,
        category: category || 'Business',
        address: address || 'No address details listed',
        phone: phone || '',
        website: website || '',
        mapsUrl: href,
        scrapedAt: new Date().toISOString()
      });
    });
    
    return items;
  });
}

export async function extractDetails(page: Page): Promise<Partial<ScrapedItem>> {
  return page.evaluate(() => {
    const details: Partial<ScrapedItem> = {};
    
    // 1. Extract Website
    const websiteEl = document.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement;
    if (websiteEl && websiteEl.href) {
      details.website = websiteEl.href;
    } else {
      const fallbackWebsite = document.querySelector('a[aria-label*="Website"], a[href^="http"]:not([href*="google.com"]):not([href*="gstatic.com"])') as HTMLAnchorElement;
      if (fallbackWebsite && fallbackWebsite.href) {
        details.website = fallbackWebsite.href;
      }
    }
    
    // 2. Extract Phone Number
    const phoneEl = document.querySelector('button[data-item-id^="phone:tel:"]') as HTMLButtonElement;
    if (phoneEl) {
      const itemId = phoneEl.getAttribute('data-item-id') || '';
      details.phone = itemId.replace('phone:tel:', '').trim();
    } else {
      const phoneButton = document.querySelector('button[aria-label*="Phone:"]') as HTMLButtonElement;
      if (phoneButton) {
        const label = phoneButton.getAttribute('aria-label') || '';
        details.phone = label.replace(/Phone:\s*/i, '').trim();
      }
    }
    
    // 3. Extract Full Address
    const addressEl = document.querySelector('button[data-item-id="address"]') as HTMLButtonElement;
    if (addressEl) {
      details.address = addressEl.textContent?.trim() || '';
    } else {
      const addressButton = document.querySelector('button[aria-label*="Address:"]') as HTMLButtonElement;
      if (addressButton) {
        const label = addressButton.getAttribute('aria-label') || '';
        details.address = label.replace(/Address:\s*/i, '').trim();
      }
    }

    // 4. Extract Category if not set
    const categoryEl = document.querySelector('button[jsaction*="pane.rating.category"]');
    if (categoryEl) {
      details.category = categoryEl.textContent?.trim() || '';
    }

    return details;
  });
}
