import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsRepository } from './news.repository';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async create(createNewsDto: CreateNewsDto) {
    return this.newsRepository.create(createNewsDto);
  }

  async findAll(queryDto: PaginationQueryDto = {}) {
    return this.newsRepository.findAll(queryDto, ['title', 'redirectUrl']);
  }

  async findOne(id: string) {
    return this.newsRepository.findById(id);
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    return this.newsRepository.update(id, updateNewsDto);
  }

  async remove(id: string) {
    return this.newsRepository.delete(id);
  }
}
