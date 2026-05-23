import React from 'react';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'item' | 'scrolling';
  timestamp: string;
}

interface TerminalConsoleProps {
  logs: TerminalLine[];
  isScraping: boolean;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs, isScraping }) => {
  // Extract latest status message and count
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const activeMessage = latestLog ? latestLog.text : 'System standing by. Configure criteria and click Start Extracting.';
  
  // Calculate current progress statistics from logs
  const hasError = logs.some(l => l.type === 'error');
  const hasCompleted = logs.some(l => l.text.includes('completed successfully') || l.text.includes('Successfully scraped') || l.text.includes('completed'));
  
  // Count how many items have been scraped
  const itemsScraped = logs.filter(l => l.type === 'item').length;
  
  // Approximate pipeline percentage
  const getProgressPercentage = (): number => {
    if (logs.length === 0) return 0;
    if (hasCompleted) return 100;
    
    // Scan logs to see how far we are
    const hasInitialized = logs.some(l => l.text.includes('browser instance') || l.text.includes('Initializing') || l.text.includes('Launching'));
    const hasSearched = logs.some(l => l.text.includes('searching') || l.text.includes('Navigating and searching') || l.text.includes('Waiting for search'));
    const hasScrolled = logs.some(l => l.text.includes('Scrolling') || l.text.includes('scrolling') || l.text.includes('scraped') || l.text.includes('Scraped:'));
    const hasDeepScraped = logs.some(l => l.text.includes('[Deep Scrape]') || l.text.includes('website and phone'));
    
    if (hasDeepScraped) return 80;
    if (hasScrolled) return 50;
    if (hasSearched) return 30;
    if (hasInitialized) return 15;
    return 5;
  };
  
  const progressPercent = getProgressPercentage();
  
  // Determine current status string
  const getStatusLabel = (): string => {
    if (hasError) return 'Error Interrupted';
    if (hasCompleted) return 'Finished';
    if (isScraping) {
      if (logs.some(l => l.text.includes('[Deep Scrape]'))) return 'Deep Scraping...';
      if (logs.some(l => l.text.includes('Scrolling'))) return 'Paginating results...';
      if (logs.some(l => l.text.includes('searching'))) return 'Searching Google Maps...';
      return 'Launching Browser...';
    }
    return 'Ready to Extract';
  };
  
  const statusLabel = getStatusLabel();
  const statusType = hasError ? 'error' : hasCompleted ? 'success' : isScraping ? 'active' : 'idle';

  return (
    <div className="progress-dashboard-card">
      {/* Header */}
      <div className="progress-dashboard-header">
        <div className="progress-status-badge-container">
          <span className={`progress-status-dot dot-${statusType}`}></span>
          <span className="progress-status-label">{statusLabel}</span>
        </div>
        <div className="progress-percentage-label">{progressPercent}%</div>
      </div>
      
      {/* Body containing current status action */}
      <div className="progress-content-body">
        <h4 className="progress-active-task-title">Current Action</h4>
        <p className="progress-active-task-desc">{activeMessage}</p>
        
        {/* Simplified Premium Progress Bar */}
        <div className="premium-progress-track">
          <div 
            className={`premium-progress-fill fill-${statusType} ${isScraping ? 'animating' : ''}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Footer Metrics Panel */}
      <div className="progress-footer-metrics">
        <div className="metric-box">
          <span className="metric-label">Items Extracted</span>
          <span className="metric-value">{itemsScraped}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Execution Status</span>
          <span className="metric-value">{statusType.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default TerminalConsole;
