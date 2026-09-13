import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryStorageStrategy } from './strategies/cloudinary-storage.strategy';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
  imports: [ConfigModule, forwardRef(() => GalleryModule)],
  controllers: [UploadsController],
  providers: [CloudinaryStorageStrategy, LocalStorageStrategy, UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}

