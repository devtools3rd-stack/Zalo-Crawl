import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the dashboard brand and navigation', () => {
    render(<App />);
    expect(screen.getByText('ZaloRideBot')).toBeInTheDocument();
    // heading query avoids ambiguity with the nav link that also says "Dashboard"
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Live Ride Feed')).toBeInTheDocument();
  });

  it('renders the three stats cards', () => {
    render(<App />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('98.4%')).toBeInTheDocument();
    expect(screen.getByText('12ms')).toBeInTheDocument();
  });

  it('renders the Auto-Pilot status in sidebar', () => {
    render(<App />);
    expect(screen.getByText('AUTO-PILOT ON')).toBeInTheDocument();
  });
});
