import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export class NotificationQueryDto {
  @ApiProperty({ description: 'The page number for pagination', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: 'The number of items per page', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ description: 'The status of the notification', required: false })
  @IsOptional()
  @IsEnum({ PENDING: 'pending', SENT: 'sent', FAILED: 'failed' })
  status?: string;

  @ApiProperty({ description: 'The type of notification', required: false })
  @IsOptional()
  @IsEnum({ EMAIL: 'email', SMS: 'sms', PUSH: 'push' })
  type?: string;

  @ApiProperty({ description: 'The recipient ID for the notification', required: false })
  @IsOptional()
  @IsString()
  recipientId?: string;
}
