import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Inquiry, InquiryDocument } from './schemas/inquiry.schema';

@Injectable()
export class InquiryRepository extends BaseRepository<InquiryDocument> {
  constructor(
    @InjectModel(Inquiry.name)
    private readonly inquiryModel: Model<InquiryDocument>,
  ) {
    super(inquiryModel);
  }

  async markAllAsRead(): Promise<{ modifiedCount: number }> {
    const res = await this.inquiryModel.updateMany(
      { isRead: { $ne: true } },
      { $set: { isRead: true } },
    );
    return { modifiedCount: res.modifiedCount };
  }

  async countUnread(): Promise<number> {
    return this.inquiryModel.countDocuments({ isRead: { $ne: true } });
  }
}
