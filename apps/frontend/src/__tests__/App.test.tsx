import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the sidebar brand', () => {
    render(<App />);
    expect(screen.getAllByText('ZaloRideBot').length).toBeGreaterThan(0);
  });

  it('renders hero stats', () => {
    render(<App />);
    expect(screen.getByText('98.4%')).toBeInTheDocument();
    expect(screen.getByText('12ms')).toBeInTheDocument();
  });

  it('renders Live Ride Feed header', () => {
    render(<App />);
    expect(screen.getByText('Live Ride Feed')).toBeInTheDocument();
  });

  it('renders the optimal match ride item', () => {
    render(<App />);
    expect(screen.getByText('Optimal Match')).toBeInTheDocument();
    expect(screen.getByText('285,000đ')).toBeInTheDocument();
  });
});
