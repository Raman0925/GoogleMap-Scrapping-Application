import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCards from '../StatsCards';

describe('StatsCards Component', () => {
  const defaultProps = {
    total: 15,
    limit: 20,
    avgRating: '4.3',
    withWebsitePct: 60,
    withPhonePct: 80,
  };

  it('renders stats elements with correct values', () => {
    render(<StatsCards {...defaultProps} />);

    expect(screen.getByText('Total Extracted')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('/ 20')).toBeInTheDocument();

    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();

    expect(screen.getByText('Website Coverage')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();

    expect(screen.getByText('Phone Coverage')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('matches HTML snapshot structure', () => {
    const { asFragment } = render(<StatsCards {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
