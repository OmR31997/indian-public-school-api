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

    const isDoc =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf') ||
      (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/'));

    let targetFolder: string;
    if (folder) {
      targetFolder = folder;
    } else if (album && album !== 'General') {
      targetFolder = `indian-public-school/assets/${album}`;
    } else if (isDoc) {
      targetFolder = `indian-public-school/assets/Documents`;
    } else {
      targetFolder = `indian-public-school/assets/General`;
    }

    let result: import('./strategies/storage-strategy.interface').UploadResult;

    try {
      const strategy = provider === 'cloudinary' ? this.cloudinaryStrategy : this.localStorageStrategy;
      result = await strategy.uploadFile(file, targetFolder);
    } catch (err: any) {
      this.logger.error(`Storage provider (${provider}) upload failed for "${file?.originalname}": ${err?.message || err}`);
      throw new BadRequestException(`Cloudinary upload failed: ${err?.message || err || 'Unknown upload error'}`);
    }

    let fileType: 'image' | 'pdf' | 'video' | 'document' = 'document';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype === 'application/pdf') fileType = 'pdf';

    const eventType = isDoc ? (album && album !== 'General' ? album : 'Documents') : (album || 'General');
    const directoryPath = folder
      ? `/${folder.replace(/^\/+/, '')}`
      : isDoc
      ? 'indian-public-school/assets/Documents'
      : `/album/${(album || 'General').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const asset = await this.galleryRepository.create({
      eventName: file.originalname,
      fileUrl: [result.url],
      eventType: eventType,
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

