import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { News, NewsDocument } from './schemas/news.schema';

@Injectable()
export class NewsRepository extends BaseRepository<NewsDocument> {
  constructor(
    @InjectModel(News.name)
    private readonly newsModel: Model<NewsDocument>,
  ) {
    super(newsModel);
  }
}
