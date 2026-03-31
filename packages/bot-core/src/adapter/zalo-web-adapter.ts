import type { GroupConfig } from '@zaloridebot/shared';
import type { IncomingMessage } from '../domain/message.js';

export interface ZaloWebAdapter {
  discoverGroups(): Promise<GroupConfig[]>;
  sendMessage(groupId: string, text: string): Promise<void>;
  onIncomingMessage?(listener: (message: IncomingMessage) => Promise<void>): Promise<void>;
}
