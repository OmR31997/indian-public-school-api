import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareerPostDocument = CareerPost & Document;

export class CustomFieldDefinition {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  label: string;

  @Prop({ default: '' })
  value: string;
}

export class ApplicationFieldDefinition {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true, default: 'text' })
  type: 'text' | 'number' | 'email' | 'file' | 'select' | 'textarea';

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: [String], default: [] })
  options?: string[];
}

@Schema({ timestamps: true })
export class CareerPost {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  qualification: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Array, default: [] })
  customFields: CustomFieldDefinition[];

  @Prop({ type: Array, default: [] })
  applicationFields: ApplicationFieldDefinition[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CareerPostSchema = SchemaFactory.createForClass(CareerPost);
