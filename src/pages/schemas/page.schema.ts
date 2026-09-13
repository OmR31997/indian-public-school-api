import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { generatePublicId } from '../../common/utils/public-id';

export type PageDocument = Page & Document;

@Schema({ timestamps: true })
export class Page {
  @Prop({
    required: true,
    unique: true,
    index: true,
    default: () => generatePublicId('PAG'),
  })
  publicId!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true, default: '' })
  slug!: string;

  @Prop({ trim: true, default: '' })
  targetUrl?: string;

  @Prop({ default: '' })
  textContent?: string;

  @Prop({ default: 0 })
  order?: number;

  @Prop({ default: true })
  isPublished?: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
PageSchema.index({ slug: 1 });

