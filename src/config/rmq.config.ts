import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
  queues: {
    hiringEvents: process.env.HIRING_EVENTS_QUEUE || 'hiring_events',
    retryNotifications: process.env.RETRY_NOTIFICATIONS_QUEUE || 'notification_retries',
  },
  exchanges: {
    hiringPipeline: process.env.HIRING_PIPELINE_EXCHANGE || 'hiring_pipeline',
  },
  prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH_COUNT ?? '10', 10),
}));