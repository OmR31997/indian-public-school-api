import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NoticeDocument = Notice & Document;

@Schema({ timestamps: true })
export class Notice {
  @Prop({ required: true })
  title!: string;

  @Prop({
    enum: ['Academic', 'Holiday', 'Events', 'Examination', 'General'],
    default: 'General',
  })
  category!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' })
  priority!: string;

  @Prop({ default: 'ALL' })
  targetAudience!: string;

  @Prop({ default: Date.now })
  publishDate!: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ default: true })
  isPublished!: boolean;

  @Prop()
  attachmentUrl?: string;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
