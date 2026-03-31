import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { BotState } from '@zaloridebot/shared';
import { createRuntimeConfig } from '../src/config/runtime-config.js';
import { PlaywrightSessionManager } from '../src/adapter/playwright-session-manager.js';
import { BotEventBus } from '../src/runtime/bot-event-bus.js';
import { RuntimeDedupeStore } from '../src/runtime/runtime-dedupe-store.js';
import type { BotSnapshot } from '../src/runtime/bot-service.js';
import { createBotService } from '../src/runtime/bot-service.js';

const { launchPersistentContextMock, newPageMock, gotoMock } = vi.hoisted(() => {
  const goto = vi.fn();
  const newPage = vi.fn(async () => ({
    goto
  }));
  const launchPersistentContext = vi.fn(async () => ({
    newPage,
    close: vi.fn(async () => {})
  }));

  return {
    launchPersistentContextMock: launchPersistentContext,
    newPageMock: newPage,
    gotoMock: goto
  };
});

vi.mock('playwright', () => ({
  chromium: {
    launchPersistentContext: launchPersistentContextMock
  }
}));

describe('bot service', () => {
  it('emits reply.sent when a new matching message arrives', async () => {
    const sent: string[] = [];
    const service = createBotService({
      adapter: {
        async discoverGroups() {
          return [
            {
              id: 'group-1',
              zaloGroupKey: 'zalo-1',
              name: 'Nhom 1',
              isPinned: true,
              defaultReply: 'em nhan cuoc',
              keywordRules: ['cuoc xe'],
              patternRules: ['\\d{9,11}']
            }
          ];
        },
        async sendMessage(_groupId, text) {
          sent.push(text);
        }
      },
      dedupeStore: new RuntimeDedupeStore()
    });

    await service.handleIncomingMessage({
      runtimeMessageId: 'msg-1',
      groupId: 'group-1',
      senderDisplayName: 'A',
      text: 'co cuoc xe 0909123456',
      receivedAt: '2026-03-31T08:00:00.000Z',
      isSelf: false
    });

    expect(sent).toEqual(['em nhan cuoc']);
  });

  it('registers the adapter incoming-message listener on start when available', async () => {
    let registeredListener:
      | ((message: Parameters<ReturnType<typeof createBotService>['handleIncomingMessage']>[0]) => Promise<void>)
      | undefined;

    const service = createBotService({
      adapter: {
        async discoverGroups() {
          return [];
        },
        async sendMessage() {},
        async onIncomingMessage(listener) {
          registeredListener = listener;
        }
      },
      dedupeStore: new RuntimeDedupeStore()
    });

    await service.start();

    expect(registeredListener).toBeTypeOf('function');
  });

  it('stops delivering events to wildcard listeners after unsubscribe', () => {
    const eventBus = new BotEventBus();
    const received: string[] = [];

    const unsubscribe = eventBus.onAny((event) => {
      received.push(event.type);
    });

    eventBus.emit({
      type: 'message.detected',
      timestamp: '2026-03-31T08:00:00.000Z',
      payload: {}
    });
    unsubscribe();
    eventBus.emit({
      type: 'reply.sent',
      timestamp: '2026-03-31T08:00:01.000Z',
      payload: {}
    });

    expect(received).toEqual(['message.detected']);
  });

  it('continues sending replies when a wildcard listener throws', async () => {
    const sent: string[] = [];
    const eventBus = new BotEventBus();
    eventBus.onAny(() => {
      throw new Error('listener failed');
    });

    const service = createBotService({
      adapter: {
        async discoverGroups() {
          return [
            {
              id: 'group-1',
              zaloGroupKey: 'zalo-1',
              name: 'Nhom 1',
              isPinned: true,
              defaultReply: 'em nhan cuoc',
              keywordRules: ['cuoc xe'],
              patternRules: ['\\d{9,11}']
            }
          ];
        },
        async sendMessage(_groupId, text) {
          sent.push(text);
        }
      },
      dedupeStore: new RuntimeDedupeStore(),
      eventBus
    });

    await expect(
      service.handleIncomingMessage({
        runtimeMessageId: 'msg-2',
        groupId: 'group-1',
        senderDisplayName: 'A',
        text: 'co cuoc xe 0909123456',
        receivedAt: '2026-03-31T08:00:00.000Z',
        isSelf: false
      })
    ).resolves.toBeUndefined();

    expect(sent).toEqual(['em nhan cuoc']);
  });
});

describe('runtime config', () => {
  it('builds Windows paths for the auth and groups files', () => {
    const config = createRuntimeConfig('D:\\workspace\\zaloridebot');

    expect(config.authDir).toBe('D:\\workspace\\zaloridebot\\playwright\\.auth');
    expect(config.groupsFile).toBe('D:\\workspace\\zaloridebot\\data\\groups.json');
  });
});

describe('BotSnapshot', () => {
  it('uses the shared BotState union for state', () => {
    expectTypeOf<BotSnapshot['state']>().toEqualTypeOf<BotState>();
  });
});

describe('PlaywrightSessionManager', () => {
  it('rejects a second launch before close', async () => {
    const manager = new PlaywrightSessionManager('D:\\workspace\\zaloridebot\\playwright\\.auth');

    await manager.launch();

    await expect(manager.launch()).rejects.toThrow('Playwright session is already active. Close it before launching again.');
    expect(launchPersistentContextMock).toHaveBeenCalledTimes(1);
    expect(newPageMock).toHaveBeenCalledTimes(1);
    expect(gotoMock).toHaveBeenCalledTimes(1);
  });
});
