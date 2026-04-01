import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { registerBotRoutes } from './routes/bot-routes.js';
import { registerBotEventSocket } from './ws/bot-events-socket.js';

export type DashboardSnapshot = {
  state: string;
  groups: Array<{ id: string; name: string; isPinned?: boolean; defaultReply?: string }>;
};

type BotEventStream = {
  onAny(listener: (event: { type: string; timestamp: string; payload: Record<string, unknown> }) => void): () => void;
};

type Dependencies = {
  getSnapshot(): DashboardSnapshot;
  startBot?(): Promise<void>;
  stopBot?(): Promise<void>;
  saveGroupConfig?(groupId: string, payload: unknown): Promise<void>;
  eventBus?: BotEventStream;
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
