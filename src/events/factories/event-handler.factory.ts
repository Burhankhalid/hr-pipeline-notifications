import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApplicationEventHandler } from '../handlers/application.handler';
import { InterviewEventHandler } from '../handlers/interview.handler';
import { OfferEventHandler } from '../handlers/offer.handler';
import { BaseEventHandler } from '../handlers/base.handler';

@Injectable()
export class EventHandlerFactory {
  private readonly logger = new Logger(EventHandlerFactory.name);
  private readonly handlers: Map<string, any> = new Map();
  
  constructor(private moduleRef: ModuleRef) {
    // Register handlers
    this.handlers.set('candidate.application', ApplicationEventHandler);
    this.handlers.set('interview', InterviewEventHandler);
    this.handlers.set('offer', OfferEventHandler);
  }
  
  getHandler(eventType: string): BaseEventHandler {
    // Find the appropriate handler based on the event type prefix
    const handlerKey = Array.from(this.handlers.keys())
      .find(key => eventType.startsWith(key));
      
    if (!handlerKey) {
      this.logger.warn(`No handler found for event type: ${eventType}`);
      throw new NotFoundException(`No handler for event type: ${eventType}`);
    }
    
    const HandlerClass = this.handlers.get(handlerKey);
    return this.moduleRef.get(HandlerClass, { strict: false });
  }
}