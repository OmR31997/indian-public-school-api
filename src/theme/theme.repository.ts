import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Theme, ThemeDocument } from './schemas/theme.schema';

@Injectable()
export class ThemeRepository extends BaseRepository<ThemeDocument> {
  constructor(
    @InjectModel(Theme.name)
    private readonly themeModel: Model<ThemeDocument>,
  ) {
    super(themeModel);
  }

  async findActive(portal?: string): Promise<ThemeDocument | null> {
    if (portal) {
      const portalQuery = portal === 'web'
        ? { isActive: true, $or: [{ portal: { $in: ['web', 'both'] } }, { portal: { $exists: false } }, { portal: null }, { portal: '' }] }
        : { isActive: true, portal: { $in: [portal, 'both'] } };
      const portalTheme = await this.themeModel.findOne(portalQuery).exec();
      if (portalTheme) return portalTheme as any;
    }
    return this.themeModel.findOne({ isActive: true }).exec() as any;
  }

  async findBySlug(slug: string): Promise<ThemeDocument | null> {
    return this.themeModel.findOne({ slug }).exec() as any;
  }

  async findAllRaw(): Promise<ThemeDocument[]> {
    return this.themeModel.find().exec() as any;
  }

  async deactivateAll(): Promise<any> {
    return this.themeModel.updateMany({}, { $set: { isActive: false } }).exec();
  }

  async deactivateForPortal(portal: string = 'web'): Promise<any> {
    if (portal === 'both') {
      return this.deactivateAll();
    }
    const filter = portal === 'web'
      ? { $or: [{ portal: { $in: ['web', 'both'] } }, { portal: { $exists: false } }, { portal: null }, { portal: '' }] }
      : { portal: { $in: [portal, 'both'] } };
    return this.themeModel.updateMany(
      filter,
      { $set: { isActive: false } },
    ).exec();
  }

  async countThemes(): Promise<number> {
    return this.themeModel.countDocuments().exec();
  }
}

