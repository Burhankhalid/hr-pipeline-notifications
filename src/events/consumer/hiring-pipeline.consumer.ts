import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { EventHandlerFactory } from '../factories/event-handler.factory';
import { BaseEventDto } from '../dto/base-event.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HiringPipelineConsumer {
  private readonly logger = new Logger(HiringPipelineConsumer.name);

  constructor(
    private readonly eventHandlerFactory: EventHandlerFactory,
    private readonly configService: ConfigService,
  ) {}

  @RabbitSubscribe({
    exchange: 'hiring_pipeline',
    routingKey: '*',
    queue: 'hiring_events',
  })
  async handleHiringEvent(event: BaseEventDto) {
    this.logger.debug(`Received hiring event: ${event.eventType}`);
    
    try {
      const handler = this.eventHandlerFactory.getHandler(event.eventType);
      await handler.handle(event);
    } catch (error) {
      this.logger.error(`Error processing event ${event.eventType}: ${error.message}`, error.stack);
      // Could implement a dead letter queue here
    }
  }
}
