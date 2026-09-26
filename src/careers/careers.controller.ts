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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ApplyCareerDto } from './dto/apply-career.dto';
import { CreateCareerPostDto } from './dto/create-career-post.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateCareerPostDto } from './dto/update-career-post.dto';
import { CareerApplicationsService } from './services/career-applications.service';
import { CareerPostsService } from './services/career-posts.service';

@ApiTags('Careers')
@Controller('v1/careers')
export class CareersController {
  constructor(
    private readonly careerPostsService: CareerPostsService,
    private readonly careerApplicationsService: CareerApplicationsService,
  ) {}

  // ==========================================
  // Public Endpoints
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'Get active career openings for public website' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAllPosts(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('isActive') isActive?: string,
  ) {
    let activeBool: boolean | undefined = undefined;
    if (isActive === 'true') activeBool = true;
    else if (isActive === 'false') activeBool = false;
    else if (isActive === 'all') activeBool = undefined;

    return this.careerPostsService.findAll(queryDto, activeBool);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active job openings sorted by display order' })
  findActiveOpenings() {
    return this.careerPostsService.findActiveOpenings();
  }

  @Post('apply')
  @ApiOperation({ summary: 'Submit job application for a career post' })
  apply(@Body() applyDto: ApplyCareerDto) {
    return this.careerApplicationsService.apply(applyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single career post details by ID' })
  findOnePost(@Param('id') id: string) {
    return this.careerPostsService.findOne(id);
  }

  // ==========================================
  // Admin Protected Endpoints
  // ==========================================

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Admin: Create a new career opening' })
  createPost(@Body() createDto: CreateCareerPostDto) {
    return this.careerPostsService.create(createDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update a career opening by ID' })
  updatePost(@Param('id') id: string, @Body() updateDto: UpdateCareerPostDto) {
    return this.careerPostsService.update(id, updateDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete a career opening by ID' })
  removePost(@Param('id') id: string) {
    return this.careerPostsService.remove(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('applications/all')
  @ApiOperation({ summary: 'Admin: Get candidate applications list' })
  @ApiQuery({ name: 'postId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  findAllApplications(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('postId') postId?: string,
    @Query('status') status?: string,
    @Query('isRead') isRead?: string,
  ) {
    const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;
    return this.careerApplicationsService.findAll(queryDto, postId, status, isReadBool);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('applications/notifications/unread')
  @ApiOperation({ summary: 'Admin: Get unread applications notification count and list' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getUnreadNotifications(@Query('limit') limit?: number) {
    return this.careerApplicationsService.getUnreadNotifications(limit ? Number(limit) : 10);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch('applications/notifications/mark-all-read')
  @ApiOperation({ summary: 'Admin: Mark all unread application notifications as read' })
  markAllApplicationsAsRead() {
    return this.careerApplicationsService.markAllAsRead();
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Admin: Update application candidate status or mark as read' })
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.careerApplicationsService.updateStatus(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('applications/:id')
  @ApiOperation({ summary: 'Admin: Delete candidate application record' })
  removeApplication(@Param('id') id: string) {
    return this.careerApplicationsService.remove(id);
  }
}
