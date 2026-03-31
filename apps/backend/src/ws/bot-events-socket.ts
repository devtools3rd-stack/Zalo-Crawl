import type { FastifyInstance } from 'fastify';
import type { BotEvent } from '@zaloridebot/shared';

type BotEventStream = {
  onAny(listener: (event: BotEvent) => void): () => void;
};

export async function registerBotEventSocket(app: FastifyInstance, eventBus: BotEventStream) {
  app.get('/ws/events', { websocket: true }, (socket) => {
    const listener = (event: BotEvent) => {
      socket.send(JSON.stringify(event));
    };

    const unsubscribe = eventBus.onAny(listener);
    socket.once('close', unsubscribe);
  });
}
