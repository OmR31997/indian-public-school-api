import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CustomFieldDto {
  @ApiProperty({ example: 'experience', description: 'Unique key identifier for field' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'Experience Required', description: 'Label displayed in table or form' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ example: '3+ Years', description: 'Value for post details column' })
  @IsString()
  @IsOptional()
  value?: string;
}

export class ApplicationFieldDto {
  @ApiProperty({ example: 'notice_period', description: 'Unique key identifier for question' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'What is your notice period?', description: 'Label for applicant form field' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'text', description: 'Input type (text, number, email, file, select, textarea)' })
  @IsString()
  @IsNotEmpty()
  type: 'text' | 'number' | 'email' | 'file' | 'select' | 'textarea';

  @ApiPropertyOptional({ example: true, description: 'Whether the field is required' })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ example: ['Immediate', '15 Days', '1 Month'], description: 'Dropdown options if select type' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

export class CreateCareerPostDto {
  @ApiProperty({ example: 'PGT Physics Teacher', description: 'Name of post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'M.Sc Physics + B.Ed with minimum 3 years experience', description: 'Qualification required' })
  @IsString()
  @IsNotEmpty()
  qualification: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/v1234/post.jpg', description: 'Post image URL' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'Looking for a dedicated Physics teacher for senior secondary classes.', description: 'Detailed job description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [CustomFieldDto], description: 'Dynamic custom fields displayed as table columns' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields?: CustomFieldDto[];

  @ApiPropertyOptional({ type: [ApplicationFieldDto], description: 'Dynamic application questions for candidate form' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ApplicationFieldDto)
  applicationFields?: ApplicationFieldDto[];

  @ApiPropertyOptional({ example: true, description: 'Post status (open or closed)' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Display order sorting value' })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
