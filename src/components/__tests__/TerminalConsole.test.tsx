import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TerminalConsole from '../TerminalConsole';

// Mock scrollIntoView in JSDOM environment
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('TerminalConsole Component (Modern Stepper UI)', () => {
  const defaultLogs: any[] = [
    { text: 'Launching Puppeteer browser instance...', type: 'info', timestamp: '19:00:00' },
    { text: 'Navigating and searching Google Maps for "Bakery in Mumbai"...', type: 'info', timestamp: '19:00:02' },
  ];

  it('renders standby message and pending steps when logs array is empty', () => {
    render(<TerminalConsole logs={[]} isScraping={false} />);
    expect(screen.getByText(/System standing by/i)).toBeInTheDocument();
    expect(screen.getByText('Browser Initialization')).toBeInTheDocument();
    expect(screen.getByText('Finalizing Dataset')).toBeInTheDocument();
    expect(screen.getByText('0% Completed')).toBeInTheDocument();
  });

  it('renders progress percentage and stage titles correctly based on log history', () => {
    render(<TerminalConsole logs={defaultLogs} isScraping={true} />);

    // Since we have logs with 'browser instance' and 'searching', the active step should be 'Target Navigation' (30%)
    expect(screen.getByText('30% Completed')).toBeInTheDocument();
    expect(screen.getByText('Browser Initialization')).toBeInTheDocument();
    expect(screen.getByText('Target Navigation')).toBeInTheDocument();
  });

  it('shows the active-spinner-ring indicator when isScraping is true', () => {
    const { container } = render(<TerminalConsole logs={defaultLogs} isScraping={true} />);
    const spinner = container.querySelector('.active-spinner-ring');
    expect(spinner).toBeInTheDocument();
  });

  it('toggles the detailed system logs accordion drawer on click', () => {
    render(<TerminalConsole logs={defaultLogs} isScraping={false} />);

    // Collapsed by default - raw logs shouldn't be visible
    expect(screen.queryByText('[19:00:00] Launching Puppeteer browser instance...')).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /View Detailed System Output Logs/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click to expand drawer
    fireEvent.click(toggleBtn);

    // Now raw logs should be visible
    expect(screen.getByText('[19:00:00] Launching Puppeteer browser instance...')).toBeInTheDocument();
    expect(screen.getByText('[19:00:02] Navigating and searching Google Maps for "Bakery in Mumbai"...')).toBeInTheDocument();

    // Click again to collapse drawer
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('[19:00:00] Launching Puppeteer browser instance...')).not.toBeInTheDocument();
  });

  it('matches HTML snapshot structure', () => {
    const { asFragment } = render(<TerminalConsole logs={defaultLogs} isScraping={false} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
