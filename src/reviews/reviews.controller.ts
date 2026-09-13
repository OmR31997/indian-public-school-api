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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new review' })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default sample review records' })
  seed() {
    return this.reviewsService.seedDefaultReviews();
  }

  @Get()
  @ApiOperation({ summary: 'List review feedback records with filters (rating, batch, isApproved)' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by star rating (1-5)' })
  @ApiQuery({ name: 'batch', required: false, type: String, description: 'Filter by batch' })
  @ApiQuery({ name: 'isApproved', required: false, type: Boolean, description: 'Filter by approval status' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('rating') rating?: number,
    @Query('batch') batch?: string,
    @Query('isApproved') isApproved?: boolean,
  ) {
    return this.reviewsService.findAll(queryDto, rating, batch, isApproved);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review detail by ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a review record by ID' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review record by ID' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
