import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationServiceSchema1623456789000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types for notification statuses and types
    await queryRunner.query(`
      CREATE TYPE notification_status_enum AS ENUM (
        'pending', 'sent', 'delivered', 'failed'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'new_application', 'application_status_change', 'interview_scheduled', 
        'interview_reminder', 'assessment_request', 'assessment_completed', 
        'offer_created', 'offer_accepted', 'offer_rejected', 'general'
      );
    `);

    // Create the templates table
    await queryRunner.query(`
      CREATE TABLE templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        variables JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Create the notification_rules table
    await queryRunner.query(`
      CREATE TABLE notification_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(100) NOT NULL,
        conditions JSONB NOT NULL DEFAULT '{}',
        template_id UUID REFERENCES templates(id),
        channels JSONB NOT NULL DEFAULT '[]',
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Create the notifications table
    await queryRunner.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type notification_type_enum NOT NULL,
        recipient_id UUID NOT NULL,
        template_id UUID REFERENCES templates(id),
        content TEXT,
        metadata JSONB,
        status notification_status_enum NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        scheduled_for TIMESTAMP,
        channel TEXT[] NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_retry_at TIMESTAMP,
        error_details TEXT,
        correlation_id UUID NOT NULL,
        template_data JSONB
      );
    `);

    // Create the notification_deliveries table
    await queryRunner.query(`
      CREATE TABLE notification_deliveries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        attempt_number INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT now(),
        channel VARCHAR(50) NOT NULL,
        error_details TEXT
      );
    `);

    // Create the events table
    await queryRunner.query(`
      CREATE TABLE events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(100) NOT NULL,
        payload TEXT NOT NULL,
        source VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        processed_at TIMESTAMP,
        processed BOOLEAN NOT NULL DEFAULT false
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the tables in reverse order to maintain foreign key constraints
    await queryRunner.query(`DROP TABLE notification_deliveries`);
    await queryRunner.query(`DROP TABLE notifications`);
    await queryRunner.query(`DROP TABLE notification_rules`);
    await queryRunner.query(`DROP TABLE templates`);

    // Drop the enums
    await queryRunner.query(`DROP TYPE notification_status_enum`);
    await queryRunner.query(`DROP TYPE notification_type_enum`);

    // Drop the events table
    await queryRunner.query(`DROP TABLE events`);
  }
}
