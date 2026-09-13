import { Injectable, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryStorageStrategy } from './strategies/cloudinary-storage.strategy';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { GalleryRepository } from '../gallery/gallery.repository';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { extractCloudinaryPublicId } from './utils/cloudinary-helper';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryStrategy: CloudinaryStorageStrategy,
    private readonly localStorageStrategy: LocalStorageStrategy,
    @Inject(forwardRef(() => GalleryRepository))
    private readonly galleryRepository: GalleryRepository,
  ) {}

  async deleteFileByUrl(url: string): Promise<boolean> {
    if (!url || typeof url !== 'string') return false;

    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'cloudinary');

    if (provider === 'cloudinary') {
      const publicId = extractCloudinaryPublicId(url);
      if (publicId) {
        this.logger.log(`Deleting Cloudinary asset with public ID: ${publicId}`);
        return this.cloudinaryStrategy.deleteFile(publicId);
      }
    } else {
      const filename = url.replace(/^\/uploads\//, '');
      if (filename) {
        this.logger.log(`Deleting local storage file: ${filename}`);
        return this.localStorageStrategy.deleteFile(filename);
      }
    }

    return false;
  }

  async upload(file: Express.Multer.File, album: string = 'General', altText?: string, folder?: string) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file or empty file buffer provided');
    }

    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'cloudinary');
    const strategy = provider === 'cloudinary' ? this.cloudinaryStrategy : this.localStorageStrategy;

    const targetFolder = folder || (album && album !== 'General' ? `indian-public-school/assets/${album}` : 'indian-public-school');
    const result = await strategy.uploadFile(file, targetFolder);

    let fileType: 'image' | 'pdf' | 'video' | 'document' = 'document';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype === 'application/pdf') fileType = 'pdf';

    const directoryPath = folder ? `/${folder.replace(/^\/+/, '')}` : `/album/${(album || 'General').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const asset = await this.galleryRepository.create({
      eventName: file.originalname,
      fileUrl: [result.url],
      eventType: album || 'General',
      directory: directoryPath,
    });

    const plainAsset = typeof (asset as any).toObject === 'function' ? (asset as any).toObject() : asset;

    return {
      ...plainAsset,
      url: result.url,
      fileUrl: asset.fileUrl || [result.url],
      key: result.key,
      provider: result.provider,
    };
  }

  async findAll(queryDto: PaginationQueryDto = {}, eventType?: string) {
    const additionalFilter: Record<string, any> = {};
    if (eventType) additionalFilter.eventType = eventType;

    return this.galleryRepository.findAll(
      queryDto,
      ['eventName', 'eventType'],
      additionalFilter,
    );
  }

  async findOne(id: string) {
    return this.galleryRepository.findById(id);
  }

  async remove(id: string) {
    try {
      const asset = await this.galleryRepository.findById(id);
      if (asset && Array.isArray(asset.fileUrl)) {
        for (const url of asset.fileUrl) {
          await this.deleteFileByUrl(url);
        }
      }
    } catch (err) {
      this.logger.warn(`Could not fetch asset ${id} for Cloudinary deletion prior to database removal: ${err}`);
    }

    return this.galleryRepository.delete(id);
  }

  async getCloudinaryResources(folder?: string) {
    return this.cloudinaryStrategy.listResources(folder);
  }
}

