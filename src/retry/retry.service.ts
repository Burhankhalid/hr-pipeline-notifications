import { Injectable, Logger } from '@nestjs/common';
import { INotification } from '../notifications/interfaces/notification.interface';
import { RetryStrategy } from './strategies/retry.strategy';
import { ExponentialBackoffStrategy } from './strategies/exponential-backoff.strategy';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly retryStrategy: RetryStrategy;
  private readonly maxRetries: number;
  
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {
    this.retryStrategy = new ExponentialBackoffStrategy();
    this.maxRetries = this.configService.get('notifications.maxRetries', 5);
  }
  
  async shouldRetry(notification: INotification): Promise<boolean> {
    return (notification.retryCount? notification.retryCount : 0) < this.maxRetries;
  }
  
  async scheduleRetry(notification: INotification): Promise<void> {
    try {
      const delayMs = this.retryStrategy.getDelayMs(notification.retryCount? notification.retryCount : 0);
      
      this.logger.debug(
        `Scheduling retry #${notification.retryCount} for notification ${notification.id} in ${delayMs}ms`
      );
      
      // Publish to delayed exchange with appropriate headers
      await this.amqpConnection.publish(
        'notification.retry',
        'retry',
        { notificationId: notification.id },
        { headers: { 'x-delay': delayMs } }
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule retry for notification ${notification.id}: ${error.message}`,
        error.stack
      );
    }
  }
}