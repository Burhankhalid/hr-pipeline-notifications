import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationDeliveries } from '../entities/notification-deliveries.entity';

interface CreateDeliveryAttemptParams {
  notificationId: string;
  attemptNumber: number;
  status: string;
  timestamp: Date;
  channel: string;
  errorDetails?: string;
}

@Injectable()
export class DeliveryAttemptRepository {
  constructor(
    @InjectRepository(NotificationDeliveries)
    private deliveryAttemptRepository: Repository<NotificationDeliveries>,
  ) {}
  
  async create(params: CreateDeliveryAttemptParams): Promise<NotificationDeliveries> {
    const deliveryAttempt = this.deliveryAttemptRepository.create(params);
    await this.deliveryAttemptRepository.save(deliveryAttempt);
    return deliveryAttempt;
  }
  
  async findByNotificationId(notificationId: string): Promise<NotificationDeliveries[]> {
    return this.deliveryAttemptRepository.find({
      where: { notificationId },
      order: { timestamp: 'DESC' },
    });
  }
}