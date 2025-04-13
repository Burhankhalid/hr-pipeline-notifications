import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Notification } from './notification.entity';

@Entity('notification_deliveries')
export class NotificationDeliveries {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ name: 'notification_id' })
  notificationId: string;
  
  @ManyToOne(() => Notification)
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;
  
  @Column({ name: 'attempt_number' })
  attemptNumber: number;
  
  @Column()
  status: string;
  
  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
  
  @Column()
  channel: string;
  
  @Column({ name: 'error_details', type: 'text', nullable: true })
  errorDetails: string;
}