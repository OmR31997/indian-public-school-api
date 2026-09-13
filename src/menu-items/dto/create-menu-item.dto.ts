import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiPropertyOptional({ example: 'about', description: 'Unique section menu ID' })
  @IsString()
  @IsOptional()
  menuId?: string;

  @ApiProperty({ example: 'About Us', description: 'Menu title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'about', description: 'Unique slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: '60d5ec49f1b2c52d889b4567',
    description: 'Parent MenuItem Mongoose ID or menuId. If not provided, item is Level 1 (Root).',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({ example: '/#about', description: 'Navigation target URL' })
  @IsString()
  @IsOptional()
  targetUrl?: string;

  @ApiPropertyOptional({ example: 'Header', description: 'Menu category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 1, description: 'Sort order index' })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: true, description: 'Publication status' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'Building', description: 'Icon identifier' })
  @IsString()
  @IsOptional()
  icon?: string;
}
