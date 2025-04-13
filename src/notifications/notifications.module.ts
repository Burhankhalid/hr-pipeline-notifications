import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notification.controller'; 
import { NotificationsService } from './notifications.service'; 
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repositories/notification.repository'; 
import { DeliveryAttemptRepository } from './repositories/delivery-attempt.repository';
import { NotificationDeliveries } from './entities/notification-deliveries.entity';
import { RetryModule } from '../retry/retry.module'; 
import { NotificationRule } from './entities/notification-rule.entity';
import { ChannelsModule } from '../channels/channels.module'; 


@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, NotificationDeliveries, NotificationRule]), // Only include entities here
        RetryModule, // Import the module with RetryService
        ChannelsModule, // Import the module with channel services
    ],
    controllers: [NotificationsController],  
    providers: [
        NotificationsService,
        NotificationRepository,
        DeliveryAttemptRepository,
    ],  
    exports: [NotificationsService], // If needed elsewhere
})
export class NotificationsModule {}
