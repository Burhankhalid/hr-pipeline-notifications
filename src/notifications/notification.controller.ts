import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('notifications')
@Controller('api/notifications')
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  
  @Get()
  @ApiOperation({ summary: 'Get all notifications with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'recipientId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return notifications', type: [NotificationResponseDto] })
  async findAll(@Query() query: NotificationQueryDto): Promise<{ 
    data: NotificationResponseDto[],
    total: number,
    page: number,
    limit: number
  }> {
    const [notifications, total] = await this.notificationsService.findAll(query);
    
    return {
      data: notifications.map(notification => new NotificationResponseDto(notification)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the notification', 
    type: NotificationResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.findById(id);
    return new NotificationResponseDto(notification);
  }
  
  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ 
    status: 201, 
    description: 'The notification has been successfully created', 
    type: NotificationResponseDto 
  })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.create(createNotificationDto);
    return new NotificationResponseDto(notification);
  }
}