export type IncomingMessage = {
  runtimeMessageId: string;
  groupId: string;
  senderDisplayName: string;
  text: string;
  receivedAt: string;
  isSelf: boolean;
};
