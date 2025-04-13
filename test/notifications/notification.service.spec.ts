import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '../../src/notifications/entities/notification.entity'; // Assuming you have an entity
import { NotificationType, NotificationStatus } from '../../src/notifications/interfaces/notification.interface'; // Assuming you have an interface
import { Repository } from 'typeorm';
import { CreateNotificationDto } from '../../src/notifications/dto/create-notification.dto';
import { NotificationResponseDto } from '../../src/notifications/dto/notification-response.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      // Mock notifications with all required properties
      const mockNotifications = [
        {
          id: '1',
          message: 'Notification 1',
          type: NotificationType.APPLICATION_RECEIVED, // Example type
          recipientId: 'user1',
          templateId: 'template1',
          content: 'This is a test notification',
          metadata: {}, // Add missing metadata
          status: NotificationStatus.SENT, // Add missing status
          createdAt: new Date(), // Add createdAt
          updatedAt: new Date(), // Add updatedAt
          scheduledFor: new Date(), // Add scheduledFor
          channel: ['email'], // Example channel
          retryCount: 0, // Add retryCount
          lastRetryAt: new Date(), // Add lastRetryAt
          errorDetails: '', // Add errorDetails
          correlationId: 'correlationId1', // Add correlationId
          templateData: {}, // Add templateData
        },
        {
          id: '2',
          message: 'Notification 2',
          type: NotificationType.NEW_APPLICATION, // Example type
          recipientId: 'user2',
          templateId: 'template2',
          content: 'This is another test notification',
          metadata: {}, // Add missing metadata
          status: NotificationStatus.PENDING, // Add missing status
          createdAt: new Date(), // Add createdAt
          updatedAt: new Date(), // Add updatedAt
          scheduledFor: new Date(), // Add scheduledFor
          channel: ['sms'], // Example channel
          retryCount: 0, // Add retryCount
          lastRetryAt: new Date(), // Add lastRetryAt
          errorDetails: '', // Add errorDetails
          correlationId: 'correlationId2', // Add correlationId
          templateData: {}, // Add templateData
        },
      ];
  
      const mockQuery = { page: 1, limit: 10 };
  
      // Mock repository methods
      jest.spyOn(repository, 'find').mockResolvedValue(mockNotifications);
      jest.spyOn(repository, 'count').mockResolvedValue(mockNotifications.length);
  
      // Call the service method
      const result = await service.findAll(mockQuery);
  
      // Assert the results
        expect(result[0]).toHaveLength(2); // Should have 2 notifications
        expect(result[1]).toBe(2);
    });
  });
  
  

  describe('findById', () => {
    it('should return a notification by id', async () => {
      const mockNotification = {
            id: '2',
            message: 'Notification 2',
            type: NotificationType.NEW_APPLICATION, // Example type
            recipientId: 'user2',
            templateId: 'template2',
            content: 'This is another test notification',
            metadata: {}, // Add missing metadata
            status: NotificationStatus.PENDING, // Add missing status
            createdAt: new Date(), // Add createdAt
            updatedAt: new Date(), // Add updatedAt
            scheduledFor: new Date(), // Add scheduledFor
            channel: ['sms'], // Example channel
            retryCount: 0, // Add retryCount
            lastRetryAt: new Date(), // Add lastRetryAt
            errorDetails: '', // Add errorDetails
            correlationId: 'correlationId2', // Add correlationId
            templateData: {}, // Add templateData
        };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockNotification);

      const result = await service.findById('1');

      expect(result).toEqual(mockNotification);
    });

    it('should throw an error if notification not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow('Notification not found');
    });
  });

  describe('create', () => {
    it('should create and return a notification', async () => {
      const createNotificationDto: CreateNotificationDto = { title: 'New notification' };
      const savedNotification = { id: '1', ...createNotificationDto };

      jest.spyOn(repository, 'create').mockReturnValue(savedNotification as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedNotification as any);

      const result = await service.create(createNotificationDto);

      expect(result).toEqual(new NotificationResponseDto(savedNotification));
    });

    it('should throw an error if creation fails', async () => {
      const createNotificationDto: CreateNotificationDto = { title: 'New notification' };

      jest.spyOn(repository, 'create').mockReturnValue(createNotificationDto as any);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Failed to save notification'));

      await expect(service.create(createNotificationDto)).rejects.toThrow('Failed to create notification');
    });
  });
});
