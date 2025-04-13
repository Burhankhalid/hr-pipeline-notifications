import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { NotificationStatus, NotificationType } from '../interfaces/notification.interface';

export class CreateNotificationDto {
  @ApiProperty({ description: 'The title of the notification' })
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The content of the notification' })
  @IsString()
  content?: string;

  @ApiProperty({ description: 'The status of the notification', enum: NotificationStatus })
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiProperty({ description: 'The type of the notification', enum: NotificationType })
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ description: 'List of recipient IDs for the notification' })
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiProperty({ description: 'Timestamp of when the notification was created', required: false })
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ description: 'Additional metadata or error details', required: false })
  @IsString()
  @IsOptional()
  errorDetails?: string;
}
