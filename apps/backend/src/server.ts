import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { BotEventBus } from '@zaloridebot/bot-core';
import { registerBotRoutes } from './routes/bot-routes.js';
import { registerBotEventSocket } from './ws/bot-events-socket.js';

export type BotSnapshot = {
  state: string;
  groups: Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>;
};

type Dependencies = {
  getSnapshot(): BotSnapshot;
  startBot?(): Promise<void>;
  stopBot?(): Promise<void>;
  saveGroupConfig?(groupId: string, payload: unknown): Promise<void>;
  eventBus?: BotEventBus;
};

export function buildServer(provider: Dependencies) {
  const controls = {
    startBot: provider.startBot ?? (async () => {}),
    stopBot: provider.stopBot ?? (async () => {}),
    saveGroupConfig: provider.saveGroupConfig ?? (async () => {})
  };
  const app = Fastify();
  app.register(websocket);
  app.register(async (instance) => {
    await registerBotRoutes(instance, {
      getSnapshot: provider.getSnapshot,
      ...controls
    });
    if (provider.eventBus) {
      await registerBotEventSocket(instance, provider.eventBus);
    }
  });
  return app;
}
