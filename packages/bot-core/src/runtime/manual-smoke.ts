import { PlaywrightSessionManager } from '../adapter/playwright-session-manager.js';
import { createRuntimeConfig } from '../config/runtime-config.js';

export async function runManualSmoke(workspaceRoot: string) {
  const config = createRuntimeConfig(workspaceRoot);
  const session = new PlaywrightSessionManager(config.authDir);
  const page = await session.launch();
  return { url: page.url() };
}
