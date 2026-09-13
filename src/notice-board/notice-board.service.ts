import { Injectable } from '@nestjs/common';
import { NoticeRepository } from './notice.repository';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class NoticeBoardService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async create(createNoticeDto: CreateNoticeDto) {
    return this.noticeRepository.create(createNoticeDto);
  }

  async findAll(
    queryDto: PaginationQueryDto = {},
    category?: string,
    priority?: string,
    isPublished?: boolean,
  ) {
    const additionalFilter: Record<string, any> = {};
    if (category) additionalFilter.category = category;
    if (priority) additionalFilter.priority = priority;
    if (typeof isPublished !== 'undefined') additionalFilter.isPublished = isPublished;

    return this.noticeRepository.findAll(
      queryDto,
      ['title', 'content', 'category', 'targetAudience'],
      additionalFilter,
    );
  }

  async findOne(id: string) {
    return this.noticeRepository.findById(id);
  }

  async update(id: string, updateNoticeDto: UpdateNoticeDto) {
    return this.noticeRepository.update(id, updateNoticeDto);
  }

  async remove(id: string) {
    return this.noticeRepository.delete(id);
  }
}
