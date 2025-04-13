import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { NotificationsModule } from './notifications/notifications.module';
import { ChannelsModule } from './channels/channels.module';
import { TemplatesModule } from './templates/templates.module';
import { RetryModule } from './retry/retry.module';
import { CommonModule } from './common/common.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Notification } from './notifications/entities/notification.entity';
import { Template } from './templates/entities/template.entity';
import { NotificationDeliveries } from './notifications/entities/notification-deliveries.entity';
import { NotificationRule } from './notifications/entities/notification-rule.entity';

@Module({
  imports: [
    LoggerModule.forRoot({
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    },
  }),
  RabbitMQModule.forRoot({
    uri: process.env.RABBITMQ_URL? process.env.RABBITMQ_URL : "amqp://guest:guest@localhost:5672", // RabbitMQ URI
    exchanges: [
      {
        name: 'hiring_pipeline', // Exchange name
        type: 'topic', // Use 'topic' or 'direct' depending on your needs
      },
    ],
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env', 
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',  // Specify your DB type, like 'postgres', 'mysql', etc.
    host: 'localhost', // DB host
    port: 5432,        // DB port
    username: 'postgres',  // DB username
    password: 'admin',  // DB password
    database: 'notifications_service',  // DB name
    entities: [Notification, Template, Event, NotificationDeliveries, NotificationRule], // Add your entities here
    synchronize: true, // Sync DB (use false in production)
  }),
  EventsModule, 
  NotificationsModule, 
  ChannelsModule, 
  TemplatesModule, 
  RetryModule, 
  CommonModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
