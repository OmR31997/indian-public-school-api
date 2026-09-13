import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewRepository extends BaseRepository<ReviewDocument> {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {
    super(reviewModel);
  }
}
