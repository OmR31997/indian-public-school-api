import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Page, PageDocument } from './schemas/page.schema';

@Injectable()
export class PagesRepository extends BaseRepository<PageDocument> {
  constructor(
    @InjectModel(Page.name)
    private readonly pageModel: Model<PageDocument>,
  ) {
    super(pageModel);
  }

  async findBySlugOrId(identifier: string): Promise<PageDocument | null> {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      const doc = await this.pageModel.findById(identifier).exec();
      if (doc) return doc;
    }
    return this.pageModel
      .findOne({
        $or: [
          { publicId: identifier },
          { slug: clean },
          { targetUrl: clean },
          { targetUrl: `/${clean}` },
          { targetUrl: `/pages/${clean}` },
        ],
      })
      .exec();
  }
}


