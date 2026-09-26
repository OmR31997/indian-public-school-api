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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new notification record' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List all notifications with pagination and filters' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by notification type (INQUIRY, CAREER_APPLICATION, etc.)' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status (true or false)' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.notificationsService.findAll(queryDto, type, isRead);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count and recent unread items' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit recent items returned' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by notification type' })
  getUnreadNotifications(
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    return this.notificationsService.getUnreadNotifications(limit ? Number(limit) : 10, type);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Optional notification type to mark as read' })
  markAllAsRead(@Query('type') type?: string) {
    return this.notificationsService.markAllAsRead(type);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read by ID' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification record by ID' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
