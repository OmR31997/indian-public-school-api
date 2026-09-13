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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Students')
@Controller('v1/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new student enrollment record' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List students with pagination, search, and grade/status filters' })
  @ApiQuery({ name: 'grade', required: false, description: 'Filter by grade / class' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by student status (Active, Inactive)' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('grade') grade?: string,
    @Query('status') status?: string,
  ) {
    return this.studentsService.findAll(queryDto, grade, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student details by ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a student enrollment record by ID' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student record by ID' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
