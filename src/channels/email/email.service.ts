import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INotificationChannel, DeliveryResult } from '../interfaces/channel.interface';
import { INotification } from '../../notifications/interfaces/notification.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailChannelService implements INotificationChannel {
  name = 'email';
  private readonly logger = new Logger(EmailChannelService.name);
  private transporter: any;
  
  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }
  
  private initializeTransporter() {
    // In production, use SMTP configs from config service
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: this.configService.get('email.secure'),
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });
  }
  
  canHandle(notification: INotification): boolean {
    return notification.channel? notification.channel.includes('email') : false;
  }
  
  async send(notification: INotification): Promise<DeliveryResult> {
    try {

      if (!notification.recipientId) {
        this.logger.warn(`No recipientId: ${notification.recipientId}. Skipping notification.`);
        return {
          success: false,
          timestamp: new Date(),
          details: { reason: 'Missing recipientId' },
        };
      }

      // In a real implementation, get recipient email from user service
      const recipientEmail = await this.getRecipientEmail(notification.recipientId);
      

      if (!recipientEmail) {
        this.logger.warn(`No recipientEmail found for recipientId: ${notification.recipientId}. Skipping notification.`);
        return {
          success: false,
          timestamp: new Date(),
          details: { reason: 'Missing recipientEmail' },
        };
      }

      // Send email using the transporter
      const info = await this.transporter.sendMail({
        from: this.configService.get('email.fromAddress'),
        to: recipientEmail,
        subject: this.getSubjectFromNotification(notification),
        html: notification.content,
      });
      
      this.logger.debug(`Email sent: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date(),
        details: { accepted: info.accepted },
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
      return {
        success: false,
        error,
        timestamp: new Date(),
        details: { error: error.message },
      };
    }
  }
  
  private getSubjectFromNotification(notification: INotification): string {
    // Extract subject from notification metadata or use default
    return notification.metadata?.subject || 
           `Notification: ${notification.type}`;
  }
  
  private async getRecipientEmail(recipientId: string): Promise<string> {
    // In a real implementation, we'll call a user service to get email
    // For this example, we'll mock it  
    return `user-${recipientId}@example.com`;
  }
}