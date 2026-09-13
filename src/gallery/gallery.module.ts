import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gallery, GallerySchema } from './schemas/gallery.schema';
import { GalleryRepository } from './gallery.repository';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gallery.name, schema: GallerySchema }]),
    forwardRef(() => UploadsModule),
  ],
  controllers: [GalleryController],
  providers: [GalleryRepository, GalleryService],
  exports: [GalleryService, GalleryRepository],
})
export class GalleryModule {}

