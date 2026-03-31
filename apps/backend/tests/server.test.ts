import { describe, expect, it } from 'vitest';
import type { BotSnapshot } from '@zaloridebot/bot-core';
import { buildServer } from '../src/server.js';

async function waitFor(check: () => boolean, timeoutMs = 500) {
  const startedAt = Date.now();

  while (!check()) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`Condition not met within ${timeoutMs}ms`);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }
}

describe('backend server', () => {
  it('returns the current bot state', async () => {
    const snapshot: BotSnapshot = { state: 'idle', groups: [] };
    const server = buildServer({
      getSnapshot() {
        return snapshot;
      }
    });

    const response = await server.inject({
      method: 'GET',
      url: '/api/bot/state'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(snapshot);

    await server.close();
  });

  it('returns groups from the injected bot snapshot provider', async () => {
    const server = buildServer({
      getSnapshot() {
        return {
          state: 'monitoring',
          groups: [{ id: 'group-1', name: 'Nhom 1' }]
        };
      }
    });

    const response = await server.inject({
      method: 'GET',
      url: '/api/bot/state'
    });

    expect(response.json().groups[0].name).toBe('Nhom 1');

    await server.close();
  });

  it('forwards emitted events to websocket clients and unsubscribes on close', async () => {
    let listener: ((event: { type: string; timestamp: string; payload: Record<string, unknown> }) => void) | undefined;
    let unsubscribeCalls = 0;

    const server = buildServer({
      getSnapshot() {
        return { state: 'idle', groups: [] };
      },
      eventBus: {
        onAny(nextListener) {
          listener = nextListener;

          return () => {
            unsubscribeCalls += 1;
            listener = undefined;
          };
        }
      }
    });

    await server.ready();

    const address = await server.listen({ port: 0, host: '127.0.0.1' });
    const socket = new WebSocket(`${address.replace('http://', 'ws://')}/ws/events`);

    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => {
        resolve();
      }, { once: true });
      socket.addEventListener('error', () => {
        reject(new Error('WebSocket failed to connect'));
      }, { once: true });
    });

    const message = new Promise<string>((resolve) => {
      socket.addEventListener('message', (event) => {
        resolve(String(event.data));
      }, { once: true });
    });

    listener?.({
      type: 'bot.state_changed',
      timestamp: '2026-03-31T16:00:00.000Z',
      payload: { state: 'monitoring' }
    });

    expect(JSON.parse(await message)).toEqual({
      type: 'bot.state_changed',
      timestamp: '2026-03-31T16:00:00.000Z',
      payload: { state: 'monitoring' }
    });

    const closed = new Promise<void>((resolve) => {
      socket.addEventListener('close', () => {
        resolve();
      }, { once: true });
    });

    socket.close();
    await closed;

    await waitFor(() => unsubscribeCalls === 1);

    listener?.({
      type: 'bot.state_changed',
      timestamp: '2026-03-31T16:00:01.000Z',
      payload: { state: 'idle' }
    });

    expect(unsubscribeCalls).toBe(1);

    await server.close();
  });

  it('starts the bot from the control endpoint', async () => {
    let started = false;
    const server = buildServer({
      getSnapshot() {
        return { state: 'idle', groups: [] };
      },
      async startBot() {
        started = true;
      },
      async stopBot() {},
      async saveGroupConfig() {}
    });

    const response = await server.inject({
      method: 'POST',
      url: '/api/bot/start'
    });

    expect(response.statusCode).toBe(202);
    expect(started).toBe(true);

    await server.close();
  });
});
