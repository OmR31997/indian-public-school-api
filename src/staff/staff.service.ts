import { Injectable } from '@nestjs/common';
import { StaffRepository } from './staff.repository';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class StaffService {
  constructor(private readonly staffRepository: StaffRepository) {}

  async create(createStaffDto: CreateStaffDto) {
    return this.staffRepository.create(createStaffDto);
  }

  async findAll(
    queryDto: PaginationQueryDto = {},
    department?: string,
    status?: string,
  ) {
    const additionalFilter: Record<string, any> = {};
    if (department) additionalFilter.department = department;
    if (status) additionalFilter.status = status;

    return this.staffRepository.findAll(
      queryDto,
      ['name', 'employeeId', 'email', 'phone', 'department', 'designation'],
      additionalFilter,
    );
  }

  async findOne(id: string) {
    return this.staffRepository.findById(id);
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    return this.staffRepository.update(id, updateStaffDto);
  }

  async remove(id: string) {
    return this.staffRepository.delete(id);
  }
}
