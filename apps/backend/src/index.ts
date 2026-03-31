import type { BotSnapshot } from '@zaloridebot/bot-core';
import { buildServer } from './server.js';

const server = buildServer({
  getSnapshot() {
    const snapshot: BotSnapshot = { state: 'idle', groups: [] };
    return snapshot;
  }
});

await server.listen({ port: 3000, host: '0.0.0.0' });
