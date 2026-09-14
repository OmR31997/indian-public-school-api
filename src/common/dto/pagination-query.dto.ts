import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Items limit per page (1-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'science', description: 'Search query string' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'createdAt', default: 'createdAt', description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', default: 'desc', enum: ['asc', 'desc'], description: 'Sort direction' })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC', '1', '-1', 1, -1])
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC' | '1' | '-1' | 1 | -1 = 'desc';

  @ApiPropertyOptional({ example: '{"status":"Active"}', description: 'JSON filter object string' })
  @IsOptional()
  @IsString()
  filter?: string;
}
