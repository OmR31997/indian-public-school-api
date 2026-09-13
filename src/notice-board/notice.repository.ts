import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Notice, NoticeDocument } from './schemas/notice.schema';

@Injectable()
export class NoticeRepository extends BaseRepository<NoticeDocument> {
  constructor(
    @InjectModel(Notice.name)
    private readonly noticeModel: Model<NoticeDocument>,
  ) {
    super(noticeModel);
  }
}
