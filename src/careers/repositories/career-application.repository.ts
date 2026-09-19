import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CareerApplication, CareerApplicationDocument } from '../schemas/career-application.schema';

@Injectable()
export class CareerApplicationRepository extends BaseRepository<CareerApplicationDocument> {
  constructor(
    @InjectModel(CareerApplication.name)
    private readonly careerApplicationModel: Model<CareerApplicationDocument>,
  ) {
    super(careerApplicationModel);
  }

  async countUnread(): Promise<number> {
    return this.careerApplicationModel.countDocuments({ isRead: { $ne: true } }).exec();
  }

  async getRecentUnread(limit = 10): Promise<CareerApplicationDocument[]> {
    return this.careerApplicationModel
      .find({ isRead: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as CareerApplicationDocument[];
  }

  async markAllAsRead(): Promise<{ modifiedCount: number }> {
    const res = await this.careerApplicationModel.updateMany(
      { isRead: { $ne: true } },
      { $set: { isRead: true } },
    );
    return { modifiedCount: res.modifiedCount };
  }
}
