import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { NotificationsModule } from './notifications/notifications.module';
import { ChannelsModule } from './channels/channels.module';
import { TemplatesModule } from './templates/templates.module';
import { RetryModule } from './retry/retry.module';
import { CommonModule } from './common/common.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

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
    uri: process.env.RABBITMQ_URL? process.env.RABBITMQ_URL : "amqp://username:password@localhost:5672", // RabbitMQ URI
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
