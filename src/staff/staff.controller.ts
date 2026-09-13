import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Staff')
@Controller('v1/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new staff record' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List staff with pagination, search, and department/status filters',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (Active, On Leave, Inactive)',
  })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.staffService.findAll(queryDto, department, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member details by ID' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff record by ID' })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a staff record by ID' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
