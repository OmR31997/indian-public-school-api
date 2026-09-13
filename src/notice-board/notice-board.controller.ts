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
import { NoticeBoardService } from './notice-board.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notice Board')
@Controller('v1/notices')
export class NoticeBoardController {
  constructor(private readonly noticeBoardService: NoticeBoardService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new notice' })
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeBoardService.create(createNoticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List notice board items with filters (category, priority, publication status)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (Academic, Holiday, Events, Examination, General)' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority (Low, Medium, High, Urgent)' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Filter by publication status' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('isPublished') isPublished?: boolean,
  ) {
    return this.noticeBoardService.findAll(queryDto, category, priority, isPublished);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notice details by ID' })
  findOne(@Param('id') id: string) {
    return this.noticeBoardService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a notice record by ID' })
  update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeBoardService.update(id, updateNoticeDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notice record by ID' })
  remove(@Param('id') id: string) {
    return this.noticeBoardService.remove(id);
  }
}
