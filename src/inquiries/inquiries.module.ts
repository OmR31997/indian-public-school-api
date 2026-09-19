import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { InquiryRepository } from './inquiry.repository';
import { Inquiry, InquirySchema } from './schemas/inquiry.schema';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }]),
    forwardRef(() => UploadsModule),
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService, InquiryRepository],
  exports: [InquiriesService, InquiryRepository],
})
export class InquiriesModule {}
