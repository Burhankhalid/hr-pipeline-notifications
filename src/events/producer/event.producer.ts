import { Injectable } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { BaseEventDto } from '../dto/base-event.dto'; 

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbitMQModule: RabbitMQModule) {}

  async publishHiringEvent(event: BaseEventDto) {
    const exchange = 'hiring_pipeline'; // Name of the exchange
    const routingKey = 'hiring_event';  // Routing key for the message

    // The actual publishing of the event to RabbitMQ
    await this.rabbitMQModule.publish(exchange, routingKey, event);
  }
}
