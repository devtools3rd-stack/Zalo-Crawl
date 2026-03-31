import type { GroupConfig } from '@zaloridebot/shared';
import type { IncomingMessage } from '../domain/message.js';
import type { ZaloWebAdapter } from './zalo-web-adapter.js';
import type { Page } from 'playwright';

const SELECTORS = {
  conversationRows: '[data-testid="conversation-item"]',
  conversationTitle: '[data-testid="conversation-title"]',
  activeConversation:
    '[data-testid="conversation-item"][aria-selected="true"], [data-testid="conversation-item"][aria-current="page"]',
  messageList: '[data-testid="message-list"]',
  messageRows: '[data-testid="message-item"]',
  messageText: '[data-testid="message-text"]',
  composer: '[contenteditable="true"]',
  sendButton: 'button[type="button"]'
} as const;

const INCOMING_BRIDGE_NAME = 'onBotIncomingMessage';
const INCOMING_OBSERVER_KEY = '__zaloBotIncomingObserver';

type ConversationSnapshot = {
  title: string;
  candidateKeys: string[];
};

type ConversationTarget = {
  key: string;
  title: string;
};

function normalizeConversationKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildConversationKey(snapshot: ConversationSnapshot, index: number, usedKeys: Set<string>): string {
  const baseKey =
    snapshot.candidateKeys.map((value) => normalizeConversationKey(value)).find(Boolean) ||
    normalizeConversationKey(snapshot.title) ||
    `conversation-${index + 1}`;

  let key = baseKey;
  let suffix = 2;
  while (usedKeys.has(key)) {
    key = `${baseKey}-${suffix}`;
    suffix += 1;
  }

  usedKeys.add(key);
  return key;
}

export class PlaywrightZaloWebAdapter implements ZaloWebAdapter {
  private readonly discoveredConversationTargets = new Map<string, ConversationTarget>();
  private incomingMessageListener?: (message: IncomingMessage) => Promise<void>;
  private incomingBridgeRegistered = false;

  constructor(private readonly page: Page) {}

  async discoverGroups(): Promise<GroupConfig[]> {
    const rows = await this.page.$$(SELECTORS.conversationRows);
    const usedKeys = new Set<string>();
    this.discoveredConversationTargets.clear();

    const groups = await Promise.all(
      rows.map(async (row, index) => {
        const snapshot = await row.evaluate(
          (node, selectors) => {
            const element = node as Element;
            const title =
              element.querySelector(selectors.conversationTitle)?.textContent?.trim() ||
              element.getAttribute('aria-label')?.trim() ||
              element.textContent?.trim() ||
              '';

            const href =
              element instanceof HTMLAnchorElement
                ? element.href
                : element.querySelector('a') instanceof HTMLAnchorElement
                  ? (element.querySelector('a') as HTMLAnchorElement).href
                  : '';

            const candidateKeys = [
              element.getAttribute('data-id'),
              element.getAttribute('data-conversation-id'),
              element.getAttribute('data-testid'),
              element.getAttribute('id'),
              element.getAttribute('aria-label'),
              href,
              title
            ].filter((value): value is string => Boolean(value?.trim()));

            return {
              title,
              candidateKeys
            };
          },
          SELECTORS
        );

        const key = buildConversationKey(snapshot, index, usedKeys);
        const group = {
          id: key,
          zaloGroupKey: key,
          name: snapshot.title.trim(),
          isPinned: false,
          defaultReply: '',
          keywordRules: [],
          patternRules: []
        };

        this.discoveredConversationTargets.set(group.id, {
          key,
          title: group.name
        });

        return group;
      })
    );

    return groups;
  }

  async sendMessage(groupId: string, text: string): Promise<void> {
    await this.focusConversation(groupId);
    await this.page.locator(SELECTORS.composer).fill(text);
    await this.page.locator(SELECTORS.sendButton).click();
  }

