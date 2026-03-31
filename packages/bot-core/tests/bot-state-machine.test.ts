import { describe, expect, it } from 'vitest';
import { createBotStateMachine } from '../src/runtime/bot-state-machine.js';

describe('bot state machine', () => {
  it('walks through the happy-path lifecycle', () => {
    const machine = createBotStateMachine();

    machine.transition('launch');
    machine.transition('session_authenticated');
    machine.transition('begin_group_discovery');
    machine.transition('start_monitoring');

    expect(machine.current()).toBe('monitoring');
  });

  it('throws on invalid transitions', () => {
    const machine = createBotStateMachine();

    expect(() => machine.transition('session_authenticated')).toThrow(
      'Invalid transition from idle via session_authenticated'
    );
  });
});
