import React, { useRef, useEffect, useState } from 'react';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'item' | 'scrolling';
  timestamp: string;
}

interface TerminalConsoleProps {
  logs: TerminalLine[];
  isScraping: boolean;
}

interface PipelineStep {
  id: number;
  title: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 0, title: 'Browser Initialization', description: 'Setting up secure headless Chromium browser instance' },
  { id: 1, title: 'Target Navigation', description: 'Searching Google Maps for keywords and location' },
  { id: 2, title: 'Feed Scroll & Pagination', description: 'Scrolling listing feed and extracting basic profiles' },
  { id: 3, title: 'Detail Page Scraping', description: 'Deep scraping business website, phone and coordinates' },
  { id: 4, title: 'Finalizing Dataset', description: 'Formulating structured files and sorting statistics' },
];

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs, isScraping }) => {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Determine pipeline steps statuses
  const getStepStatus = (stepId: number): 'pending' | 'active' | 'completed' | 'failed' => {
    if (logs.length === 0) return 'pending';

    // Scan logs to determine step progress
    const hasError = logs.some(l => l.type === 'error');
    const latestLog = logs[logs.length - 1];

    // Detect milestones in logs history
    const hasInitialized = logs.some(l => l.text.includes('browser instance') || l.text.includes('Initializing') || l.text.includes('Launching'));
    const hasSearched = logs.some(l => l.text.includes('searching') || l.text.includes('Navigating and searching') || l.text.includes('Waiting for search'));
    const hasScrolled = logs.some(l => l.text.includes('Scrolling') || l.text.includes('scrolling') || l.text.includes('scraped') || l.text.includes('Scraped:'));
    const hasDeepScraped = logs.some(l => l.text.includes('[Deep Scrape]') || l.text.includes('website and phone'));
    const hasCompleted = logs.some(l => l.text.includes('completed successfully') || l.text.includes('Successfully scraped') || l.text.includes('completed'));

    if (hasError && stepId === getActiveStepId()) {
      return 'failed';
    }

    if (hasCompleted) {
      return 'completed';
    }

    switch (stepId) {
      case 0:
        if (hasSearched) return 'completed';
        if (hasInitialized) return 'active';
        return 'pending';
      case 1:
        if (hasScrolled) return 'completed';
        if (hasSearched) return 'active';
        return 'pending';
      case 2:
        // If we are deep scraping or completed, scrolling is done
        if (hasDeepScraped) return 'completed';
        if (hasScrolled) return 'active';
        return 'pending';
      case 3:
        if (hasCompleted) return 'completed';
        if (hasDeepScraped) return 'active';
        return 'pending';
      case 4:
        if (hasCompleted) return 'completed';
        if (latestLog?.text.includes('completed') || latestLog?.text.includes('saving')) return 'active';
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getActiveStepId = (): number => {
    if (logs.length === 0) return 0;
    const hasCompleted = logs.some(l => l.text.includes('completed successfully') || l.text.includes('Successfully scraped') || l.text.includes('completed'));
    if (hasCompleted) return 5; // All steps done

    for (let i = 4; i >= 0; i--) {
      if (getStepStatus(i) === 'active') return i;
    }
    // Fallback based on keywords of latest log
    const latestText = logs[logs.length - 1].text.toLowerCase();
    if (latestText.includes('initializing') || latestText.includes('launching')) return 0;
    if (latestText.includes('navigating') || latestText.includes('searching') || latestText.includes('maps for')) return 1;
    if (latestText.includes('scrolling') || latestText.includes('gathering')) return 2;
    if (latestText.includes('deep') || latestText.includes('fetching website') || latestText.includes('extracting website')) return 3;
    if (latestText.includes('completed') || latestText.includes('success')) return 4;

    return 0;
  };

  const activeStepId = getActiveStepId();
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Approximate percentage progress
  const getProgressPercentage = (): number => {
    if (logs.length === 0) return 0;
    const hasCompleted = logs.some(l => l.text.includes('completed') || l.text.includes('Successfully scraped'));
    if (hasCompleted) return 100;

    switch (activeStepId) {
      case 0: return 10;
      case 1: return 30;
      case 2: return 50;
      case 3: return 80;
      case 4: return 95;
      default: return 0;
    }
  };

  const progressPercent = getProgressPercentage();

  return (
    <div className="progress-stepper-container">
      {/* Visual Stepper Header */}
      <div className="stepper-header">
        <div className="stepper-title-container">
          {isScraping && (
            <div className="active-spinner-ring">
              <span className="spinner-slice"></span>
            </div>
          )}
          <h3 className="stepper-title">Extraction Pipeline Stage</h3>
        </div>
        <div className="stepper-percentage">{progressPercent}% Completed</div>
      </div>

      {/* Modern Pipeline Stepper Flow */}
      <div className="stepper-flow">
        {PIPELINE_STEPS.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className={`step-item status-${status}`}>
              <div className="step-badge">
                {status === 'completed' && (
                  <svg className="step-icon icon-check" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {status === 'active' && (
                  <svg className="step-icon icon-spinner animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {status === 'failed' && (
                  <svg className="step-icon icon-error" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {status === 'pending' && <span className="step-dot"></span>}
              </div>
              <div className="step-content">
                <div className="step-label">{step.title}</div>
                <div className="step-desc">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Stage Activity Card */}
      <div className="active-activity-card">
        <div className="activity-label">Active Status</div>
        <div className="activity-message">
          {latestLog ? latestLog.text : 'System standing by. Configure criteria and click Start.'}
        </div>
        
        {/* Modern Progress Bar */}
        <div className="modern-progress-bar-bg">
          <div 
            className={`modern-progress-bar-fill ${isScraping ? 'animating' : ''}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Collapsible Accordion Raw Console Drawer for Backwards Compatibility & Tech Debugging */}
      <div className="diagnostics-accordion">
        <button 
          onClick={() => setIsLogsOpen(!isLogsOpen)}
          className="diagnostics-toggle-btn"
          aria-expanded={isLogsOpen}
        >
          <span>View Detailed System Output Logs</span>
          <svg 
            className={`arrow-icon ${isLogsOpen ? 'rotated' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isLogsOpen && (
          <div className="diagnostics-panel-body">
            <div className="terminal-body scrollbar-custom">
              {logs.length === 0 ? (
                <div className="terminal-line log-info">
                  System standing by. Enter search filters in the sidebar and hit "Start Extracting".
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`terminal-line log-${log.type}`}>
                    [{log.timestamp}] {log.text}
                  </div>
                ))
              )}
              <div ref={terminalEndRef}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalConsole;
