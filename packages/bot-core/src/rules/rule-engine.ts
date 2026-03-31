import type { IncomingMessage } from '../domain/message.js';
import type { MatchResult } from '../domain/match-result.js';
import { normalizeText } from './text-normalizer.js';

type RuleConfig = {
  keywordRules: string[];
  patternRules: string[];
};

export function evaluateMessage(message: IncomingMessage, rules: RuleConfig): MatchResult {
  const normalized = normalizeText(message.text);
  const matchedKeywords = rules.keywordRules
    .map((rule) => normalizeText(rule))
    .filter((rule) => rule.length > 0 && normalized.includes(rule));
  const matchedPatterns = rules.patternRules.filter((rule) => {
    const trimmedRule = rule.trim();

    if (trimmedRule.length === 0) {
      return false;
    }

    try {
      return new RegExp(trimmedRule, 'i').test(normalized);
    } catch {
      return false;
    }
  });

  if (matchedKeywords.length === 0) {
    return { matched: false, matchedKeywords, matchedPatterns, reason: 'no_keyword_match' };
  }

  if (matchedPatterns.length === 0) {
    return { matched: false, matchedKeywords, matchedPatterns, reason: 'no_pattern_match' };
  }

  return { matched: true, matchedKeywords, matchedPatterns, reason: 'matched' };
}
