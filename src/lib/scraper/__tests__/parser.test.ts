import { extractListItems, extractDetails } from '../parser';

describe('Scraper Parser Functions', () => {
  describe('extractListItems', () => {
    it('successfully extracts business card elements from list results', async () => {
      // Load standard mock search cards in JSDOM DOM
      document.body.innerHTML = `
        <div role="article">
          <a href="https://www.google.com/maps/place/Johns+Bakery/data=!4m" aria-label="John's Bakery">
            <div class="fontHeadlineSmall">John's Bakery</div>
          </a>
          <span aria-label="4.5 stars 12 reviews">4.5</span>
          <div>Bakery · 123 Baker St · Open</div>
        </div>
        <div role="article">
          <a href="https://www.google.com/maps/place/Star+Coffee/data=!4m" aria-label="Star Coffee">
            <div class="fontHeadlineSmall">Star Coffee</div>
          </a>
          <span aria-label="4.0 stars 8 reviews">4.0</span>
          <div>Coffee shop · 456 Espresso Rd · Closed</div>
        </div>
      `;

      // Mock Puppeteer Page evaluate wrapper
      const mockPage: any = {
        evaluate: jest.fn().mockImplementation(async (fn) => fn()),
      };

      const result = await extractListItems(mockPage);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("John's Bakery");
      expect(result[0].rating).toBe(4.5);
      expect(result[0].reviewsCount).toBe(12);
      expect(result[0].category).toBe('Bakery');
      expect(result[0].address).toBe('123 Baker St');
      expect(result[0].mapsUrl).toContain('Johns+Bakery');

      expect(result[1].name).toBe("Star Coffee");
      expect(result[1].rating).toBe(4.0);
      expect(result[1].reviewsCount).toBe(8);
      expect(result[1].category).toBe('Coffee shop');
      expect(result[1].address).toBe('456 Espresso Rd');
    });
  });

  describe('extractDetails', () => {
    it('successfully extracts detailed fields from business detail page drawer', async () => {
      document.body.innerHTML = `
        <button data-item-id="address">789 Pastry Lane, Sweet City</button>
        <button data-item-id="phone:tel:+919876543210">Call +91 98765 43210</button>
        <a data-item-id="authority" href="https://www.johnsbakery.com">Website</a>
        <button jsaction="pane.rating.category">Premium Bakery</button>
      `;

      const mockPage: any = {
        evaluate: jest.fn().mockImplementation(async (fn) => fn()),
      };

      const result = await extractDetails(mockPage);

      expect(result.address).toBe('789 Pastry Lane, Sweet City');
      expect(result.phone).toBe('+919876543210');
      expect(result.website).toBe('https://www.johnsbakery.com/');
      expect(result.category).toBe('Premium Bakery');
    });
  });
});
