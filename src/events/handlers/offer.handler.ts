// handlers/offer.handler.ts (fixed version)

import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from '../interfaces/event-handler.interface';
import { EventPattern } from '../interfaces/event-pattern.interface';
import { NotificationsService } from '../../notifications/notifications.service';
import { TemplatesService } from '../../templates/template.service';
import { NotificationType } from '../../notifications/interfaces/notification.interface';

interface Recipient {
  email: string;
  name: string;
  isManager?: boolean;
}

@Injectable()
export class OfferEventHandler implements EventHandler {
  private readonly logger = new Logger(OfferEventHandler.name);

  constructor(
    private readonly notificationService: NotificationsService,
    private readonly templateService: TemplatesService,
  ) {}

  async handle(eventPattern: EventPattern, payload: any): Promise<void> {
    this.logger.log(`Processing offer event: ${eventPattern.type}`);

    try {
      switch (eventPattern.type) {
        case 'offer_created':
          await this.handleOfferCreated(payload);
          break;
        case 'offer_sent':
          await this.handleOfferSent(payload);
          break;
        case 'offer_accepted':
          await this.handleOfferAccepted(payload);
          break;
        case 'offer_rejected':
          await this.handleOfferRejected(payload);
          break;
        case 'offer_expired':
          await this.handleOfferExpired(payload);
          break;
        default:
          this.logger.warn(`Unhandled offer event type: ${eventPattern.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process offer event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleOfferCreated(payload: any): Promise<void> {
    const { hiringManagerEmail, hiringManagerName, recruiterEmail, recruiterName, offerDetails, candidateName } = payload;
    
    // Notify hiring manager
    if (hiringManagerEmail) {
      const content = await this.templateService.renderTemplate(
        'offer_created_hiring_manager',
        {
          managerName: hiringManagerName,
          candidateName,
          jobTitle: offerDetails.jobTitle,
          salary: offerDetails.compensation.salary,
          startDate: new Date(offerDetails.startDate),
          offerLink: offerDetails.reviewLink,
          approvalRequired: offerDetails.requiresApproval,
        }
      );

      await this.notificationService.send({
        recipientEmail: hiringManagerEmail,
        recipientName: hiringManagerName,
        type: NotificationType.OFFER_CREATED,
        subject: `Offer Created for ${candidateName}`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
          priority: offerDetails.requiresApproval ? 'high' : 'medium',
          actionRequired: offerDetails.requiresApproval,
        }
      });
    }

    // Notify recruiter
    if (recruiterEmail) {
      const content = await this.templateService.renderTemplate(
        'offer_created_recruiter',
        {
          recruiterName,
          candidateName,
          jobTitle: offerDetails.jobTitle,
          salary: offerDetails.compensation.salary,
          startDate: new Date(offerDetails.startDate),
          offerLink: offerDetails.reviewLink,
          nextSteps: offerDetails.requiresApproval 
            ? 'Waiting for hiring manager approval'
            : 'Ready to send to candidate',
        }
      );

      await this.notificationService.send({
        recipientEmail: recruiterEmail,
        recipientName: recruiterName,
        type: NotificationType.OFFER_CREATED,
        subject: `Offer Created for ${candidateName}`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
          priority: 'medium',
        }
      });
    }
  }

  private async handleOfferSent(payload: any): Promise<void> {
    const { candidateEmail, candidateName, recruiterEmail, recruiterName, offerDetails } = payload;
    
    // Notify candidate
    if (candidateEmail) {
      const content = await this.templateService.renderTemplate(
        'offer_sent_candidate',
        {
          candidateName,
          jobTitle: offerDetails.jobTitle,
          companyName: offerDetails.companyName,
          offerLink: offerDetails.candidateViewLink,
          offerValidUntil: new Date(offerDetails.validUntil),
          contactPerson: recruiterName,
          contactEmail: recruiterEmail,
        }
      );

      await this.notificationService.send({
        recipientEmail: candidateEmail,
        recipientName: candidateName,
        type: NotificationType.OFFER_SENT,
        subject: `Your Job Offer from ${offerDetails.companyName}`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
          priority: 'high',
          attachments: offerDetails.attachmentUrls,
        }
      });
    }

    // Notify recruiter that offer was sent
    if (recruiterEmail) {
      const content = await this.templateService.renderTemplate(
        'offer_sent_confirmation',
        {
          recruiterName,
          candidateName,
          jobTitle: offerDetails.jobTitle,
          sentTime: new Date(),
          offerValidUntil: new Date(offerDetails.validUntil),
          offerDetails: offerDetails.summaryText,
        }
      );

      await this.notificationService.send({
        recipientEmail: recruiterEmail,
        recipientName: recruiterName,
        type: NotificationType.OFFER_SENT,
        subject: `Offer Sent to ${candidateName}`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
        }
      });
    }
  }

  private async handleOfferAccepted(payload: any): Promise<void> {
    const { 
      hiringManagerEmail, hiringManagerName, 
      recruiterEmail, recruiterName, 
      offerDetails, candidateName,
      acceptanceDate 
    } = payload;
    
    // Create an array of recipients to notify
    const recipients: Recipient[] = [];
    
    if (hiringManagerEmail && hiringManagerName) {
      recipients.push({
        email: hiringManagerEmail,
        name: hiringManagerName,
        isManager: true
      });
    }
    
    if (recruiterEmail && recruiterName) {
      recipients.push({
        email: recruiterEmail,
        name: recruiterName,
        isManager: false
      });
    }
    
    // Send notifications to all relevant team members
    for (const recipient of recipients) {
      const content = await this.templateService.renderTemplate(
        'offer_accepted',
        {
          recipientName: recipient.name,
          candidateName,
          jobTitle: offerDetails.jobTitle,
          acceptanceDate: new Date(acceptanceDate),
          startDate: new Date(offerDetails.startDate),
          nextSteps: recipient.isManager 
            ? 'Please coordinate onboarding with HR' 
            : 'Please initiate the onboarding process',
          offerDetailsLink: offerDetails.detailsLink,
        }
      );

      await this.notificationService.send({
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        type: NotificationType.OFFER_ACCEPTED,
        subject: `${candidateName} Has Accepted Offer`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
          priority: 'high',
          actionRequired: true,
        }
      });
    }
  }

  private async handleOfferRejected(payload: any): Promise<void> {
    const { 
      hiringManagerEmail, hiringManagerName, 
      recruiterEmail, recruiterName, 
      offerDetails, candidateName,
      rejectionDate, rejectionReason 
    } = payload;
    
    // Create an array of recipients to notify
    const recipients: Recipient[] = [];
    
    if (hiringManagerEmail && hiringManagerName) {
      recipients.push({
        email: hiringManagerEmail,
        name: hiringManagerName
      });
    }
    
    if (recruiterEmail && recruiterName) {
      recipients.push({
        email: recruiterEmail,
        name: recruiterName
      });
    }
    
    // Send notifications to all relevant team members
    for (const recipient of recipients) {
      const content = await this.templateService.renderTemplate(
        'offer_rejected',
        {
          recipientName: recipient.name,
          candidateName,
          jobTitle: offerDetails.jobTitle,
          rejectionDate: new Date(rejectionDate),
          rejectionReason: rejectionReason || 'No reason provided',
          offerDetailsLink: offerDetails.detailsLink,
        }
      );

      await this.notificationService.send({
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        type: NotificationType.OFFER_REJECTED,
        subject: `${candidateName} Has Declined Offer`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
          priority: 'medium',
        }
      });
    }
  }

  private async handleOfferExpired(payload: any): Promise<void> {
    const { recruiterEmail, recruiterName, offerDetails, candidateName, candidateEmail } = payload;
    
    // Notify recruiter about expired offer
    if (recruiterEmail) {
      const content = await this.templateService.renderTemplate(
        'offer_expired',
        {
          recruiterName,
          candidateName,
          jobTitle: offerDetails.jobTitle,
          expirationDate: new Date(offerDetails.validUntil),
          offerDetailsLink: offerDetails.detailsLink,
          candidateContactInfo: candidateEmail,
        }
      );

      await this.notificationService.send({
        recipientEmail: recruiterEmail,
        recipientName: recruiterName,
        type: NotificationType.OFFER_EXPIRED,
        subject: `Offer for ${candidateName} Has Expired`,
        content,
        channel: ["Email"],
        metadata: {
          offerId: offerDetails.id,
          priority: 'medium',
          actionRequired: true,
        }
      });
    }
  }
}