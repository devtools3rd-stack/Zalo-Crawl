import { describe, expect, it, vi } from 'vitest';
import { PlaywrightZaloWebAdapter } from '../src/adapter/playwright-zalo-web-adapter.js';

describe('PlaywrightZaloWebAdapter', () => {
  it('discovers groups with runtime-stable ids derived from row metadata', async () => {
    const rowOne = {
      evaluate: vi.fn(async () => ({
        title: 'Team Dispatch',
        candidateKeys: ['conversation-team-dispatch-42', 'Team Dispatch']
      }))
    };
    const rowTwo = {
      evaluate: vi.fn(async () => ({
        title: 'Operations Room',
        candidateKeys: ['Operations Room']
      }))
    };
    const page = {
      $$: vi.fn(async () => [rowOne, rowTwo])
    };

    const adapter = new PlaywrightZaloWebAdapter(page as never);

    await expect(adapter.discoverGroups()).resolves.toEqual([
      {
        id: 'conversation-team-dispatch-42',
        zaloGroupKey: 'conversation-team-dispatch-42',
        name: 'Team Dispatch',
        isPinned: false,
        defaultReply: '',
        keywordRules: [],
        patternRules: []
      },
      {
        id: 'operations-room',
        zaloGroupKey: 'operations-room',
        name: 'Operations Room',
        isPinned: false,
        defaultReply: '',
        keywordRules: [],
        patternRules: []
      }
    ]);

    expect(page.$$).toHaveBeenCalledTimes(1);
    expect(rowOne.evaluate).toHaveBeenCalledTimes(1);
    expect(rowTwo.evaluate).toHaveBeenCalledTimes(1);
  });

  it('targets a matching conversation before filling the composer and sending', async () => {
    const rowOne = {
      evaluate: vi.fn(async () => ({
        title: 'Operations',
        candidateKeys: ['operations-group']
      }))
    };
    const evaluate = vi.fn(async () => true);
    const fill = vi.fn(async () => {});
    const click = vi.fn(async () => {});
    const composerLocator = {
      fill
    };
    const sendButtonLocator = {
      click
    };
    const page = {
      $$: vi.fn(async () => [rowOne]),
      evaluate,
      locator: vi
        .fn()
        .mockReturnValueOnce(composerLocator)
        .mockReturnValueOnce(sendButtonLocator)
    };

    const adapter = new PlaywrightZaloWebAdapter(page as never);
    await adapter.discoverGroups();

    await expect(adapter.sendMessage('operations-group', 'hello zalo')).resolves.toBeUndefined();

    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(typeof evaluate.mock.calls[0]?.[0]).toBe('function');
    expect(evaluate.mock.calls[0]?.[1]).toMatchObject({
      target: {
        key: 'operations-group',
        title: 'Operations'
      }
    });
    expect(page.locator).toHaveBeenCalledTimes(2);
    expect(evaluate.mock.invocationCallOrder[0]).toBeLessThan(fill.mock.invocationCallOrder[0]);
    expect(fill).toHaveBeenCalledWith('hello zalo');
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('registers the incoming message bridge and installs a DOM observer', async () => {
    const exposeFunction = vi.fn(async () => {});
    const evaluate = vi.fn(async () => {});
    const page = {
      exposeFunction,
      evaluate
    };
    const listener = vi.fn(async () => {});

    const adapter = new PlaywrightZaloWebAdapter(page as never);

    await expect(adapter.onIncomingMessage(listener)).resolves.toBeUndefined();
    expect(exposeFunction).toHaveBeenCalledTimes(1);
    expect(exposeFunction).toHaveBeenCalledWith('onBotIncomingMessage', expect.any(Function));

    const bridge = exposeFunction.mock.calls[0]?.[1];
    await bridge({
      runtimeMessageId: 'msg-1',
      groupId: 'operations-group',
      senderDisplayName: 'Driver A',
      text: 'new booking',
      receivedAt: '2026-04-01T00:00:00.000Z',
      isSelf: false
    });
    expect(listener).toHaveBeenCalledWith({
      runtimeMessageId: 'msg-1',
      groupId: 'operations-group',
      senderDisplayName: 'Driver A',
      text: 'new booking',
      receivedAt: '2026-04-01T00:00:00.000Z',
      isSelf: false
    });

    expect(evaluate).toHaveBeenCalledTimes(1);
    const [installObserver, args] = evaluate.mock.calls[0] ?? [];
    expect(typeof installObserver).toBe('function');
    expect(String(installObserver)).toContain('MutationObserver');
    expect(args).toMatchObject({
      bridgeName: 'onBotIncomingMessage'
    });
  });
});
