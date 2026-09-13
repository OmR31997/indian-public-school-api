import { Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly studentRepository: StudentRepository) {}

  async create(createStudentDto: CreateStudentDto) {
    return this.studentRepository.create(createStudentDto);
  }

  async findAll(queryDto: PaginationQueryDto = {}, grade?: string, status?: string) {
    const additionalFilter: Record<string, any> = {};
    if (grade) additionalFilter.grade = grade;
    if (status) additionalFilter.status = status;

    return this.studentRepository.findAll(
      queryDto,
      [
        'name',
        'studentId',
        'parentName',
        'parentEmail',
        'parentPhone',
        'grade',
        'section',
      ],
      additionalFilter,
    );
  }

  async findOne(id: string) {
    return this.studentRepository.findById(id);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    return this.studentRepository.update(id, updateStudentDto);
  }

  async remove(id: string) {
    return this.studentRepository.delete(id);
  }
}
