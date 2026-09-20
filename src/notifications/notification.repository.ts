import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }

  async countUnread(type?: NotificationType | string): Promise<number> {
    const filter: Record<string, any> = { isRead: false };
    if (type) {
      filter.type = type;
    }
    return this.notificationModel.countDocuments(filter).exec();
  }

  async getRecentUnread(limit = 10, type?: NotificationType | string): Promise<NotificationDocument[]> {
    const filter: Record<string, any> = { isRead: false };
    if (type) {
      filter.type = type;
    }
    return this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as NotificationDocument[];
  }

  async markAllAsRead(type?: NotificationType | string): Promise<{ modifiedCount: number }> {
    const filter: Record<string, any> = { isRead: false };
    if (type) {
      filter.type = type;
    }
    const res = await this.notificationModel.updateMany(filter, { $set: { isRead: true } });
    return { modifiedCount: res.modifiedCount };
  }

  async markAsRead(id: string): Promise<NotificationDocument | null> {
    return this.notificationModel
      .findByIdAndUpdate(id, { $set: { isRead: true } }, { new: true })
      .lean()
      .exec() as unknown as NotificationDocument | null;
  }
}
