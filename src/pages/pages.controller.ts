import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@ApiTags('Pages')
@Controller('v1/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a page' })
  create(@Body() createDto: CreatePageDto) {
    return this.pagesService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List pages with search, filter, and pagination',
  })
  findAll(@Query() queryDto: PaginationQueryDto = {}) {
    return this.pagesService.findAll(queryDto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a page by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page by ID or slug' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a page by ID' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePageDto) {
    return this.pagesService.update(id, updateDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a page by ID' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
