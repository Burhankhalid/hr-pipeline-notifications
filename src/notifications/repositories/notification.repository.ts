import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { INotification, NotificationStatus } from '../interfaces/notification.interface';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}
  
  async create(notification: INotification): Promise<INotification> {
    const newNotification = this.notificationRepository.create(notification);
    await this.notificationRepository.save(newNotification);
    return newNotification;
  }
  
  async update(id: string, updateData: Partial<INotification>): Promise<INotification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    const updated = this.notificationRepository.merge(notification, updateData);
    await this.notificationRepository.save(updated);
    return updated;
  }
  
  async findById(id: string): Promise<INotification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return notification;
  }
  
  async findAll(query: any): Promise<[INotification[], number]> {
    const { page = 1, limit = 10, status, type, recipientId } = query;
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
    
    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }
    
    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }
    
    if (recipientId) {
      queryBuilder.andWhere('notification.recipientId = :recipientId', { recipientId });
    }
    
    queryBuilder.orderBy('notification.createdAt', 'DESC');
    queryBuilder.skip(skip);
    queryBuilder.take(limit);
    
    return queryBuilder.getManyAndCount();
  }
  
  async findPendingForRetry(): Promise<INotification[]> {
    return this.notificationRepository.find({
      where: {
        status: NotificationStatus.FAILED,
        retryCount: LessThan(5), // max retry count defined in config
      },
    });
  }
}