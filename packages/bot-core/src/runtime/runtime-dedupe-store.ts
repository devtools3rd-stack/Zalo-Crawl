export class RuntimeDedupeStore {
  private readonly seenIds = new Set<string>();

  seen(messageId: string): boolean {
    if (this.seenIds.has(messageId)) {
      return true;
    }

    this.seenIds.add(messageId);
    return false;
  }
}
