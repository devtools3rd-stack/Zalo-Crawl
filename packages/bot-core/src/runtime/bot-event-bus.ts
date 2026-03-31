import { EventEmitter } from 'node:events';
import type { BotEvent } from '@zaloridebot/shared';

export class BotEventBus {
  private readonly emitter = new EventEmitter();
  private readonly wildcardListeners = new Set<(event: BotEvent) => void>();

  emit(event: BotEvent) {
    this.emitter.emit(event.type, event);

    for (const listener of this.wildcardListeners) {
      try {
        listener(event);
      } catch {
        // Wildcard listeners are observational and must not break message processing.
      }
    }
  }

  onAny(listener: (event: BotEvent) => void) {
    this.wildcardListeners.add(listener);

    return () => {
      this.wildcardListeners.delete(listener);
    };
  }
}
