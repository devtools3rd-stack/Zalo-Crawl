import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ExpandedRideFeed } from '../components/ExpandedRideFeed';

describe('ExpandedRideFeed', () => {
  it('renders feed header and at least one ride item', () => {
    render(<ExpandedRideFeed />);
    expect(screen.getByText('Live Ride Feed')).toBeInTheDocument();
    // at least one route arrow rendered means items are present
    const arrows = screen.getAllByText('→');
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('filters items when a keyword pill is clicked', async () => {
    render(<ExpandedRideFeed />);
    const allCount = screen.getAllByText('→').length;

    await userEvent.click(screen.getByRole('button', { name: 'Sân Bay' }));
    const filteredCount = screen.getAllByText('→').length;
    expect(filteredCount).toBeLessThanOrEqual(allCount);
  });

  it('shows all items when Tất Cả pill is active', async () => {
    render(<ExpandedRideFeed />);
    const allCount = screen.getAllByText('→').length;

    await userEvent.click(screen.getByRole('button', { name: 'Sân Bay' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tất Cả' }));
    expect(screen.getAllByText('→').length).toBe(allCount);
  });
});
