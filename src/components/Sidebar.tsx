import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SidebarProps {
  query: string;
  setQuery: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  limit: number;
  setLimit: (val: number) => void;
  deepScrape: boolean;
  setDeepScrape: (val: boolean) => void;
  isScraping: boolean;
  onStartScrape: (e: React.FormEvent) => void;
  onStopScrape: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  query,
  setQuery,
  location,
  setLocation,
  limit,
  setLimit,
  deepScrape,
  setDeepScrape,
  isScraping,
  onStartScrape,
  onStopScrape,
}) => {
  return (
    <aside className="glass-card sidebar">
      <form onSubmit={onStartScrape}>
        <div className="form-group">
          <label htmlFor="query">Keyword</label>
          <div className="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <Input
              id="query"
              type="text"
              className="form-input"
              placeholder="e.g. Bakeries, Dentists, Cafes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              disabled={isScraping}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <div className="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
            </svg>
            <Input
              id="location"
              type="text"
              className="form-input"
              placeholder="e.g. New York, London, Paris"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isScraping}
            />
          </div>
        </div>

        <div className="form-group sidebar-slider-wrap">
          <div className="range-header">
            <span>Search Limit</span>
            <span><strong>{limit}</strong> items</span>
          </div>
          <div className="sidebar-slider-control">
            <Slider
              value={[limit]}
              onValueChange={(val) => {
                if (Array.isArray(val)) {
                  setLimit(val[0]);
                } else if (typeof val === 'number') {
                  setLimit(val);
                }
              }}
              min={5}
              max={100}
              step={5}
              disabled={isScraping}
            />
          </div>
        </div>

        <div className="form-group sidebar-field-wrap">
          <div className="switch-group">
            <div className="switch-label">
              <span className="switch-title">Deep Scrape Mode</span>
              <span className="switch-desc">Clicks businesses to extract phone & web</span>
            </div>
            <Switch
              checked={deepScrape}
              onCheckedChange={setDeepScrape}
              disabled={isScraping}
            />
          </div>
        </div>

        {isScraping ? (
          <Button 
            type="button" 
            variant="destructive"
            className="w-full h-10 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-px"
            onClick={onStopScrape}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="sidebar-btn-icon">
              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
            </svg>
            Abort Scrape
          </Button>
        ) : (
          <Button 
            type="submit" 
            className="w-full h-10 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-px bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            disabled={!query}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="sidebar-btn-icon">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
            </svg>
            Start Extracting
          </Button>
        )}
      </form>
    </aside>
  );
};
export default Sidebar;
