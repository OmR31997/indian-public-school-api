import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Student, StudentDocument } from './schemas/student.schema';

@Injectable()
export class StudentRepository extends BaseRepository<StudentDocument> {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {
    super(studentModel);
  }
}
