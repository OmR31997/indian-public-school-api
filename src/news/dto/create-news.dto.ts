import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'Admission Open 2026-27' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '/admission/admission-procedure' })
  @IsString()
  @IsNotEmpty()
  redirectUrl: string;
}
