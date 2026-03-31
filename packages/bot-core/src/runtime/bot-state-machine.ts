import type { BotState } from '@zaloridebot/shared';

type EventName =
  | 'launch'
  | 'session_authenticated'
  | 'session_requires_qr'
  | 'begin_group_discovery'
  | 'start_monitoring'
  | 'restart'
  | 'fail';

const transitions: Record<BotState, Partial<Record<EventName, BotState>>> = {
  idle: { launch: 'launching' },
  launching: {
    session_authenticated: 'authenticated',
    session_requires_qr: 'needs_qr',
    fail: 'error'
  },
  needs_qr: {
    session_authenticated: 'authenticated',
    fail: 'error'
  },
  authenticated: {
    begin_group_discovery: 'discovering_groups',
    fail: 'error'
  },
  discovering_groups: {
    start_monitoring: 'monitoring',
    fail: 'error'
  },
  monitoring: {
    restart: 'restarting',
    fail: 'error'
  },
  error: {
    restart: 'restarting'
  },
  restarting: {
    session_authenticated: 'authenticated',
    session_requires_qr: 'needs_qr',
    fail: 'error'
  }
};

export function createBotStateMachine() {
  let state: BotState = 'idle';

  return {
    current() {
      return state;
    },
    transition(event: EventName) {
      const next = transitions[state][event];

      if (!next) {
        throw new Error(`Invalid transition from ${state} via ${event}`);
      }

      state = next;
    }
  };
}
