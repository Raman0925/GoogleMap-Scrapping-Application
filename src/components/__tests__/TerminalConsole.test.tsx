import React from 'react';
import { render, screen } from '@testing-library/react';
import TerminalConsole from '../TerminalConsole';

describe('TerminalConsole Component (Simple Premium Progress Card)', () => {
  const defaultLogs: any[] = [
    { text: 'Launching Puppeteer browser instance...', type: 'info', timestamp: '19:00:00' },
    { text: 'Navigating and searching Google Maps for "Bakery in Mumbai"...', type: 'info', timestamp: '19:00:02' },
  ];

  it('renders standby message and initial status when logs array is empty', () => {
    render(<TerminalConsole logs={[]} isScraping={false} />);
    expect(screen.getByText(/System standing by/i)).toBeInTheDocument();
    expect(screen.getByText('Ready to Extract')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Items Extracted')).toBeInTheDocument();
  });

  it('renders progress percentage and active labels correctly based on log history', () => {
    render(<TerminalConsole logs={defaultLogs} isScraping={true} />);

    // Since we have 'searching', status should recognize searching maps and approximate 30% progress
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('Searching Google Maps...')).toBeInTheDocument();
    expect(screen.getByText('Current Action')).toBeInTheDocument();
  });

  it('shows the active status dot with appropriate status label when scraping is active', () => {
    const { container } = render(<TerminalConsole logs={defaultLogs} isScraping={true} />);
    const dot = container.querySelector('.progress-status-dot.dot-active');
    expect(dot).toBeInTheDocument();
  });

  it('renders scraped items counter accurately', () => {
    const logsWithItems = [
      ...defaultLogs,
      { text: 'Scraped "Baker Cafe"', type: 'item', timestamp: '19:00:05' },
      { text: 'Scraped "Sweet Bakery"', type: 'item', timestamp: '19:00:08' },
    ];
    render(<TerminalConsole logs={logsWithItems} isScraping={true} />);

    // Assert that Items Extracted panel renders the count "2"
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('matches HTML snapshot structure', () => {
    const { asFragment } = render(<TerminalConsole logs={defaultLogs} isScraping={false} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
