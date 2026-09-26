import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApplicationCandidateStatus } from '../schemas/career-application.schema';

export class UpdateApplicationStatusDto {
  @ApiPropertyOptional({ enum: ApplicationCandidateStatus, example: ApplicationCandidateStatus.SHORTLISTED })
  @IsOptional()
  @IsEnum(ApplicationCandidateStatus)
  status?: ApplicationCandidateStatus;

  @ApiPropertyOptional({ example: true, description: 'Mark application as read' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
