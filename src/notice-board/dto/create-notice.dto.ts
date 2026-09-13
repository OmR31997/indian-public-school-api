import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ example: 'Annual Sports Day Announcement', description: 'Notice title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Events',
    enum: ['Academic', 'Holiday', 'Events', 'Examination', 'General'],
    default: 'General',
    description: 'Notice category',
  })
  @IsOptional()
  @IsEnum(['Academic', 'Holiday', 'Events', 'Examination', 'General'])
  category?: 'Academic' | 'Holiday' | 'Events' | 'Examination' | 'General';

  @ApiProperty({
    example: 'Annual sports day will be held on 25th October. All students must register.',
    description: 'Notice content / description body',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'High',
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    description: 'Notice priority level',
  })
  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Urgent'])
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';

  @ApiPropertyOptional({ example: 'All Students & Parents', description: 'Target audience scope' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00Z', description: 'Publish date (ISO format)' })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiPropertyOptional({ example: '2026-10-30T00:00:00Z', description: 'Expiry date (ISO format)' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Publication visibility status' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/v1/circular.pdf', description: 'Attachment PDF/Document URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
