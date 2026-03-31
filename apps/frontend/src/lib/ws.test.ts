import { afterEach, describe, expect, it, vi } from 'vitest';
import { connectBotEvents } from './ws';

describe('connectBotEvents', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the current page origin and /ws/events path', () => {
    const captured: { url?: string } = {};

    vi.stubGlobal('location', new URL('https://dashboard.example.test/app'));
    vi.stubGlobal(
      'WebSocket',
      class {
        constructor(url: string) {
          captured.url = url;
        }

        addEventListener() {}
        close() {}
      },
    );

    connectBotEvents(() => {});

    expect(captured.url).toBe('wss://dashboard.example.test/ws/events');
  });

  it('ignores malformed websocket json frames', () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;
    const received: unknown[] = [];

    vi.stubGlobal('location', new URL('http://dashboard.example.test/app'));
    vi.stubGlobal(
      'WebSocket',
      class {
        addEventListener(type: string, handler: (event: MessageEvent) => void) {
          if (type === 'message') {
            messageHandler = handler;
          }
        }

        close() {}
      },
    );

    connectBotEvents((event) => {
      received.push(event);
    });

    expect(() =>
      messageHandler?.({
        data: '{bad json',
      } as MessageEvent),
    ).not.toThrow();
    expect(received).toEqual([]);
  });
});
