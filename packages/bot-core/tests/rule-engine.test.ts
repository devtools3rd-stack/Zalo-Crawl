import { describe, expect, it } from 'vitest';
import { evaluateMessage } from '../src/rules/rule-engine.js';

describe('rule engine', () => {
  it('matches only when a keyword and whitelist pattern both match', () => {
    const result = evaluateMessage(
      {
        runtimeMessageId: 'msg-1',
        groupId: 'group-1',
        senderDisplayName: 'A',
        text: 'co cuoc xe di san bay 17h sdt 0909123456',
        receivedAt: '2026-03-31T08:00:00.000Z',
        isSelf: false
      },
      {
        keywordRules: ['cuoc xe', 'di san bay'],
        patternRules: ['\\d{9,11}', '\\b\\d{1,2}h\\b']
      }
    );

    expect(result.matched).toBe(true);
    expect(result.matchedKeywords).toContain('cuoc xe');
  });

  it('returns no_keyword_match when no keyword rules match', () => {
    const result = evaluateMessage(
      {
        runtimeMessageId: 'msg-2',
        groupId: 'group-1',
        senderDisplayName: 'A',
        text: 'hello 17h',
        receivedAt: '2026-03-31T08:00:00.000Z',
        isSelf: false
      },
      {
        keywordRules: ['cuoc xe'],
        patternRules: ['\\b\\d{1,2}h\\b']
      }
    );

    expect(result.matched).toBe(false);
    expect(result.reason).toBe('no_keyword_match');
  });

  it('returns no_pattern_match when no pattern rules match', () => {
    const result = evaluateMessage(
      {
        runtimeMessageId: 'msg-3',
        groupId: 'group-1',
        senderDisplayName: 'A',
        text: 'co cuoc xe ngay mai',
        receivedAt: '2026-03-31T08:00:00.000Z',
        isSelf: false
      },
      {
        keywordRules: ['cuoc xe'],
        patternRules: ['\\b\\d{1,2}h\\b']
      }
    );

    expect(result.matched).toBe(false);
    expect(result.reason).toBe('no_pattern_match');
  });

  it('ignores blank rules and does not treat them as matches', () => {
    const result = evaluateMessage(
      {
        runtimeMessageId: 'msg-4',
        groupId: 'group-1',
        senderDisplayName: 'A',
        text: 'any text',
        receivedAt: '2026-03-31T08:00:00.000Z',
        isSelf: false
      },
      {
        keywordRules: ['   '],
        patternRules: [' ', '']
      }
    );

    expect(result.matched).toBe(false);
    expect(result.reason).toBe('no_keyword_match');
    expect(result.matchedKeywords).toEqual([]);
    expect(result.matchedPatterns).toEqual([]);
  });

  it('treats invalid regex patterns as non-matching without throwing', () => {
    const message = {
      runtimeMessageId: 'msg-5',
      groupId: 'group-1',
      senderDisplayName: 'A',
      text: 'co cuoc xe',
      receivedAt: '2026-03-31T08:00:00.000Z',
      isSelf: false
    };

    expect(() =>
      evaluateMessage(message, {
        keywordRules: ['cuoc xe'],
        patternRules: ['[']
      })
    ).not.toThrow();

    const result = evaluateMessage(message, {
      keywordRules: ['cuoc xe'],
      patternRules: ['[']
    });

    expect(result.matched).toBe(false);
    expect(result.reason).toBe('no_pattern_match');
    expect(result.matchedPatterns).toEqual([]);
  });
});
