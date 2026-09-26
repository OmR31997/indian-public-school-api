import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CareerPostRepository } from '../repositories/career-post.repository';
import { CreateCareerPostDto } from '../dto/create-career-post.dto';
import { UpdateCareerPostDto } from '../dto/update-career-post.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UploadsService } from '../../uploads/uploads.service';

@Injectable()
export class CareerPostsService {
  private readonly logger = new Logger(CareerPostsService.name);

  constructor(
    private readonly careerPostRepository: CareerPostRepository,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(createCareerPostDto: CreateCareerPostDto) {
    return this.careerPostRepository.create(createCareerPostDto);
  }

  async findAll(queryDto: PaginationQueryDto = {}, isActive?: boolean) {
    const filter: Record<string, any> = {};
    if (typeof isActive === 'boolean') {
      filter.isActive = isActive;
    }
    return this.careerPostRepository.findAll(queryDto, ['title', 'qualification', 'description'], filter);
  }

  async findActiveOpenings() {
    return this.careerPostRepository.findActiveOpenings();
  }

  async findOne(id: string) {
    return this.careerPostRepository.findById(id);
  }

  async update(id: string, updateCareerPostDto: UpdateCareerPostDto) {
    return this.careerPostRepository.update(id, updateCareerPostDto);
  }

  async remove(id: string) {
    try {
      const post = await this.careerPostRepository.findById(id);
      if (post && post.image) {
        await this.uploadsService.deleteFileByUrl(post.image);
      }
    } catch (err) {
      this.logger.warn(`Failed to cleanup post image for ${id}: ${err}`);
    }

    return this.careerPostRepository.delete(id);
  }
}
