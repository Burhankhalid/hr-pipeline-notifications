import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TemplatesService } from '../../templates/template.service';
import { INotification, NotificationStatus, NotificationType } from '../../notifications/interfaces/notification.interface'; ;

interface NotificationCreateParams {
  type: NotificationType;
  recipientId: string;
  templateData: Record<string, any>;
  correlationId: string;
  channels: string[];
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationFactory {
  private readonly logger = new Logger(NotificationFactory.name);
  
  constructor(private readonly templatesService: TemplatesService) {}
  
  async createNotification(params: NotificationCreateParams): Promise<INotification> {
    const {
      type,
      recipientId,
      templateData,
      correlationId,
      channels,
      scheduledFor,
      metadata,
    } = params;
    
    // Find template based on notification type
    const template = await this.templatesService.findTemplateByType(type);
    
    if (!template) {
      this.logger.warn(`No template found for notification type: ${type}`);
    }
    
    // Render content using template and data
    const content = template 
      ? await this.templatesService.renderTemplate(template[0].id, templateData)
      : '';
    
    return {
      id: uuidv4(),
      type,
      recipientId,
      templateId: template[0].id,
      content,
      metadata: { ...metadata },
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      scheduledFor: scheduledFor || new Date(),
      channel: channels,
      retryCount: 0,
      correlationId,
      templateData,
    };
  }
}