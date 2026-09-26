import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.notificationRepository.create({
      ...createNotificationDto,
      isRead: createNotificationDto.isRead ?? false,
    });
  }

  async findAll(
    queryDto: PaginationQueryDto = {},
    type?: string,
    isRead?: string | boolean,
  ) {
    const additionalFilter: Record<string, any> = {};
    if (type) {
      additionalFilter.type = type;
    }
    if (isRead !== undefined && isRead !== null && isRead !== '') {
      additionalFilter.isRead = String(isRead) === 'true';
    }

    return this.notificationRepository.findAll(
      queryDto,
      ['title', 'message', 'type', 'referenceId'],
      additionalFilter,
    );
  }

  async getUnreadNotifications(limit = 10, type?: string) {
    const [unreadCount, items] = await Promise.all([
      this.notificationRepository.countUnread(type),
      this.notificationRepository.getRecentUnread(limit, type),
    ]);

    return {
      unreadCount,
      items,
    };
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(type?: string) {
    return this.notificationRepository.markAllAsRead(type);
  }

  async remove(id: string) {
    return this.notificationRepository.delete(id);
  }

  // =========================================================================
  // Event-driven Notification Triggers
  // =========================================================================

  @OnEvent('inquiry.created')
  async handleInquiryCreatedEvent(payload: { inquiryId: string; name: string; email: string; contact: string; inquiryType: string; message: string }) {
    try {
      this.logger.log(`Handling inquiry.created event for inquiry: ${payload.inquiryId}`);
      await this.create({
        title: `New Inquiry (${payload.inquiryType})`,
        message: `Inquiry from ${payload.name} (${payload.email || payload.contact}): "${payload.message.substring(0, 100)}"`,
        type: NotificationType.INQUIRY,
        referenceId: payload.inquiryId,
        referenceType: 'Inquiry',
        metadata: payload,
      });
    } catch (err) {
      this.logger.error(`Failed to handle inquiry.created event: ${err}`);
    }
  }

  @OnEvent('career_application.created')
  async handleCareerApplicationCreatedEvent(payload: { applicationId: string; applicationNo: string; postTitle: string; fullName: string; email: string; phone: string }) {
    try {
      this.logger.log(`Handling career_application.created event for application: ${payload.applicationNo}`);
      await this.create({
        title: `New Application for ${payload.postTitle}`,
        message: `Candidate ${payload.fullName} (${payload.email}) submitted application #${payload.applicationNo}`,
        type: NotificationType.CAREER_APPLICATION,
        referenceId: payload.applicationId,
        referenceType: 'CareerApplication',
        metadata: payload,
      });
    } catch (err) {
      this.logger.error(`Failed to handle career_application.created event: ${err}`);
    }
  }
}
