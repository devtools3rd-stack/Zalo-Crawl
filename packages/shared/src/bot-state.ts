export const BOT_STATES = [
  'idle',
  'launching',
  'needs_qr',
  'authenticated',
  'discovering_groups',
  'monitoring',
  'error',
  'restarting'
] as const;

export type BotState = (typeof BOT_STATES)[number];
