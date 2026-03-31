import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the bot dashboard heading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ state: 'idle', groups: [] }),
      }),
    );
    vi.stubGlobal(
      'WebSocket',
      class {
        addEventListener() {}
        close() {}
      },
    );

    render(<App />);
    expect(screen.getByText('ZaloRideBot Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Start Bot')).toBeInTheDocument();
    expect(screen.getByText('Stop Bot')).toBeInTheDocument();
    expect(screen.getByText('No groups loaded.')).toBeInTheDocument();
  });
});
