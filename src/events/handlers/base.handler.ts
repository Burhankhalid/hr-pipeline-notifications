import { Logger } from '@nestjs/common';
import { BaseEventDto } from '../dto/base-event.dto';

export abstract class BaseEventHandler {
  protected logger = new Logger(this.constructor.name);
  
  abstract handle(event: BaseEventDto): Promise<void>;
  
  protected logEventProcessing(event: BaseEventDto): void {
    this.logger.log(`Processing ${event.eventType} event with correlation ID: ${event.correlationId}`);
  }
}