import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  INQUIRY = 'INQUIRY',
  CAREER_APPLICATION = 'CAREER_APPLICATION',
  GENERAL = 'GENERAL',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    default: NotificationType.GENERAL,
    index: true,
  })
  type!: NotificationType;

  @Prop({ type: String, default: '', index: true })
  referenceId?: string;

  @Prop({ type: String, default: '' })
  referenceType?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ type: Boolean, default: false, index: true })
  isRead!: boolean;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
