'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScrapedItem, ScrapeProgress } from '@/types/scraper';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import TerminalConsole from '@/components/TerminalConsole';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import DataTable from '@/components/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'item' | 'scrolling';
  timestamp: string;
}

export default function ScraperDashboard() {
  // Scraper Options State
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(20);
  const [deepScrape, setDeepScrape] = useState(false);

  // Scraper Engine State
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedItems, setScrapedItems] = useState<ScrapedItem[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLine[]>([]);
  const [, setCurrentProgress] = useState<ScrapeProgress | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table'>('dashboard');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ScrapedItem; direction: 'asc' | 'desc' } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const appendLog = (text: string, status: ScrapeProgress['status']) => {
    let type: TerminalLine['type'] = 'info';
    if (status === 'completed') type = 'success';
    else if (status === 'error') type = 'error';
    else if (status === 'scrolling') type = 'scrolling';
    else if (status === 'extracting_list') type = 'item';
    else if (status === 'extracting_details') type = 'warning';

    setTerminalLogs((prev) => [
      ...prev,
      {
        text,
        type,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleStartScrape = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    // Reset State
    setScrapedItems([]);
    setTerminalLogs([]);
    setCurrentProgress(null);
    setIsScraping(true);
    setActiveTab('dashboard');

    appendLog(`Initializing search for "${query}" in "${location || 'Anywhere'}"...`, 'initializing');

    const params = new URLSearchParams({
      query,
      location,
      limit: limit.toString(),
      deepScrape: deepScrape.toString(),
    });

    const eventSource = new EventSource(`/api/scrape?${params.toString()}`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('progress', (e: any) => {
      const data = JSON.parse(e.data) as ScrapeProgress;
      setCurrentProgress(data);
      appendLog(data.message, data.status);

      if (data.item) {
        setScrapedItems((prev) => {
          // Prevent duplicates
          if (prev.some((item) => item.id === data.item?.id || item.mapsUrl === data.item?.mapsUrl)) {
            return prev;
          }
          return [...prev, data.item as ScrapedItem];
        });
      }

      if (data.status === 'completed') {
        eventSource.close();
        setIsScraping(false);
      }
    });

    eventSource.addEventListener('error', (e: any) => {
      let errorMessage = 'An unexpected connection error occurred.';
      try {
        if (e.data) {
          const data = JSON.parse(e.data);
          errorMessage = data.message || errorMessage;
        }
      } catch (err) {}

      appendLog(`[ERROR] ${errorMessage}`, 'error');
      eventSource.close();
      setIsScraping(false);
    });

    eventSource.onerror = () => {
      appendLog('[CONNECTION LOST] Scraper server disconnected. Scraping session finished.', 'error');
      eventSource.close();
      setIsScraping(false);
    };
  };

  const handleStopScrape = () => {
    if (eventSourceRef.current) {
      appendLog('Scraping cancelled by user. Terminating browser context...', 'error');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsScraping(false);
  };

  // Helper Stats Calculations
  const stats = useMemo(() => {
    const total = scrapedItems.length;
    if (total === 0) {
      return { total: 0, avgRating: '0.0', withWebsitePct: 0, withPhonePct: 0 };
    }

    const itemsWithRating = scrapedItems.filter((i) => i.rating !== undefined);
    const avgRating = itemsWithRating.length > 0 
      ? (itemsWithRating.reduce((acc, curr) => acc + (curr.rating || 0), 0) / itemsWithRating.length).toFixed(1)
      : '0.0';
      
    const withWebsite = scrapedItems.filter((i) => !!i.website).length;
    const withPhone = scrapedItems.filter((i) => !!i.phone).length;

    return {
      total,
      avgRating,
      withWebsitePct: Math.round((withWebsite / total) * 100),
      withPhonePct: Math.round((withPhone / total) * 100),
    };
  }, [scrapedItems]);

  // Analytics Visual Data
  const analytics = useMemo(() => {
    const categoriesMap: Record<string, number> = {};
    scrapedItems.forEach((item) => {
      const cat = item.category || 'Business';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    const topCategories = Object.entries(categoriesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topCategories };
  }, [scrapedItems]);

  // Filter & Sort Items for Table Grid
  const filteredAndSortedItems = useMemo(() => {
    let result = [...scrapedItems];

    // Filter
    if (searchFilter) {
      const queryLower = searchFilter.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(queryLower) ||
          (item.category || '').toLowerCase().includes(queryLower) ||
          (item.address || '').toLowerCase().includes(queryLower)
      );
    }

    // Sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return direction === 'asc' ? valA - valB : valB - valA;
        }

        const strA = valA.toString().toLowerCase();
        const strB = valB.toString().toLowerCase();

        if (strA < strB) return direction === 'asc' ? -1 : 1;
        if (strA > strB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [scrapedItems, searchFilter, sortConfig]);

  const requestSort = (key: keyof ScrapedItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Exporters
  const downloadCSV = () => {
    if (scrapedItems.length === 0) return;

    const headers = ['ID', 'Name', 'Rating', 'Reviews Count', 'Category', 'Address', 'Phone', 'Website', 'Maps URL', 'Scraped At'];
    const rows = scrapedItems.map((item) => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.rating ?? '',
      item.reviewsCount ?? '',
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.address || '').replace(/"/g, '""')}"`,
      item.phone || '',
      item.website || '',
      item.mapsUrl || '',
      item.scrapedAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `google_maps_scrape_${query.replace(/\s+/g, '_') || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (scrapedItems.length === 0) return;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(scrapedItems, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `google_maps_scrape_${query.replace(/\s+/g, '_') || 'data'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header>
        <div className="brand-section">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="brand-icon">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            MapperScrape
          </h1>
          <p>SOLID & High-Performance Google Maps Web Scraping Engine</p>
        </div>

        {/* Live Active Scraper Pulsing Badge */}
        <div className={`status-indicator ${isScraping ? '' : 'idle'}`}>
          <div className="pulse-dot"></div>
          <span>{isScraping ? 'Scraping Live' : 'Scraper Idle'}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Sidebar Controls */}
        <Sidebar
          query={query}
          setQuery={setQuery}
          location={location}
          setLocation={setLocation}
          limit={limit}
          setLimit={setLimit}
          deepScrape={deepScrape}
          setDeepScrape={setDeepScrape}
          isScraping={isScraping}
          onStartScrape={handleStartScrape}
          onStopScrape={handleStopScrape}
        />

        {/* Main Panel Content */}
        <main className="main-panel">
          {/* Stats Cards */}
          <StatsCards
            total={stats.total}
            limit={limit}
            avgRating={stats.avgRating}
            withWebsitePct={stats.withWebsitePct}
            withPhonePct={stats.withPhonePct}
          />

          {/* shadcn Tabs Container */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'dashboard' | 'table')} className="w-full">
            <TabsList className="bg-transparent border-b border-glass rounded-none w-full flex justify-start gap-2 p-0 mb-4 h-auto">
              <TabsTrigger 
                value="dashboard" 
                className="tab-btn px-6 py-2.5 h-auto text-sm border-b-2 data-active:border-purple-500 rounded-none bg-transparent hover:text-white transition-all cursor-pointer select-none"
              >
                Scraper Logs & Charts
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="tab-btn px-6 py-2.5 h-auto text-sm border-b-2 data-active:border-purple-500 rounded-none bg-transparent hover:text-white transition-all cursor-pointer select-none"
              >
                Extracted Data Grid ({scrapedItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="outline-none">
              <div className="dashboard-tab-content">
                <TerminalConsole logs={terminalLogs} isScraping={isScraping} />
                <AnalyticsCharts
                  topCategories={analytics.topCategories}
                  withWebsitePct={stats.withWebsitePct}
                  withPhonePct={stats.withPhonePct}
                  totalItems={scrapedItems.length}
                />
              </div>
            </TabsContent>

            <TabsContent value="table" className="outline-none">
              <DataTable
                items={filteredAndSortedItems}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                onRequestSort={requestSort}
                onDownloadCSV={downloadCSV}
                onDownloadJSON={downloadJSON}
                totalScraped={scrapedItems.length}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
