import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/repositories/base.repository';
import { Gallery, GalleryDocument } from './schemas/gallery.schema';

@Injectable()
export class GalleryRepository extends BaseRepository<GalleryDocument> {
  constructor(
    @InjectModel(Gallery.name)
    private readonly galleryModel: Model<GalleryDocument>,
  ) {
    super(galleryModel);
  }
}
