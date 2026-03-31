import { z } from 'zod';
import type { BotState } from './bot-state.js';

export const BotEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  payload: z.record(z.unknown()).default({})
});

export type BotEvent = z.infer<typeof BotEventSchema>;

export type StateChangedEvent = {
  type: 'bot.state_changed';
  timestamp: string;
  payload: { from: BotState; to: BotState };
};
