/**
 * Smoke test: discover groups, pin one, then monitor for ride messages.
 *
 * Usage:
 *   node dist/src/runtime/smoke-ride-test.js [groupNameFragment] [replyText]
 *
 * Example:
 *   node dist/src/runtime/smoke-ride-test.js "Test" "em nhan cuoc"
 *
 * If no args given, it just lists discovered groups and exits.
 */

import { chromium } from 'playwright';
import { createRuntimeConfig } from '../config/runtime-config.js';
import { PlaywrightZaloWebAdapter } from '../adapter/playwright-zalo-web-adapter.js';
import { createBotService } from './bot-service.js';
import { RuntimeDedupeStore } from './runtime-dedupe-store.js';
import type { GroupConfig } from '@zaloridebot/shared';

const workspaceRoot = process.cwd();
const config = createRuntimeConfig(workspaceRoot);

const [, , groupNameFragment = '', replyText = 'em nhan cuoc'] = process.argv;

console.log('Launching Playwright with persisted session...');
const context = await chromium.launchPersistentContext(config.authDir, { headless: false });
const page = context.pages()[0] ?? await context.newPage();

if (!page.url().includes('chat.zalo.me')) {
  await page.goto('https://chat.zalo.me/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}

const adapter = new PlaywrightZaloWebAdapter(page);

console.log('\nDiscovering groups...');
const discovered = await adapter.discoverGroups();

if (discovered.length === 0) {
  console.log('No conversations found. Make sure Zalo Web is loaded.');
  await context.close();
  process.exit(1);
}

console.log('\nFound conversations:');
discovered.forEach((g, i) => console.log(`  [${i}] id="${g.id}"  name="${g.name}"`));

if (!groupNameFragment) {
  console.log('\nProvide a group name fragment as first arg to start monitoring.');
  await context.close();
  process.exit(0);
}

// Find the target group by name fragment
const target = discovered.find((g) =>
  g.name.toLowerCase().includes(groupNameFragment.toLowerCase())
);

if (!target) {
  console.log(`\nNo group matching "${groupNameFragment}" found.`);
  await context.close();
  process.exit(1);
}

console.log(`\nPinning group: "${target.name}" (id: ${target.id})`);

// Build pinned config with ride detection rules
const pinnedConfig: GroupConfig = {
  ...target,
  isPinned: true,
  defaultReply: replyText,
  keywordRules: ['cuoc xe', 'di san bay', 'don khach', 'cuoc', 'xe om'],
  patternRules: ['\\d{9,11}', '\\b\\d{1,2}h\\b']
};

// Wrap adapter so discoverGroups returns our pinned config
const wrappedAdapter = {
  ...adapter,
  async discoverGroups() {
    return [pinnedConfig];
  }
};

const service = createBotService({
  adapter: wrappedAdapter,
  dedupeStore: new RuntimeDedupeStore()
});

service.eventBus.onAny((event) => {
  const ts = new Date(event.timestamp).toLocaleTimeString('vi-VN');
  console.log(`[${ts}] ${event.type}`, JSON.stringify(event.payload));
});

console.log(`\nMonitoring "${target.name}" for ride messages...`);
console.log('Keywords:', pinnedConfig.keywordRules.join(', '));
console.log('Patterns:', pinnedConfig.patternRules.join(', '));
console.log('Auto-reply:', `"${replyText}"`);
console.log('\nSend a test message in the group now. Press Ctrl+C to stop.\n');

await service.start();

// Keep process alive
process.on('SIGINT', async () => {
  console.log('\nStopping...');
  await context.close();
  process.exit(0);
});
