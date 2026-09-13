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
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InquiryStatus } from './schemas/inquiry.schema';

@ApiTags('Inquiries')
@Controller('v1/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new inquiry' })
  create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default sample inquiry records' })
  seed() {
    return this.inquiriesService.seedDefaultInquiries();
  }

  @Get()
  @ApiOperation({ summary: 'List inquiry records with pagination and search' })
  @ApiQuery({ name: 'inquiryType', required: false, type: String, description: 'Filter by inquiry type (Admission, Transport, Fee Structure, etc.)' })
  @ApiQuery({ name: 'status', required: false, enum: InquiryStatus, description: 'Filter by status' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('inquiryType') inquiryType?: string,
    @Query('status') status?: string,
  ) {
    return this.inquiriesService.findAll(queryDto, inquiryType, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry details by ID' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an inquiry record by ID' })
  update(@Param('id') id: string, @Body() updateInquiryDto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inquiry record by ID' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
