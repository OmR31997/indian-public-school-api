import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsRepository } from './news.repository';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async create(createNewsDto: CreateNewsDto) {
    const payload = { ...createNewsDto };
    if (!payload.redirectUrl && payload.attachmentUrl) {
      payload.redirectUrl = payload.attachmentUrl;
    }
    return this.newsRepository.create(payload);
  }

  async findAll(queryDto: PaginationQueryDto = {}) {
    return this.newsRepository.findAll(queryDto, ['title', 'redirectUrl', 'attachmentUrl']);
  }

  async findOne(id: string) {
    return this.newsRepository.findById(id);
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    const payload = { ...updateNewsDto };
    if (!payload.redirectUrl && payload.attachmentUrl) {
      payload.redirectUrl = payload.attachmentUrl;
    }
    return this.newsRepository.update(id, payload);
  }

  async remove(id: string) {
    return this.newsRepository.delete(id);
  }
}
