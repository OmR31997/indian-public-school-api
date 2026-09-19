import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareerPost, CareerPostSchema } from './schemas/career-post.schema';
import { CareerApplication, CareerApplicationSchema } from './schemas/career-application.schema';
import { CareerPostRepository } from './repositories/career-post.repository';
import { CareerApplicationRepository } from './repositories/career-application.repository';
import { CareerPostsService } from './services/career-posts.service';
import { CareerApplicationsService } from './services/career-applications.service';
import { CareersController } from './careers.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerPost.name, schema: CareerPostSchema },
      { name: CareerApplication.name, schema: CareerApplicationSchema },
    ]),
    UploadsModule,
  ],
  controllers: [CareersController],
  providers: [
    CareerPostRepository,
    CareerApplicationRepository,
    CareerPostsService,
    CareerApplicationsService,
  ],
  exports: [CareerPostsService, CareerApplicationsService],
})
export class CareersModule {}
