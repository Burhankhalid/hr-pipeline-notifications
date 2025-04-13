import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../../src/notifications/notification.controller';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../../src/common/interceptors/logging.interceptor';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { CreateNotificationDto } from '../../src/notifications/dto/create-notification.dto';
import { NotificationResponseDto } from '../../src/notifications/dto/notification-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        { provide: LoggingInterceptor, useValue: {} },
        { provide: HttpExceptionFilter, useValue: {} },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockNotifications = [
        { id: '1', message: 'Notification 1' },
        { id: '2', message: 'Notification 2' },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue([mockNotifications, 2]);

      const result = await controller.findAll(mockQuery);

      expect(result.data).toHaveLength(2); // Should have 2 notifications
      expect(result.total).toBe(2); // Total count should be 2
    });
  });

  describe('findOne', () => {
    it('should return a notification by id', async () => {
      const mockNotification = { id: '1', message: 'Notification 1' };

      jest.spyOn(service, 'findById').mockResolvedValue(mockNotification);

      const result = await controller.findOne('1');

      expect(result).toEqual(new NotificationResponseDto(mockNotification));
    });

    it('should throw a 404 error if notification not found', async () => {
        jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException());
      
        await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a notification', async () => {
      const createNotificationDto: CreateNotificationDto = { title: 'Application Received' };
      const savedNotification = { id: '1', ...createNotificationDto };

      jest.spyOn(service, 'create').mockResolvedValue(new NotificationResponseDto(savedNotification));

      const result = await controller.create(createNotificationDto);

      expect(result).toEqual(new NotificationResponseDto(savedNotification));
    });

    it('should throw an error if creation fails', async () => {
      const createNotificationDto: CreateNotificationDto = { title: 'Offer Accepted' };

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Failed to create notification'));

      await expect(controller.create(createNotificationDto)).rejects.toThrowError(BadRequestException);
    });
  });
});
