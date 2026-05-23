export interface ScrapedItem {
  id: string;
  name: string;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  scrapedAt: string;
}

export interface ScraperOptions {
  query: string;
  location: string;
  limit: number;
  deepScrape: boolean;
}

export type ScrapeProgressStatus = 
  | 'initializing'
  | 'searching'
  | 'scrolling'
  | 'extracting_list'
  | 'extracting_details'
  | 'completed'
  | 'error';

export interface ScrapeProgress {
  status: ScrapeProgressStatus;
  message: string;
  count: number;
  limit: number;
  item?: ScrapedItem;
  timestamp: string;
}

export type ScrapeProgressCallback = (progress: ScrapeProgress) => void;
