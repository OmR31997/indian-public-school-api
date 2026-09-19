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
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status (true or false)' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('inquiryType') inquiryType?: string,
    @Query('status') status?: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.inquiriesService.findAll(queryDto, inquiryType, status, isRead);
  }

  @Get('notifications/unread')
  @ApiOperation({ summary: 'Get unread inquiry notification count and recent items' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of recent items returned' })
  getUnreadNotifications(@Query('limit') limit?: number) {
    return this.inquiriesService.getUnreadNotifications(limit ? Number(limit) : 10);
  }

  @Get('track')
  @ApiOperation({ summary: 'Track inquiry or feedback submission status by email, phone, or ID' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Email address, contact phone number, or submission ID' })
  track(@Query('query') query: string) {
    return this.inquiriesService.trackInquiry(query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all unread inquiry records as read' })
  markAllAsRead() {
    return this.inquiriesService.markAllAsRead();
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
