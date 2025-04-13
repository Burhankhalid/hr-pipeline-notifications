// handlers/interview.handler.ts

import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from '../interfaces/event-handler.interface';
import { EventPattern } from '../interfaces/event-pattern.interface';
import { NotificationsService } from '../../notifications/notifications.service';
import { TemplatesService } from '../../templates/template.service';
import { NotificationType } from '../../notifications/interfaces/notification.interface';

@Injectable()
export class InterviewEventHandler implements EventHandler {
  private readonly logger = new Logger(InterviewEventHandler.name);

  constructor(
    private readonly notificationService: NotificationsService,
    private readonly templateService: TemplatesService,
  ) {}

  async handle(eventPattern: EventPattern, payload: any): Promise<void> {
    this.logger.log(`Processing interview event: ${eventPattern.type}`);

    try {
      switch (eventPattern.type) {
        case 'interview_scheduled':
          await this.handleInterviewScheduled(payload);
          break;
        case 'interview_rescheduled':
          await this.handleInterviewRescheduled(payload);
          break;
        case 'interview_cancelled':
          await this.handleInterviewCancelled(payload);
          break;
        case 'interview_reminder':
          await this.handleInterviewReminder(payload);
          break;
        case 'interview_feedback_requested':
          await this.handleFeedbackRequested(payload);
          break;
        default:
          this.logger.warn(`Unhandled interview event type: ${eventPattern.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process interview event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleInterviewScheduled(payload: any): Promise<void> {
    const { candidateEmail, candidateName, interviewerEmail, interviewerName, interviewDetails } = payload;
    
    // Notify candidate
    if (candidateEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_scheduled_candidate',
        {
          candidateName,
          interviewDate: new Date(interviewDetails.scheduledTime),
          interviewType: interviewDetails.type,
          interviewDuration: interviewDetails.durationMinutes,
          interviewLocation: interviewDetails.location || 'Remote',
          interviewLink: interviewDetails.videoConferenceLink,
          interviewPreparationInfo: interviewDetails.preparationInfo,
        }
      );

      await this.notificationService.send({
        recipientEmail: candidateEmail,
        recipientName: candidateName,
        type: NotificationType.INTERVIEW_SCHEDULED,
        subject: 'Your Interview Has Been Scheduled',
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          addToCalendar: true,
          calendarEvent: {
            title: `Interview for ${interviewDetails.jobTitle}`,
            startTime: interviewDetails.scheduledTime,
            endTime: new Date(new Date(interviewDetails.scheduledTime).getTime() + interviewDetails.durationMinutes * 60000),
            location: interviewDetails.location || interviewDetails.videoConferenceLink,
            description: interviewDetails.description,
          }
        }
      });
    }

    // Notify interviewer
    if (interviewerEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_scheduled_interviewer',
        {
          interviewerName,
          candidateName,
          interviewDate: new Date(interviewDetails.scheduledTime),
          interviewType: interviewDetails.type,
          interviewDuration: interviewDetails.durationMinutes,
          interviewLocation: interviewDetails.location || 'Remote',
          interviewLink: interviewDetails.videoConferenceLink,
          jobTitle: interviewDetails.jobTitle,
          candidateResumeLink: payload.candidateResumeLink,
        }
      );

      await this.notificationService.send({
        recipientEmail: interviewerEmail,
        recipientName: interviewerName,
        type: NotificationType.INTERVIEW_SCHEDULED,
        subject: `Interview Scheduled with ${candidateName}`,
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          addToCalendar: true,
          calendarEvent: {
            title: `Interview with ${candidateName} for ${interviewDetails.jobTitle}`,
            startTime: interviewDetails.scheduledTime,
            endTime: new Date(new Date(interviewDetails.scheduledTime).getTime() + interviewDetails.durationMinutes * 60000),
            location: interviewDetails.location || interviewDetails.videoConferenceLink,
            description: interviewDetails.description,
          }
        }
      });
    }
  }

  private async handleInterviewRescheduled(payload: any): Promise<void> {
    const { candidateEmail, candidateName, interviewerEmail, interviewerName, interviewDetails, previousSchedule } = payload;
    
    // Notify candidate
    if (candidateEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_rescheduled_candidate',
        {
          candidateName,
          previousDate: new Date(previousSchedule.scheduledTime),
          newDate: new Date(interviewDetails.scheduledTime),
          interviewType: interviewDetails.type,
          interviewDuration: interviewDetails.durationMinutes,
          interviewLocation: interviewDetails.location || 'Remote',
          interviewLink: interviewDetails.videoConferenceLink,
          rescheduledReason: payload.rescheduledReason || 'Schedule adjustment',
        }
      );

      await this.notificationService.send({
        recipientEmail: candidateEmail,
        recipientName: candidateName,
        type: NotificationType.INTERVIEW_SCHEDULED,
        subject: 'Your Interview Has Been Rescheduled',
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          addToCalendar: true,
          updateExistingCalendarEvent: true,
          calendarEvent: {
            title: `Interview for ${interviewDetails.jobTitle}`,
            startTime: interviewDetails.scheduledTime,
            endTime: new Date(new Date(interviewDetails.scheduledTime).getTime() + interviewDetails.durationMinutes * 60000),
            location: interviewDetails.location || interviewDetails.videoConferenceLink,
            description: interviewDetails.description,
          }
        }
      });
    }

    // Notify interviewer
    if (interviewerEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_rescheduled_interviewer',
        {
          interviewerName,
          candidateName,
          previousDate: new Date(previousSchedule.scheduledTime),
          newDate: new Date(interviewDetails.scheduledTime),
          interviewType: interviewDetails.type,
          interviewDuration: interviewDetails.durationMinutes,
          interviewLocation: interviewDetails.location || 'Remote',
          interviewLink: interviewDetails.videoConferenceLink,
          rescheduledReason: payload.rescheduledReason || 'Schedule adjustment',
        }
      );

      await this.notificationService.send({
        recipientEmail: interviewerEmail,
        recipientName: interviewerName,
        type: NotificationType.INTERVIEW_SCHEDULED,
        subject: `Interview with ${candidateName} Has Been Rescheduled`,
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          addToCalendar: true,
          updateExistingCalendarEvent: true,
          calendarEvent: {
            title: `Interview with ${candidateName} for ${interviewDetails.jobTitle}`,
            startTime: interviewDetails.scheduledTime,
            endTime: new Date(new Date(interviewDetails.scheduledTime).getTime() + interviewDetails.durationMinutes * 60000),
            location: interviewDetails.location || interviewDetails.videoConferenceLink,
            description: interviewDetails.description,
          }
        }
      });
    }
  }

  private async handleInterviewCancelled(payload: any): Promise<void> {
    const { candidateEmail, candidateName, interviewerEmail, interviewerName, interviewDetails, cancellationReason } = payload;
    
    // Notify candidate
    if (candidateEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_cancelled_candidate',
        {
          candidateName,
          interviewDate: new Date(interviewDetails.scheduledTime),
          interviewType: interviewDetails.type,
          jobTitle: interviewDetails.jobTitle,
          cancellationReason: cancellationReason || 'Scheduling conflict',
          nextSteps: payload.nextSteps || 'You will be contacted shortly about rescheduling.',
        }
      );

      await this.notificationService.send({
        recipientEmail: candidateEmail,
        recipientName: candidateName,
        type: NotificationType.INTERVIEW_CANCELLED,
        subject: 'Your Interview Has Been Cancelled',
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          cancelCalendarEvent: true,
        }
      });
    }

    // Notify interviewer
    if (interviewerEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_cancelled_interviewer',
        {
          interviewerName,
          candidateName,
          interviewDate: new Date(interviewDetails.scheduledTime),
          interviewType: interviewDetails.type,
          jobTitle: interviewDetails.jobTitle,
          cancellationReason: cancellationReason || 'Scheduling conflict',
        }
      );

      await this.notificationService.send({
        recipientEmail: interviewerEmail,
        recipientName: interviewerName,
        type: NotificationType.INTERVIEW_CANCELLED,
        subject: `Interview with ${candidateName} Has Been Cancelled`,
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          cancelCalendarEvent: true,
        }
      });
    }
  }

  private async handleInterviewReminder(payload: any): Promise<void> {
    const { recipientEmail, recipientName, recipientType, interviewDetails, candidateName } = payload;
    
    if (recipientEmail) {
      const templateName = recipientType === 'candidate' 
        ? 'interview_reminder_candidate' 
        : 'interview_reminder_interviewer';
        
      const templateData = {
        recipientName,
        interviewDate: new Date(interviewDetails.scheduledTime),
        hoursRemaining: Math.round((new Date(interviewDetails.scheduledTime).getTime() - new Date().getTime()) / 3600000),
        interviewLocation: interviewDetails.location || 'Remote',
        interviewLink: interviewDetails.videoConferenceLink,
      };
      
      // Add candidate name for interviewer reminders
      if (recipientType === 'interviewer') {
        templateData['candidateName'] = candidateName;
      }
      
      const content = await this.templateService.renderTemplate(templateName, templateData);

      await this.notificationService.send({
        recipientEmail,
        recipientName,
        type: NotificationType.INTERVIEW_REMINDER,
        subject: 'Upcoming Interview Reminder',
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          priority: 'high'
        }
      });
    }
  }

  private async handleFeedbackRequested(payload: any): Promise<void> {
    const { interviewerEmail, interviewerName, interviewDetails, feedbackLink, candidateName } = payload;
    
    if (interviewerEmail) {
      const content = await this.templateService.renderTemplate(
        'interview_feedback_request',
        {
          interviewerName,
          candidateName,
          interviewDate: new Date(interviewDetails.scheduledTime),
          jobTitle: interviewDetails.jobTitle,
          feedbackLink,
          deadlineDate: payload.feedbackDeadline,
        }
      );

      await this.notificationService.send({
        recipientEmail: interviewerEmail,
        recipientName: interviewerName,
        type: NotificationType.FEEDBACK_REQUESTED,
        subject: `Feedback Requested for ${candidateName}`,
        content,
        channel: ["email", "in-app"],
        metadata: {
          interviewId: interviewDetails.id,
          priority: 'medium',
          reminderScheduled: true,
          reminderTime: payload.feedbackDeadline 
        }
      });
    }
  }
}