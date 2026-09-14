import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'Admission Open 2026-27' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '/admission/admission-procedure', required: false })
  @IsString()
  @IsOptional()
  redirectUrl?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/sample.pdf', required: false })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

