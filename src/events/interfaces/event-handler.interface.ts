// interfaces/event-handler.interface.ts

import { EventPattern } from './event-pattern.interface';

export interface EventHandler {
  /**
   * Process an event based on its pattern and payload
   * @param eventPattern The pattern that describes the event
   * @param payload The event payload data
   */
  handle(eventPattern: EventPattern, payload: any): Promise<void>;
}