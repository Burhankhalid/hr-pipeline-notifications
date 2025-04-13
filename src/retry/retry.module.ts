import { Module } from '@nestjs/common';
import { RetryService } from './retry.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'; // or whatever module you're using
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
      // Import the RabbitMQ module
      RabbitMQModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672'), // Default to localhost if not set
          // other configuration options...
        }),
      }),
      // Make sure ConfigModule is imported if needed
      ConfigModule,
    ],
    providers: [RetryService],
    exports: [RetryService],
  })
export class RetryModule {}
