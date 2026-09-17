import { Injectable, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryStorageStrategy } from './strategies/cloudinary-storage.strategy';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { GalleryRepository } from '../gallery/gallery.repository';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { extractCloudinaryPublicId, formatFileSizeErrorMessage } from './utils/cloudinary-helper';
import { FileCompressorService } from './services/file-compressor.service';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryStrategy: CloudinaryStorageStrategy,
    private readonly localStorageStrategy: LocalStorageStrategy,
    private readonly fileCompressorService: FileCompressorService,
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

    // Compress file visually losslessly before pushing to storage provider
    const processedFile = await this.fileCompressorService.compress(file);

    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'cloudinary');

    const isDoc =
      processedFile.mimetype === 'application/pdf' ||
      processedFile.originalname.toLowerCase().endsWith('.pdf') ||
      (!processedFile.mimetype.startsWith('image/') && !processedFile.mimetype.startsWith('video/'));

    let targetFolder: string;
    if (folder && folder.trim()) {
      let rawFolder = folder.trim().replace(/^\/+/, '');
      if (rawFolder.toLowerCase().startsWith('album/')) {
        const subFolder = rawFolder.replace(/^album\//i, '');
        const formattedSub = subFolder ? subFolder.charAt(0).toUpperCase() + subFolder.slice(1) : 'General';
        targetFolder = `indian-public-school/assets/${formattedSub}`;
      } else if (rawFolder.toLowerCase().startsWith('indian-public-school/assets/')) {
        targetFolder = rawFolder;
      } else if (!rawFolder.includes('/')) {
        const formattedName = rawFolder.charAt(0).toUpperCase() + rawFolder.slice(1);
        targetFolder = `indian-public-school/assets/${formattedName}`;
      } else {
        targetFolder = rawFolder;
      }
    } else if (album && album !== 'General' && album !== 'Galleries' && album !== 'Gallery') {
      targetFolder = `indian-public-school/assets/${album}`;
    } else if (isDoc) {
      targetFolder = `indian-public-school/assets/Documents`;
    } else {
      targetFolder = `indian-public-school/assets/General`;
    }

    let result: import('./strategies/storage-strategy.interface').UploadResult;

    try {
      const strategy = provider === 'cloudinary' ? this.cloudinaryStrategy : this.localStorageStrategy;
      result = await strategy.uploadFile(processedFile, targetFolder);
    } catch (err: any) {
      const rawMsg = err?.message || err?.error?.message || (typeof err === 'string' ? err : String(err)) || 'Unknown upload error';
      const formattedMsg = formatFileSizeErrorMessage(rawMsg);
      this.logger.error(`Storage provider (${provider}) upload failed for "${processedFile?.originalname}": ${formattedMsg}`);
      throw new BadRequestException(`Cloudinary upload failed: ${formattedMsg}`);
    }

    let fileType: 'image' | 'pdf' | 'video' | 'document' = 'document';
    if (processedFile.mimetype.startsWith('image/')) fileType = 'image';
    else if (processedFile.mimetype.startsWith('video/')) fileType = 'video';
    else if (processedFile.mimetype === 'application/pdf') fileType = 'pdf';

    const eventType = isDoc ? (album && album !== 'General' ? album : 'Documents') : (album || 'General');
    const directoryPath = folder && folder.trim()
      ? (folder.trim().startsWith('/') ? folder.trim() : `/${folder.trim()}`)
      : isDoc
      ? 'indian-public-school/assets/Documents'
      : `/album/${(album || 'General').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const asset = await this.galleryRepository.create({
      eventName: processedFile.originalname,
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
    if (id.startsWith('cdn-') || id.includes('http') || id.includes('/')) {
      let targetUrl = id.replace(/^cdn-/, '');

      const existing = await this.galleryRepository.findAll(
        { page: 1, limit: 10 },
        [],
        { fileUrl: { $in: [targetUrl] } },
      );
      const items = existing.items || (existing as any).data || [];

      for (const doc of items) {
        const docId = (doc as any)._id || (doc as any).id;
        if (docId) {
          await this.galleryRepository.delete(String(docId));
        }
      }

      await this.deleteFileByUrl(targetUrl);
      return { deleted: true, id };
    }

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

