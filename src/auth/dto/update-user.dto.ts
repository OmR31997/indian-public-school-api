import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'admin@school.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Vice Principal',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123',
    description: 'Account password (minimum 6 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'Sub Admin',
    description: 'Role assigned to user (Super Admin or Sub Admin)',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: ['students:access', 'students:update', 'students:delete'],
    description: 'List of fine-grained component permission strings e.g. <component>:access, <component>:update, <component>:delete',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedModules?: string[];

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'User account status (ACTIVE, INACTIVE, SUSPENDED)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
    description: 'Avatar image URL',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
