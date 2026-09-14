import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { generatePublicId } from '../../common/utils/public-id';

export type NewsDocument = News & Document;

@Schema({ timestamps: true })
export class News {
  @Prop({
    required: true,
    unique: true,
    index: true,
    default: () => generatePublicId('NEWS'),
  })
  publicId!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: false, trim: true, default: '' })
  redirectUrl?: string;

  @Prop({ required: false, trim: true, default: '' })
  attachmentUrl?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);
