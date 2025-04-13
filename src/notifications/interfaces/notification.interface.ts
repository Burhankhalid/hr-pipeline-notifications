export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    FAILED = 'failed',
  }
  
  export enum NotificationType {
    NEW_APPLICATION = 'new_application',
    APPLICATION_STATUS_CHANGE = 'application_status_change',
    INTERVIEW_SCHEDULED = 'interview_scheduled',
    INTERVIEW_REMINDER = 'interview_reminder',
    ASSESSMENT_REQUEST = 'assessment_request',
    ASSESSMENT_COMPLETED = 'assessment_completed',
    OFFER_CREATED = 'offer_created',
    OFFER_ACCEPTED = 'offer_accepted',
    OFFER_REJECTED = 'offer_rejected',
    GENERAL = 'general',
    INTERVIEW_CANCELLED = "INTERVIEW_CANCELLED",
    FEEDBACK_REQUESTED = "FEEDBACK_REQUESTED",
    APPLICATION_UPDATED = "APPLICATION_UPDATED",
    APPLICATION_RECEIVED = "APPLICATION_RECEIVED",
    OFFER_EXPIRED = "OFFER_EXPIRED",
    OFFER_SENT = "OFFER_SENT",
  }
  
  export interface INotification {
    id?: string;
    type?: NotificationType;
    recipientId?: string;
    recipientEmail?: string;
    recipientName?: string;
    subject?: string;
    templateId?: string;
    content?: string;
    metadata?: Record<string, any>;
    status?: NotificationStatus;
    createdAt?: Date;
    updatedAt?: Date;
    scheduledFor?: Date;
    channel?: string[];
    retryCount?: number;
    lastRetryAt?: Date;
    errorDetails?: string;
    correlationId?: string;
    templateData?: Record<string, any>;
  }