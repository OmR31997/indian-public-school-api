import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { InquiryRepository } from './inquiry.repository';
import { Inquiry, InquirySchema } from './schemas/inquiry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }]),
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService, InquiryRepository],
  exports: [InquiriesService, InquiryRepository],
})
export class InquiriesModule {}
