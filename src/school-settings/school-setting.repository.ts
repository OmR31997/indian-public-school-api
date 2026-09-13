import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { SchoolSetting, SchoolSettingDocument } from './schemas/school-setting.schema';

@Injectable()
export class SchoolSettingRepository extends BaseRepository<SchoolSettingDocument> {
  constructor(
    @InjectModel(SchoolSetting.name)
    private readonly schoolSettingModel: Model<SchoolSettingDocument>,
  ) {
    super(schoolSettingModel);
  }

  async findByKey(key: string): Promise<SchoolSettingDocument | null> {
    return this.schoolSettingModel.findOne({ key }).exec();
  }

  async findActive(): Promise<SchoolSettingDocument | null> {
    const active = await this.schoolSettingModel.findOne({ status: 'Active' }).exec();
    if (active) return active;
    const regexActive = await this.schoolSettingModel.findOne({ status: { $regex: /^active$/i } as any }).exec();
    if (regexActive) return regexActive;
    const nonInactive = await this.schoolSettingModel.findOne({ status: { $ne: 'Inactive' } }).exec();
    if (nonInactive) return nonInactive;
    return this.schoolSettingModel.findOne({ key: 'site_datasource' }).exec();
  }

  async deactivateOthers(excludeId?: string, category?: string): Promise<any> {
    const query: any = {};
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    if (category) {
      query.category = category;
    }
    return this.schoolSettingModel.updateMany(query, { $set: { status: 'Inactive' } }).exec();
  }

  async deactivateOthersByKey(excludeKey?: string, category?: string): Promise<any> {
    const query: any = {};
    if (excludeKey) {
      query.key = { $ne: excludeKey };
    }
    if (category) {
      query.category = category;
    }
    return this.schoolSettingModel.updateMany(query, { $set: { status: 'Inactive' } }).exec();
  }
}