  async onIncomingMessage(listener: (message: IncomingMessage) => Promise<void>): Promise<void> {
    this.incomingMessageListener = listener;

    if (!this.incomingBridgeRegistered) {
      await this.page.exposeFunction(INCOMING_BRIDGE_NAME, async (message: IncomingMessage) => {
        await this.incomingMessageListener?.(message);
      });
      this.incomingBridgeRegistered = true;
    }

    await this.page.evaluate(
      ({ selectors, bridgeName, observerKey }) => {
        const globalWindow = window as Window & Record<string, unknown>;
        const previousObserver = globalWindow[observerKey];
        if (previousObserver instanceof MutationObserver) {
          previousObserver.disconnect();
        }

        const normalizeKey = (value: string) =>
          value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const getConversationTitle = (element: Element | null) =>
          element?.querySelector(selectors.conversationTitle)?.textContent?.trim() ||
          element?.getAttribute('aria-label')?.trim() ||
          element?.textContent?.trim() ||
          '';

        const resolveConversationKey = () => {
          const activeConversation =
            document.querySelector(selectors.activeConversation) ||
            document.querySelector(selectors.conversationRows);
          const title = getConversationTitle(activeConversation);
          const candidateKey =
            activeConversation?.getAttribute('data-id') ||
            activeConversation?.getAttribute('data-conversation-id') ||
            activeConversation?.getAttribute('data-testid') ||
            activeConversation?.getAttribute('id') ||
            title;

          return {
            groupId: normalizeKey(candidateKey || 'active-conversation') || 'active-conversation',
            title
          };
        };

        const getMessageText = (row: Element) =>
          row.querySelector(selectors.messageText)?.textContent?.trim() || row.textContent?.trim() || '';

        const getMessageRows = (node: Node) => {
          if (!(node instanceof Element)) {
            return [];
          }

          const rows = new Set<Element>();
          if (node.matches(selectors.messageRows)) {
            rows.add(node);
          }

          node.querySelectorAll(selectors.messageRows).forEach((row) => rows.add(row));
          return Array.from(rows);
        };

        const seenMessageIds = new Set<string>();
        const seedSeenMessages = (root: ParentNode) => {
          root.querySelectorAll(selectors.messageRows).forEach((row) => {
            const text = getMessageText(row);
            const messageId =
              row.getAttribute('data-message-id')?.trim() || row.getAttribute('id')?.trim() || text;
            if (messageId) {
              seenMessageIds.add(messageId);
            }
          });
        };

        const bridge = globalWindow[bridgeName];
        const emitIncomingMessage = (row: Element) => {
          if (typeof bridge !== 'function') {
            return;
          }

          const text = getMessageText(row);
          if (!text) {
            return;
          }

          const conversation = resolveConversationKey();
          const runtimeMessageId =
            row.getAttribute('data-message-id')?.trim() ||
            row.getAttribute('id')?.trim() ||
            `${conversation.groupId}:${text}`;

          if (seenMessageIds.has(runtimeMessageId)) {
            return;
          }

          seenMessageIds.add(runtimeMessageId);
          void (bridge as (message: IncomingMessage) => Promise<void>)({
            runtimeMessageId,
            groupId: conversation.groupId,
            senderDisplayName: '',
            text,
            receivedAt: new Date().toISOString(),
            isSelf: false
          });
        };

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
              getMessageRows(node).forEach((row) => emitIncomingMessage(row));
            });
          }
        });

        const messageRoot = document.querySelector(selectors.messageList) || document.body;
        seedSeenMessages(messageRoot);
        observer.observe(messageRoot, {
          childList: true,
          subtree: true
        });

        globalWindow[observerKey] = observer;
      },
      {
        selectors: SELECTORS,
        bridgeName: INCOMING_BRIDGE_NAME,
        observerKey: INCOMING_OBSERVER_KEY
      }
    );
  }

  private async focusConversation(groupId: string): Promise<void> {
    const target = this.discoveredConversationTargets.get(groupId) ?? {
      key: normalizeConversationKey(groupId),
      title: ''
    };

    const conversationFound = await this.page.evaluate(
      ({ selectors, target }) => {
        const normalizeKey = (value: string) =>
          value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const rows = Array.from(document.querySelectorAll(selectors.conversationRows));
        const matchingRow = rows.find((row) => {
          const title =
            row.querySelector(selectors.conversationTitle)?.textContent?.trim() ||
            row.getAttribute('aria-label')?.trim() ||
            row.textContent?.trim() ||
            '';

          const href =
            row instanceof HTMLAnchorElement
              ? row.href
              : row.querySelector('a') instanceof HTMLAnchorElement
                ? (row.querySelector('a') as HTMLAnchorElement).href
                : '';

          const candidateKeys = [
            row.getAttribute('data-id'),
            row.getAttribute('data-conversation-id'),
            row.getAttribute('data-testid'),
            row.getAttribute('id'),
            row.getAttribute('aria-label'),
            href,
            title
          ]
            .filter((value): value is string => Boolean(value?.trim()))
            .map((value) => normalizeKey(value));

          return (
            candidateKeys.includes(target.key) ||
            (target.title.length > 0 && normalizeKey(title) === normalizeKey(target.title))
          );
        });

        if (!(matchingRow instanceof HTMLElement)) {
          return false;
        }

        matchingRow.scrollIntoView({ block: 'center' });
        matchingRow.click();
        return true;
      },
      {
        selectors: SELECTORS,
        target
      }
    );

    if (!conversationFound) {
      throw new Error(`Conversation ${groupId} was not found in the current Zalo Web session`);
    }
  }
}
