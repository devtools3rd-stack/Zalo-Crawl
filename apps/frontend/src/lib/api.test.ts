import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBotSnapshot, startBot, stopBot, saveGroupConfig } from './api';

describe('fetchBotSnapshot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed bot snapshot', async () => {
    const snapshot = { state: 'idle', groups: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => snapshot,
      }),
    );

    const result = await fetchBotSnapshot();
    expect(result).toEqual(snapshot);
  });
});

describe('startBot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to /api/bot/start', async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', mockFetch);

    await startBot();

    expect(mockFetch).toHaveBeenCalledWith('/api/bot/start', { method: 'POST' });
  });
});

describe('stopBot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to /api/bot/stop', async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', mockFetch);

    await stopBot();

    expect(mockFetch).toHaveBeenCalledWith('/api/bot/stop', { method: 'POST' });
  });
});

describe('saveGroupConfig', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('puts to /api/groups/:groupId with json body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', mockFetch);

    await saveGroupConfig('group-1', { defaultReply: 'Hello!' });

    expect(mockFetch).toHaveBeenCalledWith('/api/groups/group-1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ defaultReply: 'Hello!' }),
    });
  });
});
