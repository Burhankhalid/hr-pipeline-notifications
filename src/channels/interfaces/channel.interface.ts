import { INotification } from '../../notifications/interfaces/notification.interface';

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: Error;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface INotificationChannel {
  name: string;
  send(notification: INotification): Promise<DeliveryResult>;
  canHandle(notification: INotification): boolean;
}