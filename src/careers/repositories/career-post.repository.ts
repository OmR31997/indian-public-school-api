import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CareerPost, CareerPostDocument } from '../schemas/career-post.schema';

@Injectable()
export class CareerPostRepository extends BaseRepository<CareerPostDocument> {
  constructor(
    @InjectModel(CareerPost.name)
    private readonly careerPostModel: Model<CareerPostDocument>,
  ) {
    super(careerPostModel);
  }

  async findActiveOpenings(): Promise<CareerPostDocument[]> {
    return this.careerPostModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()
      .exec() as unknown as CareerPostDocument[];
  }
}
