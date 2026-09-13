import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'admin@school.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Principal Admin',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Admin@123456',
    description: 'Account password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'Sub Admin',
    default: 'Sub Admin',
    description: 'Role assigned to the user (Super Admin or Sub Admin)',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: ['students', 'notices', 'gallery'],
    description: 'List of module keys accessible by this user',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedModules?: string[];

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
    description: 'Avatar image URL',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
