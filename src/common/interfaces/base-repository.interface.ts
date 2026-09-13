import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResult } from './paginated-result.interface';

export interface IBaseRepository<T> {
  create(createDto: any): Promise<T>;
  findAll(
    queryDto?: PaginationQueryDto,
    searchableFields?: string[],
    additionalFilter?: Record<string, any>,
  ): Promise<PaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  update(id: string, updateDto: any): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  count(filter?: Record<string, any>): Promise<number>;
}
