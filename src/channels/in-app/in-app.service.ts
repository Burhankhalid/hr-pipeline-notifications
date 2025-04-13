import { Injectable, Logger } from '@nestjs/common';
import { INotificationChannel, DeliveryResult } from '../interfaces/channel.interface';
import { INotification } from '../../notifications/interfaces/notification.interface';

@Injectable()
export class InAppChannelService implements INotificationChannel {
  name = 'in-app';
  private readonly logger = new Logger(InAppChannelService.name);
  
  canHandle(notification: INotification): boolean {
    return notification.channel? notification.channel.includes('in-app') : false;
  }
  
  async send(notification: INotification): Promise<DeliveryResult> {
    try {
      // In a real implementation, this would call an API to store
      // in-app notifications or use a websocket to push notifications
      
      this.logger.debug(`In-app notification sent to user ${notification.recipientId}`);
      
      // Simulate sending in-app notification
      const messageId = `in-app-${Date.now()}-${notification.id}`;
      
      return {
        success: true,
        messageId,
        timestamp: new Date(),
        details: { delivered: true },
      };
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error.message}`, error.stack);
      
      return {
        success: false,
        error,
        timestamp: new Date(),
        details: { error: error.message },
      };
    }
  }
}