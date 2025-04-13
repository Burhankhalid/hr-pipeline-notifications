import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationStatus, NotificationType } from '../interfaces/notification.interface';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;
  
  @Column({ name: 'recipient_id' })
  recipientId: string;
  
  @Column({ name: 'template_id', nullable: true })
  templateId: string;
  
  @Column({ type: 'text', nullable: true })
  content: string;
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
  
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  
  @Column({ name: 'scheduled_for', nullable: true })
  scheduledFor: Date;
  
  @Column('simple-array', { name: 'channel' })
  channel: string[];
  
  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;
  
  @Column({ name: 'last_retry_at', nullable: true })
  lastRetryAt: Date;
  
  @Column({ name: 'error_details', type: 'text', nullable: true })
  errorDetails: string;
  
  @Column({ name: 'correlation_id' })
  correlationId: string;
  
  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData: Record<string, any>;
}