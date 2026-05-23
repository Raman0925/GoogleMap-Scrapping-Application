import { NextRequest } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scraper/engine';
import { ScraperOptions } from '@/types/scraper';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const location = searchParams.get('location') || '';
    const limitStr = searchParams.get('limit') || '10';
    const deepScrapeStr = searchParams.get('deepScrape') || 'false';

    logger.info(`[API GET /api/scrape] Search Query: "${query}", Location: "${location}", Limit: ${limitStr}, DeepScrape: ${deepScrapeStr}`);

    if (!query) {
      logger.warn('[API GET /api/scrape] Missing query parameter');
      return new Response(
        JSON.stringify({ error: 'Search query is required' }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const options: ScraperOptions = {
      query,
      location,
      limit: parseInt(limitStr, 10) || 10,
      deepScrape: deepScrapeStr === 'true',
    };

    const encoder = new TextEncoder();
    const abortController = new AbortController();
    const signal = abortController.signal;

    const stream = new ReadableStream({
      async start(controller) {
        // Enqueue keep-alive message immediately to prevent gateway timeouts
        controller.enqueue(encoder.encode(': keepalive\n\n'));

        const sendEvent = (event: string, data: any) => {
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
            );
          } catch (e) {
            logger.error('[API GET /api/scrape] Failed to enqueue data to stream', e);
          }
        };

        try {
          await scrapeGoogleMaps(options, (progress) => {
            sendEvent('progress', progress);
          }, signal);
        } catch (error: any) {
          logger.error('[API GET /api/scrape] Error during scraping', error);
          sendEvent('error', { message: error.message || 'Scraping failed' });
        } finally {
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        }
      },
      cancel() {
        logger.warn('[API GET /api/scrape] Client closed connection. Aborting Puppeteer scraper engine...');
        abortController.abort();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for Nginx
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
export default GET;
