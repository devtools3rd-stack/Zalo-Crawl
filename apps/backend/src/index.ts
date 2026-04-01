import { buildServer } from './server.js';

const server = buildServer({
  getSnapshot() {
    return { state: 'idle', groups: [] };
  }
});

await server.listen({ port: 3000, host: '0.0.0.0' });
