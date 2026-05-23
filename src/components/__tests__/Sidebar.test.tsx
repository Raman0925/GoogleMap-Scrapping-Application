import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar Component', () => {
  const defaultProps = {
    query: 'Bakery',
    setQuery: jest.fn(),
    location: 'Mumbai',
    setLocation: jest.fn(),
    limit: 20,
    setLimit: jest.fn(),
    deepScrape: false,
    setDeepScrape: jest.fn(),
    isScraping: false,
    onStartScrape: jest.fn(),
    onStopScrape: jest.fn(),
  };

  it('renders form inputs and elements with proper values', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByLabelText(/Keyword/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByText('Search Limit')).toBeInTheDocument();
    expect(screen.getByText('Deep Scrape Mode')).toBeInTheDocument();
    
    const startBtn = screen.getByRole('button', { name: /Start Extracting/i });
    expect(startBtn).toBeInTheDocument();
    expect(startBtn).not.toBeDisabled();
  });

  it('triggers onStartScrape callback on form submit', () => {
    render(<Sidebar {...defaultProps} />);

    const startBtn = screen.getByRole('button', { name: /Start Extracting/i });
    fireEvent.click(startBtn);

    expect(defaultProps.onStartScrape).toHaveBeenCalled();
  });

  it('renders disabled elements and Abort Scrape button when isScraping is true', () => {
    render(<Sidebar {...defaultProps} isScraping={true} />);

    const abortBtn = screen.getByRole('button', { name: /Abort Scrape/i });
    expect(abortBtn).toBeInTheDocument();

    const queryInput = screen.getByLabelText(/Keyword/i);
    expect(queryInput).toBeDisabled();
  });

  it('matches HTML snapshot structure', () => {
    const { asFragment } = render(<Sidebar {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
