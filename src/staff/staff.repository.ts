import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Staff, StaffDocument } from './schemas/staff.schema';

@Injectable()
export class StaffRepository extends BaseRepository<StaffDocument> {
  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {
    super(staffModel);
  }
}
