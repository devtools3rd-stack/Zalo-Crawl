import type { FastifyInstance } from 'fastify';

type Snapshot = { state: string; groups: unknown[] };

type BotRouteDependencies = {
  getSnapshot(): Snapshot;
  startBot(): Promise<void>;
  stopBot(): Promise<void>;
  saveGroupConfig(groupId: string, payload: unknown): Promise<void>;
};

export async function registerBotRoutes(app: FastifyInstance, provider: BotRouteDependencies) {
  app.get('/api/bot/state', async () => provider.getSnapshot());

  app.post('/api/bot/start', async (_, reply) => {
    await provider.startBot();
    return reply.code(202).send({ ok: true });
  });

  app.post('/api/bot/stop', async (_, reply) => {
    await provider.stopBot();
    return reply.code(202).send({ ok: true });
  });

  app.put('/api/groups/:groupId', async (request, reply) => {
    const { groupId } = request.params as { groupId: string };
    await provider.saveGroupConfig(groupId, request.body);
    return reply.code(204).send();
  });
}
