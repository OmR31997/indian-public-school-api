import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CareerApplicationRepository } from '../repositories/career-application.repository';
import { CareerPostRepository } from '../repositories/career-post.repository';
import { ApplyCareerDto } from '../dto/apply-career.dto';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UploadsService } from '../../uploads/uploads.service';
import * as crypto from 'crypto';

@Injectable()
export class CareerApplicationsService {
  private readonly logger = new Logger(CareerApplicationsService.name);

  constructor(
    private readonly careerApplicationRepository: CareerApplicationRepository,
    private readonly careerPostRepository: CareerPostRepository,
    private readonly uploadsService: UploadsService,
  ) {}

  private generateApplicationNo(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `APP-${year}-${randomHex}`;
  }

  async apply(applyCareerDto: ApplyCareerDto) {
    // 1. Verify post exists & is open
    const post = await this.careerPostRepository.findById(applyCareerDto.postId);
    if (!post) {
      throw new NotFoundException(`Career opening with ID "${applyCareerDto.postId}" not found`);
    }

    if (!post.isActive) {
      throw new BadRequestException(`Applications for "${post.title}" are currently closed.`);
    }

    const applicationNo = this.generateApplicationNo();

    const applicationRecord = await this.careerApplicationRepository.create({
      ...applyCareerDto,
      postTitle: post.title,
      applicationNo,
      isRead: false,
    });

    return applicationRecord;
  }

  async findAll(queryDto: PaginationQueryDto = {}, postId?: string, status?: string, isRead?: boolean) {
    const additionalFilter: Record<string, any> = {};
    if (postId) additionalFilter.postId = postId;
    if (status) additionalFilter.status = status;
    if (typeof isRead === 'boolean') additionalFilter.isRead = isRead;

    return this.careerApplicationRepository.findAll(
      queryDto,
      ['fullName', 'email', 'phone', 'postTitle', 'applicationNo'],
      additionalFilter,
    );
  }

  async getUnreadNotifications(limit = 10) {
    const [unreadCount, recentItems] = await Promise.all([
      this.careerApplicationRepository.countUnread(),
      this.careerApplicationRepository.getRecentUnread(limit),
    ]);

    return {
      unreadCount,
      items: recentItems,
    };
  }

  async markAllAsRead() {
    return this.careerApplicationRepository.markAllAsRead();
  }

  async findOne(id: string) {
    return this.careerApplicationRepository.findById(id);
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    return this.careerApplicationRepository.update(id, dto);
  }

  async remove(id: string) {
    try {
      const app = await this.careerApplicationRepository.findById(id);
      if (app && app.resumeUrl) {
        await this.uploadsService.deleteFileByUrl(app.resumeUrl);
      }
    } catch (err) {
      this.logger.warn(`Could not cleanup resume for application ${id}: ${err}`);
    }

    return this.careerApplicationRepository.delete(id);
  }
}
