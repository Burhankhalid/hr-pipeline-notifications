import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus, NotificationType } from '../interfaces/notification.interface';  // Reuse enums if required

export class NotificationResponseDto {
  @ApiProperty({ description: 'The unique identifier of the notification' })
  id: string;

  @ApiProperty({ description: 'The title of the notification' })
  title: string;

  @ApiProperty({ description: 'The content of the notification' })
  content: string;

  @ApiProperty({ description: 'The status of the notification' })
  status: NotificationStatus;

  @ApiProperty({ description: 'The type of the notification' })
  type: NotificationType;

  @ApiProperty({ description: 'The list of recipient IDs' })
  recipients: string[];

  @ApiProperty({ description: 'Timestamp of when the notification was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Any error details related to the notification', nullable: true })
  errorDetails: string | null;

  constructor(partial: Partial<NotificationResponseDto>) {
    Object.assign(this, partial);
  }
}
