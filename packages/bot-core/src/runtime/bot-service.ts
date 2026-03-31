import type { BotState } from '@zaloridebot/shared';
import type { ZaloWebAdapter } from '../adapter/zalo-web-adapter.js';
import type { IncomingMessage } from '../domain/message.js';
import { evaluateMessage } from '../rules/rule-engine.js';
import { BotEventBus } from './bot-event-bus.js';
import { RuntimeDedupeStore } from './runtime-dedupe-store.js';

export type BotSnapshot = {
  state: BotState;
  groups: Array<{ id: string; name: string }>;
};

type Dependencies = {
  adapter: ZaloWebAdapter;
  dedupeStore: RuntimeDedupeStore;
  eventBus?: BotEventBus;
};

export function createBotService({
  adapter,
  dedupeStore,
  eventBus = new BotEventBus()
}: Dependencies) {
  async function handleIncomingMessage(message: IncomingMessage) {
    if (message.isSelf) {
      return;
    }

    if (dedupeStore.seen(`${message.groupId}|${message.runtimeMessageId}`)) {
      return;
    }

    const groups = await adapter.discoverGroups();
    const group = groups.find((item) => item.id === message.groupId && item.isPinned);

    if (!group) {
      return;
    }

    const result = evaluateMessage(message, {
      keywordRules: group.keywordRules,
      patternRules: group.patternRules
    });

    eventBus.emit({
      type: 'message.detected',
      timestamp: new Date().toISOString(),
      payload: { groupId: message.groupId, messageId: message.runtimeMessageId }
    });

    if (!result.matched) {
      return;
    }

    await adapter.sendMessage(group.id, group.defaultReply);

    eventBus.emit({
      type: 'reply.sent',
      timestamp: new Date().toISOString(),
      payload: { groupId: group.id, replyText: group.defaultReply }
    });
  }

  return {
    eventBus,
    async start() {
      await adapter.onIncomingMessage?.(handleIncomingMessage);
    },
    handleIncomingMessage
  };
}
