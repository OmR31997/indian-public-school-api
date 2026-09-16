import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageStrategy, UploadResult } from './storage-strategy.interface';

@Injectable()
export class CloudinaryStorageStrategy implements IStorageStrategy {
  private readonly logger = new Logger(CloudinaryStorageStrategy.name);
  private cache: Map<string, { timestamp: number; data: any[] }> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache to prevent hitting 500 ops/hr rate limit
  private rateLimitUntil: number = 0;

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private invalidateCache() {
    this.cache.clear();
    this.rateLimitUntil = 0;
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'indian-public-school'): Promise<UploadResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Empty file or missing file buffer provided');
    }

    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');

    const isMedia = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

    const doUpload = (resourceType: 'auto' | 'image' | 'raw'): Promise<UploadResult> => {
      return new Promise((resolve, reject) => {
        const cleanName = file.originalname.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_');
        const options: Record<string, any> = {
          folder,
          resource_type: resourceType,
        };

        if (resourceType === 'raw' || isPdf) {
          options.public_id = `${Date.now()}_${cleanName}`;
        } else {
          options.use_filename = true;
          options.unique_filename = true;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              this.logger.error(`Cloudinary upload error (resource_type=${resourceType}, filename=${file.originalname}):`, error);
              return reject(error);
            }
            if (!result) {
              return reject(new Error('Cloudinary upload returned null result'));
            }
            let finalUrl = result.secure_url;
            if (isPdf && finalUrl && !finalUrl.toLowerCase().endsWith('.pdf')) {
              // Ensure PDF secure_url has .pdf extension if omitted by public_id
              const hashIdx = finalUrl.indexOf('#');
              const queryIdx = finalUrl.indexOf('?');
              const splitIdx = Math.min(
                queryIdx !== -1 ? queryIdx : finalUrl.length,
                hashIdx !== -1 ? hashIdx : finalUrl.length,
              );
              const basePath = finalUrl.slice(0, splitIdx);
              const suffix = finalUrl.slice(splitIdx);
              if (!basePath.toLowerCase().endsWith('.pdf')) {
                finalUrl = `${basePath}.pdf${suffix}`;
              }
            }

            this.invalidateCache();
            resolve({
              url: finalUrl,
              key: result.public_id,
              provider: 'cloudinary',
            });
          },
        );

        const readStream = Readable.from(file.buffer);
        readStream.pipe(uploadStream);
      });
    };

    if (isPdf) {
      try {
        return await doUpload('image');
      } catch (err: any) {
        this.logger.warn(`Cloudinary 'image' upload failed for PDF ${file.originalname} (${err?.message || err}). Retrying with 'auto'...`);
        try {
          return await doUpload('auto');
        } catch {
          return await doUpload('raw');
        }
      }
    }

    if (!isMedia) {
      try {
        return await doUpload('raw');
      } catch (err: any) {
        this.logger.warn(`Cloudinary 'raw' upload failed for ${file.originalname} (${err?.message || err}). Retrying with resource_type='auto'...`);
        return await doUpload('auto');
      }
    }

    try {
      return await doUpload('auto');
    } catch (err: any) {
      return await doUpload('image');
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      this.invalidateCache();
      // 1. Try image resource_type
      let result = await cloudinary.uploader.destroy(key, { resource_type: 'image' });
      if (result && result.result === 'ok') return true;

      // 2. Try video resource_type
      result = await cloudinary.uploader.destroy(key, { resource_type: 'video' });
      if (result && result.result === 'ok') return true;

      // 3. Try raw resource_type (PDF, zip, doc, etc.)
      result = await cloudinary.uploader.destroy(key, { resource_type: 'raw' });
      return result && result.result === 'ok';
    } catch (err) {
      this.logger.error(`Error deleting Cloudinary asset ${key}`, err);
      return false;
    }
  }

  async listResources(folder?: string): Promise<Array<{ id: string; url: string; title: string; category: string; resourceType: string; format: string }>> {
    const cacheKey = folder || '__ALL__';
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Serve cached data if within TTL
    if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
      return cached.data;
    }

    // If Cloudinary rate limit was recently triggered, return cached or empty without calling Cloudinary API
    if (now < this.rateLimitUntil) {
      return cached ? cached.data : [];
    }

    const fetchWithRetry = async (retries = 2, delayMs = 500): Promise<any> => {
      for (let i = 0; i <= retries; i++) {
        try {
          const options: Record<string, any> = {
            max_results: 100,
            type: 'upload',
          };
          if (folder) {
            options.prefix = folder;
          }
          return await cloudinary.api.resources(options);
        } catch (err: any) {
          const isRateLimit = err?.error?.http_code === 420 || err?.http_code === 420 || err?.message?.includes('Rate Limit Exceeded');
          if (isRateLimit) {
            // Do not retry on rate limit errors
            throw err;
          }

          const isNetworkError = err?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET');
          if (i < retries && isNetworkError) {
            this.logger.warn(`Cloudinary Admin API connection reset (${err?.code || err?.message}), retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
            await new Promise((res) => setTimeout(res, delayMs));
            continue;
          }
          throw err;
        }
      }
    };

    try {
      const res = await fetchWithRetry();
      const resources = res?.resources || [];
      const expiresAt = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 3600;
      const formatted = resources.map((r: any) => {
        let assetUrl = r.secure_url || r.url || '';
        const isPdf = r.format === 'pdf' || (r.public_id || '').toLowerCase().endsWith('.pdf');
        if (isPdf && assetUrl && !assetUrl.toLowerCase().endsWith('.pdf')) {
          assetUrl = `${assetUrl}.pdf`;
        }
        return {
          id: r.public_id || r.asset_id,
          url: assetUrl,
          title: (r.public_id || '').split('/').pop() || 'Cloudinary Asset',
          category: (r.folder || r.public_id || '').includes('/') ? (r.public_id || '').split('/').slice(0, -1).pop() || 'Assets' : 'General',
          resourceType: r.resource_type || 'image',
          format: r.format || '',
        };
      });

      this.cache.set(cacheKey, { timestamp: now, data: formatted });
      return formatted;
    } catch (err: any) {
      const isRateLimit = err?.error?.http_code === 420 || err?.http_code === 420 || err?.message?.includes('Rate Limit Exceeded') || String(err).includes('Rate Limit Exceeded');
      
      if (isRateLimit) {
        // Lockout for 10 minutes on Rate Limit 420
        this.rateLimitUntil = now + 10 * 60 * 1000;
        this.logger.warn(`Cloudinary Admin API 500 ops/hr rate limit reached. Serving cached assets for 10 minutes until rate limit resets.`);
      } else {
        const errorDetail = err?.error?.message || err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        this.logger.warn(`Could not fetch direct Cloudinary resources via Admin API: ${errorDetail}`);
      }

      if (cached) {
        return cached.data;
      }
      return [];
    }
  }
}
