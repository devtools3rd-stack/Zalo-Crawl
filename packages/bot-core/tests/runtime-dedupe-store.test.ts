import { describe, expect, it } from 'vitest';
import { RuntimeDedupeStore } from '../src/runtime/runtime-dedupe-store.js';

describe('runtime dedupe store', () => {
  it('marks the second sighting of a message as duplicate', () => {
    const store = new RuntimeDedupeStore();

    expect(store.seen('group-1|msg-1')).toBe(false);
    expect(store.seen('group-1|msg-1')).toBe(true);
  });
});
