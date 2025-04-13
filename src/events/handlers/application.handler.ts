import { Injectable } from '@nestjs/common';
import { BaseEventHandler } from './base.handler';
import { BaseEventDto } from '../dto/base-event.dto';
import { NotificationFactory } from '../../notifications/factories/notification.factory';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/interfaces/notification.interface';

@Injectable()
export class ApplicationEventHandler extends BaseEventHandler {
  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }
  
  async handle(event: BaseEventDto): Promise<void> {
    this.logEventProcessing(event);
    
    switch (event.eventType) {
      case 'candidate.application.created':
        await this.handleNewApplication(event); 
        break;
      case 'candidate.application.updated':
        await this.handleApplicationUpdate(event);
        break;
      case 'candidate.assessment.completed':
        await this.handleAssessmentCompleted(event);
        break;
      default:
        this.logger.warn(`Unhandled application event type: ${event.eventType}`);
    }
  }
  
  private async handleNewApplication(event: BaseEventDto): Promise<void> {
    const { candidateId, recruiterIds, position } = event.payload;
    
    // Notify recruiters about new application
    for (const recruiterId of recruiterIds) {
      const notification = await this.notificationFactory.createNotification({
        type: NotificationType.NEW_APPLICATION,
        recipientId: recruiterId,
        templateData: {
          candidateName: event.payload.candidateName,
          position: position.title,
          applicationDate: event.timestamp,
        },
        correlationId: event.correlationId,
        channels: ['email', 'in-app'],
      });
      
      await this.notificationsService.send(notification);
    }
    
    // Notify candidate about received application
    const candidateNotification = await this.notificationFactory.createNotification({
      type: NotificationType.APPLICATION_RECEIVED,
      recipientId: candidateId,
      templateData: {
        position: position.title,
        companyName: event.payload.companyName,
        applicationDate: event.timestamp,
      },
      correlationId: event.correlationId,
      channels: ['email'],
    });
    
    await this.notificationsService.send(candidateNotification);
  }
  

  private async handleApplicationUpdate(event: BaseEventDto): Promise<void> {
    const { candidateId, position, updateFields } = event.payload;

    const candidateNotification = await this.notificationFactory.createNotification({
      type: NotificationType.APPLICATION_UPDATED,
      recipientId: candidateId,
      templateData: {
        position: position.title,
        updatedFields: updateFields.join(', '), // assuming updateFields is a list of field names
        updatedAt: event.timestamp,
      },
      correlationId: event.correlationId,
      channels: ['in-app'],
    });

    await this.notificationsService.send(candidateNotification);
  }

  private async handleAssessmentCompleted(event: BaseEventDto): Promise<void> {
    const { candidateId, recruiterIds, position, assessmentScore } = event.payload;

    // Notify candidate
    const candidateNotification = await this.notificationFactory.createNotification({
      type: NotificationType.ASSESSMENT_COMPLETED,
      recipientId: candidateId,
      templateData: {
        position: position.title,
        score: assessmentScore,
        completedAt: event.timestamp,
      },
      correlationId: event.correlationId,
      channels: ['email'],
    });

    await this.notificationsService.send(candidateNotification);

    // Notify recruiters
    for (const recruiterId of recruiterIds) {
      const recruiterNotification = await this.notificationFactory.createNotification({
        type: NotificationType.ASSESSMENT_COMPLETED,
        recipientId: recruiterId,
        templateData: {
          candidateName: event.payload.candidateName,
          position: position.title,
          score: assessmentScore,
          completedAt: event.timestamp,
        },
        correlationId: event.correlationId,
        channels: ['email', 'in-app'],
      });

      await this.notificationsService.send(recruiterNotification);
    }
  }   

}