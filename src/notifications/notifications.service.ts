import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
  import {
    INotification,
    NotificationStatus,
  } from './interfaces/notification.interface';
  import { NotificationRepository } from './repositories/notification.repository';
  import { DeliveryAttemptRepository } from './repositories/delivery-attempt.repository';
  import { RetryService } from '../retry/retry.service';
  import { ModuleRef } from '@nestjs/core';
  import { INotificationChannel } from '../channels/interfaces/channel.interface';
  import { CreateNotificationDto } from './dto/create-notification.dto';
  import { NotificationResponseDto } from './dto/notification-response.dto';
  
  @Injectable()
  export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private channels: INotificationChannel[] = [];
  
    constructor(
      private readonly notificationRepository: NotificationRepository,
      private readonly deliveryAttemptRepository: DeliveryAttemptRepository,
      private readonly retryService: RetryService,
      private readonly moduleRef: ModuleRef,
    ) {}
  
    async onModuleInit() {
      this.channels = await Promise.all([
        this.moduleRef.get('EmailChannelService', { strict: false }),
        this.moduleRef.get('InAppChannelService', { strict: false }),
      ]);
    }
  
    async send(notification: INotification): Promise<void> {
      if (!notification) {
        throw new BadRequestException('Notification payload is required');
      }
  
      const savedNotification = await this.notificationRepository.create(
        notification,
      );
      await this.dispatchToChannels(savedNotification);
    }
  
    async dispatchToChannels(notification: INotification): Promise<void> {
      if (!notification || !notification.id) {
        throw new BadRequestException(
          'Notification or Notification ID is missing',
        );
      }
  
      const eligibleChannels = this.channels.filter(channel =>
        channel.canHandle(notification),
      );
  
      if (eligibleChannels.length === 0) {
        this.logger.warn(
          `No eligible channels found for notification ${notification.id}`,
        );
        await this.updateNotificationStatus(
          notification.id,
          NotificationStatus.FAILED,
          'No eligible channels found',
        );
        return;
      }
  
      let anySuccess = false;
  
      for (const channel of eligibleChannels) {
        try {
          const result = await channel.send(notification);
  
          await this.deliveryAttemptRepository.create({
            notificationId: notification.id,
            attemptNumber: notification.retryCount? notification.retryCount + 1: 1,
            status: result.success ? 'delivered' : 'failed',
            timestamp: result.timestamp,
            channel: channel.name,
            errorDetails: result.success ? '' : result.error?.message,
          });
  
          if (result.success) {
            anySuccess = true;
          } else {
            this.logger.warn(
              `Failed to send notification ${notification.id} via ${channel.name}: ${result.error?.message}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error sending notification ${notification.id} via ${channel.name}: ${error.message}`,
            error.stack,
          );
  
          await this.deliveryAttemptRepository.create({
            notificationId: notification.id,
            attemptNumber:  notification.retryCount? notification.retryCount + 1: 1,
            status: 'failed',
            timestamp: new Date(),
            channel: channel.name,
            errorDetails: error.message,
          });
        }
      }
  
      if (anySuccess) {
        await this.updateNotificationStatus(
          notification.id,
          NotificationStatus.DELIVERED,
        );
      } else {
        const shouldRetry = await this.retryService.shouldRetry(notification);
  
        if (shouldRetry) {
          await this.scheduleRetry(notification);
        } else {
          await this.updateNotificationStatus(
            notification.id,
            NotificationStatus.FAILED,
            'Max retry attempts reached',
          );
        }
      }
    }
  
    private async updateNotificationStatus(
      id: string,
      status: NotificationStatus,
      errorDetails?: string,
    ): Promise<void> {
      if (!id) {
        throw new BadRequestException(
          'Cannot update status. Notification ID is missing.',
        );
      }
  
      await this.notificationRepository.update(id, {
        status,
        updatedAt: new Date(),
        errorDetails,
      });
    }
  
    private async scheduleRetry(notification: INotification): Promise<void> {
      if (!notification || !notification.id) {
        throw new BadRequestException(
          'Invalid notification: notification or notification.id is missing',
        );
      }
  
      const updatedNotification = await this.notificationRepository.update(
        notification.id,
        {
          retryCount: notification.retryCount ? notification.retryCount + 1 : 1,
          lastRetryAt: new Date(),
          status: NotificationStatus.PENDING,
        },
      );
  
      await this.retryService.scheduleRetry(updatedNotification);
    }
  
    async findAll(query: any): Promise<[INotification[], number]> {
      return this.notificationRepository.findAll(query);
    }
  
    async findById(id: string): Promise<INotification> {
      if (!id) {
        throw new BadRequestException('Notification ID is required');
      }
  
      const notification = await this.notificationRepository.findById(id);
  
      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }
  
      return notification;
    }

    // Create a new notification
  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    try {
      // Create a new notification using TypeORM's save method
      const newNotification = await this.notificationRepository.create(createNotificationDto);

      // Save the notification to the database
      const savedNotification = await this.notificationRepository.create(newNotification);

      // Return the saved notification as a response DTO
      return new NotificationResponseDto(savedNotification);
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }
  }
  